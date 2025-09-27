import '@xyflow/react/dist/style.css';
import { useCallback,  useEffect } from 'react';
import '../styles/MapEditor.css';
import MapCanvas from './MapCanvas';
import MapSidebar from './MapSidebar';
import { type MapEditorProps} from '../types/types';
import { useDataMap } from '../hooks/useMapData';
import useGetApp from '../hooks/useGetApp';
const MapEditor: React.FC<MapEditorProps> = ({ setIsEditNote }) => {
    const { startUp } = useGetApp();
    //Functions and variables from map hook
    const { userID, handleEdgeClick, onNodesDelete, handleSelectAll, handleUnselect, handleNodeClick, handlePaneClick, handleAddTerm, nodeTypes, currTerm, setCurrTerm, nodes, edges, onNodesChange, onEdgesChange, onConnect, edgeTypes } = useDataMap();
    console.log(userID)
    //handle get nodes and edges on startup
    useEffect(()=>{
        startUp();
    }, [startUp])
    
    const handleEditNotes = useCallback((id: string) => {
        if (id === null) return;
        setIsEditNote((prev: boolean) => !prev)
        }, [setIsEditNote]
    );
  
    return (
    <div className='map-editor'>      
        <MapCanvas 
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes} 
            edgeTypes={edgeTypes}
            handleNodeClick={handleNodeClick}
            handleEdgeClick={handleEdgeClick}
            handlePaneClick={handlePaneClick} 
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect} 
            onNodesDelete={onNodesDelete} />
        <MapSidebar 
            handleUnselect={handleUnselect}
            nodes={nodes}
            currTerm={currTerm}
            setCurrTerm={setCurrTerm}
            handleAddTerm={handleAddTerm}
            handleSelectAll={handleSelectAll} 
            handleEditNotes={handleEditNotes} />
    </div>

    )
}
export default MapEditor;
