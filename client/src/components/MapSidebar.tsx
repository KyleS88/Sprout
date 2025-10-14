import '../styles/MapEditor.css'
import { type MySidebarProps } from '../types/types'
import { useDataMap, apiUrl} from '../hooks/useMapData'
import axios from 'axios'
import { useCallback, useEffect} from 'react'
import useDebounce from '../hooks/useDebounce'
import useAuthData from '../hooks/useAuthData'

/**
 * MapSidebar
 *
 * Sidebar UI for map interactions:
 * - Create/select/delete nodes/edges
 * - Edit notes for the current selection (node or edge) with debounced API updates
 * - Manages local view state (visibleNote, editContext) and auth sign-out
 *
 * Behavior:
 * - When `editContext.kind` changes, loads the correct note into `visibleNote` and focuses the textarea
 * - Textarea edits:
 *    - Immediately update local store (setNote, setVisibleNote)
 *    - Debounced PATCH to API via handleUpdateNodeNote/handleUpdateEdgeNote
 * - “Remove” deletes the currently edited node(s)/edge(s) both server-side and locally
 * - “Logout” clears auth state/token
 *
 * Requirements:
 * - useDataMap provides store state and actions for nodes/edges and notes
 * - useAuthData exposes setIsAuthenticated/setToken
 */

const MapSidebar: React.FC<MySidebarProps> = (props) => {
    const { setUserID, editNoteRef, setVisibleNote, visibleNote, setEditContext, handleFocusInput, deleteEdge, setIsEdgeEditing, editContext, setIsNodeEditing, isNodeEditing, deleteNode, handleUpdateNodeNote, handleUpdateEdgeNote, currentNode, setNote, isEdgeEditing, edges} = useDataMap();
    const { setIsAuthenticated, setToken } = useAuthData();
    useEffect(() => {
        switch (editContext.kind) {
            case 'node':
                setVisibleNote(currentNode?.data.note || '');
                handleFocusInput();
                break;
            case 'edge': {
                editNoteRef.current?.focus();
                const edge = edges.find(e => e.id === editContext.id);
                setVisibleNote(edge?.data.note ?? 'An error has occur please refresh page');
                break;
            }
            default:
                setVisibleNote('');
                editNoteRef.current?.blur();
            };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [editContext, setVisibleNote]);

    const handleRemoveCurrent = async (): Promise<void> => {
        if (!isNodeEditing.length && !isEdgeEditing.length) {
            console.log("Please select a node/ edge to delete");
            return;
        }
        const editKind: string | null = editContext.kind;
        console.log(editKind)
        try {
            setVisibleNote("");
            if (editKind === 'node') {
                await axios.delete(`${apiUrl}user/nodes/`, {
                data: { nodes: isNodeEditing }
            });
            setIsNodeEditing("Remove current editing node", false);
            deleteNode(isNodeEditing);
            } else if (editKind === 'edge') {
                await axios.delete(`${apiUrl}user/edges/`, {
                data: { edges: isEdgeEditing }
            });
            setIsEdgeEditing("Remove current editing edge", false);
            deleteEdge(isEdgeEditing);
            setEditContext({kind: null});
            }
        } catch (error: unknown) {
            setVisibleNote("AN ERROR HAS OCCURED PLEASE REFRESH THE PAGE");
            setEditContext({kind: null});
            console.log("Cannot complete deletion transaction");
            console.error(error);
        }
    };
    const handleUpdateEdgeNoteDebounce = useDebounce(handleUpdateEdgeNote, 500);
    const handleUpdateNodeNoteDebounce = useDebounce(handleUpdateNodeNote, 500);
    
    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>): void => {
        console.log(e.target.value)
        const editKind = editContext.kind;
        setVisibleNote(e.target.value);
        if (editKind === 'node'){
            handleUpdateNodeNoteDebounce(currentNode?.id, e.target.value);
            if (currentNode) setNote(currentNode.id, e.target.value, true);
        } else if (editKind === 'edge'){
            handleUpdateEdgeNoteDebounce(editContext.id, e.target.value);
            setNote(editContext.id, e.target.value, false);
        };
    }, [setVisibleNote, currentNode, editContext, handleUpdateNodeNoteDebounce, handleUpdateEdgeNoteDebounce, setNote]);

    const handleSignout = () => {
        localStorage.removeItem("token")
        setUserID("");
        setIsAuthenticated(false);
        setToken("");
    }
    const addSymbol = <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="icon-plus">
            <path d="M12 5v14M5 12h14"/>
        </svg>
    const trashSymbol = <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="icon-trash">
            <path d="M3 6h18"/>
            <path d="M19 6l-1 14H6L5 6"/>
            <path d="M9 6V4h6v2"/>
            <path d="M10 11v6M14 11v6"/>
        </svg>
    const logoutSymbol = <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="icon-logout">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
        <path d="M16 17l5-5-5-5"/>
        <path d="M21 12H9"/>
    </svg>


  return (
     <div className='rf-sidebar-border'>
        <h2 id='rf-tools-title'>Tools</h2>
        <div className='rf-ui'>
            <div id="rf-tool-section">
                {/* edit the handleEditNotes to update the data in client with corresponding data in backend */}
                <button id='rf-add-term-btn' onClick={props.handleAddTerm}>{addSymbol} Add Term</button>
                <button id='rf-select-all' onClick={props.handleSelectAll}>&#9776; Select All</button>
                <button id='rf-remove-btn' onClick={handleRemoveCurrent}>{trashSymbol} Remove</button>
                <button id="logout" onClick={handleSignout}> {logoutSymbol} Logout</button>
            </div>
            <div id="rf-notes-section">
                <h4>Note</h4>
                <textarea name="note" id="note" className="note" value={isEdgeEditing.length>0 || isNodeEditing.length > 0? visibleNote: ''} placeholder='Enter your note for the node or connection here' ref={editNoteRef} readOnly={editContext.kind === null} onChange={(e) => handleInputChange(e)}></textarea>
                <button id='rf-edit-notes' onClick={(e)=>(editContext.kind?props.handleEditNotes(editContext.id): null, e.preventDefault())}>Expand Note</button>
            </div>
        </div>  
    </div>
    )
}

export default MapSidebar