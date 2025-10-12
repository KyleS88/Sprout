import { useCallback, useMemo, useState, useRef} from 'react';
import {
    type OnNodesDelete,
    type OnConnect,
    type OnEdgesChange,
    type OnNodesChange,
    type Node,
} from '@xyflow/react';
import useStore from '../store/mapStore';
import { v4 as uuidv4 } from 'uuid';
import { type AppNode, type ResizeNodeProps, type AppEdge,  type EditContext} from '../types/types';
import axios, { type AxiosResponse } from 'axios';
import ResizeNode from '../components/ReactFlowComponents/ResizeNode';
import EditEdge from '../components/ReactFlowComponents/EditEdge';
export const apiUrl: string = "http://localhost:5174/api/";

/**
 * useDataMap
 * Central hook for React Flow data + UI interactions.
 *
 * Responsibilities:
 * - Exposes nodes/edges state from the map store (Zustand) and mutators.
 * - Coordinates React Flow handlers (onNodesChange/onEdgesChange/onConnect).
 * - Performs side effects to the API (create/update/delete nodes/edges).
 * - Manages selection/editing context for nodes/edges (editContext, is*Editing).
 *
 * Server contracts:
 * - Requires a valid `userId` in the store for write ops.
 * - Uses `${apiUrl}` endpoints:
 *   - POST   user/nodes/                  (create)
 *   - PATCH  user/nodes/                  (update size/label)
 *   - PATCH  user/nodes/note/:nodeId/     (update node note)
 *   - PATCH  user/edges/note/:edgeId/     (update edge note)
 *   - DELETE user/nodes                   (bulk delete by ids)
 *
 * Error handling:
 * - Network errors are caught and logged; state rolls forward optimistically.
 * - `handleUpdateSize`/`handleUpdateNodeLabel` throw if id not found.
 *
 * Usage:
 * const {
 *   nodes, edges, nodeTypes, edgeTypes,
 *   handleAddTerm, handleUpdateNodeLabel, handleUpdateSize,
 *   handleUpdateNodeNote, handleUpdateEdgeNote,
 *   onNodesChange, onEdgesChange, onConnect,
 *   handleSelectAll, handleUnselect, handleNodeClick, handleEdgeClick, handlePaneClick,
 *   currentNode, editContext, isNodeEditing, isEdgeEditing, userID
 * } = useDataMap();
 */

export const useDataMap = () => {
    const userID: string = useStore((state)=>state.userId);
    const setUserID: (userId: string) => void = useStore((state)=>state.setUserID)
    const setNodes: (updater: AppNode[] | ((nodes: AppNode[]) => AppNode[])) => void = useStore((state) => state.setNodes);
    const nodes: AppNode[] = useStore((state) => state.nodes);
    const setEdges: (updater: AppEdge[] | ((nodes: AppEdge[]) => AppEdge[])) => void = useStore((state) => state.setEdges)
    const edges: AppEdge[] = useStore((state) => state.edges);
    const onNodesChange: OnNodesChange<AppNode> = useStore((state) => state.onNodesChange);
    const onEdgesChange: OnEdgesChange<AppEdge> = useStore((state) => state.onEdgesChange);
    const onConnect: OnConnect = useStore((state) => state.onConnect);
    const deleteNode: (edgeId: string[])=>void = useStore((state) => state.deleteNode);
    const deleteEdge: (edgeId: string[])=>void = useStore((state) => state.deleteEdge);
    const currentNode: AppNode | null = useStore((state) => state.currentNode);
    const setCurrentNode: (newCurrNode: AppNode | null)=>void = useStore((state) => state.setCurrentNode);
    const setEditContext: (ctx: EditContext)=>void = useStore((state)=> state.setEditContext);
    const editContext: EditContext = useStore((state)=>state.editContext);
    const visibleNote: string = useStore((state)=>state.visibleNote);
    const setVisibleNote: (note: string)=>void = useStore((state)=>state.setVisibleNote);
    const onNodesDelete: OnNodesDelete = useCallback(async (nodesToDelete: Node[]): Promise<void> => {
        const nodesIdToDelete: string[] = nodesToDelete.map((node) => node.id);
            try {
                await axios.delete(`${apiUrl}user/nodes`, {data: {nodes: nodesIdToDelete}})
                    deleteNode(nodesIdToDelete);
                
            } catch (err) {
                console.log(err);
            }
        }, [deleteNode]);
    const editNoteRef: React.RefObject<HTMLTextAreaElement | null> = useRef<HTMLTextAreaElement>(null);

    const setCurrentEdge = useStore((state) => state.setCurrentEdge);
    const currentEdge: AppEdge | null = useStore((state) => state.currentEdge);
    const inputRef = useRef<HTMLInputElement>(null);
    const setIsNodeEditing = useStore((state) => state.setIsNodeEditing);
    const isNodeEditing = useStore((state) => state.isNodeEditing);
    const setIsEdgeEditing = useStore((state) => state.setIsEdgeEditing);
    const isEdgeEditing = useStore((state) => state.isEdgeEditing)
    const [currTerm, setCurrTerm] = useState<string>('');

    const setNote = (id: string, note: string, isNode: boolean): void => {
        if (isNode) {
            setNodes((prevNodes) => prevNodes.map((node) => node.id === id? {...node, data: {...node.data, note}}: node));
        } else {
            const [sId, tId] = id.split('|');
            setEdges((prevEdges) => prevEdges.map((edge) => edge.source===sId || edge.source===tId || edge.target===sId || edge.target===tId? {...edge, data: {...edge.data, note}}: edge));
        };
    };
    const handleAddTerm = async (): Promise<void> => {
        const id = uuidv4();
        const node: AppNode = {
            id,
            type: 'ResizeNode',
            position: {x: window.innerWidth / 2, y: window.innerHeight / 2},
            data: {label: "", note: "", userId: userID},
            style:{
                height: 60, 
                width: 180, 
            },
        }
        setNodes((nodeSnapshot: AppNode[]) => ([...nodeSnapshot, node]));
        setCurrTerm('');
        try {
            console.log("post")
            await axios.post(`${apiUrl}user/nodes/`, { nodes: [node] }); 
            console.log("complete")

        } catch (err) {
            console.log(err.response.status, err.response.data);
        }
        
    };
    
    const handleUpdateSize = useCallback(async (nodeId: string, width: number| undefined, height: number | undefined, xPos: number, yPos: number): Promise<void> => {
        if (!nodeId || !width || !height) {
            throw new Error('Please input a valid width/height'); 
        };
        try {
            const patchArray: AppNode[] = [];
            setNodes((prevNodes: AppNode[]) => {
                const existNode: boolean = prevNodes.some((node) => node.id === nodeId);
                if (!existNode) {
                    throw new Error(`Current id: ${nodeId} does not match any existing node`);
                } else {
                    return prevNodes.map((node: AppNode) => {
                        if (node.id===nodeId) {
                            const updatedNode: AppNode = {...node, style: {width, height}, position: {x: xPos, y: yPos}};
                            patchArray[0] = updatedNode;
                            return updatedNode;
                        } return node;
                    });
                }
            });
            await axios.patch(`${apiUrl}user/nodes/`, {nodes: patchArray});
        } catch (err) {
            console.log(err);
        }
    }, [setNodes]);
    const handleUpdateNodeLabel = useCallback(async (nodeId: string, term: string): Promise<void> => {
        if (!nodeId) return;
        try {
            const patchArray: AppNode[] = [];
            setNodes((prevNodes) => {
                const existNode: boolean = prevNodes.some((node) => node.id === nodeId);
                if (!existNode) {
                    throw new Error(`Current id: ${nodeId} does not match any existing node`);
                } else {
                    return prevNodes.map((node)=> {
                        if (node.id === nodeId) {
                            const updatedNode: AppNode = {...node, data: {...node.data, label: term}};
                            patchArray[0] = updatedNode;
                            return updatedNode;
                        } return node;
                    });
                };
            });
            const res: AxiosResponse = await axios.patch(`${apiUrl}user/nodes/`, { nodes: patchArray} );
            // add a throw error clause for res if its a status error to get rid of the unknown error below
            console.log(`${nodeId} has succesfully been updated`);
            setCurrTerm(term);
        } catch (err: unknown) {
            if (err instanceof Error) {
                console.log(err.message);
            } else if (err) {
                console.error(err.response.data.message);
            }};
        }, [setNodes]);
    const handleUpdateNodeNote = async (nodeId: string | undefined, note: string) => {
        if (!nodeId || note === undefined) {
            throw new Error("No node/note exists");
        };
        try {
            const res: AxiosResponse = await axios.patch(`${apiUrl}user/nodes/note/${nodeId}/`, {note});
            if (res.status === 500) throw new Error(res.data);
            setNote(nodeId, note, true);
        } catch (err: unknown) {
            if (typeof err === "string") {
                console.log(err);
            } else if (err instanceof Error) {
                console.log(err.message);
            } else {
                console.log("Unknown error");
            }
        };
    };

    const handleUpdateEdgeNote = async (edgeId: string | undefined, note: string) => {
        if (!edgeId || note === undefined) {
            throw new Error("No edge/note exists");
        };
        try {
            await axios.patch(`${apiUrl}user/edges/note/${edgeId}/`, {note});
            setNote(edgeId, note, false);
        } catch (err: unknown) {
            if (typeof err === "string") {
                console.log(err);
            } else if (err instanceof Error) {
                console.log(err.message);
            } else {
                console.log("Unknown error");
            }
        };
    };
    const nodeTypes = useMemo(() => ({
        ResizeNode: (nodeProp: ResizeNodeProps) =>
            <ResizeNode {...nodeProp} handleUpdateNodeLabel={handleUpdateNodeLabel} />
        }), 
        [handleUpdateNodeLabel]
    );
    const edgeTypes = useMemo(() => ({
        EditEdge,
    }), []);
    const handleFocusInput = () => {
        inputRef.current?.focus();
    }

    const handleSelectAll = useCallback((): void => {
        setEditContext({kind: 'node', id: 'all'})
        setNodes((nodeSnapshot) => {
            const updatedNode: AppNode[] = nodeSnapshot.map((node: AppNode)=>({...node, selected: true}));
            setIsNodeEditing('clear', false);
            updatedNode.forEach((node)=>{setIsNodeEditing(node.id, true)});
            return updatedNode;
            }
        );
    }, [setNodes, setIsNodeEditing, setEditContext]);

    const handleUnselect = (): void => {
        setNodes((prevNodes) => 
            prevNodes.map((node: AppNode)=>({...node, selected: false}))
        )
    }
    const handleNodeClick = useCallback((_:React.MouseEvent, currNode: AppNode) => {
        setCurrentNode(currNode);
        setEditContext({kind: 'node', id: currNode.id})
        setCurrTerm(currNode.data.label);
        setNodes((prevNodes)=> prevNodes.map((node)=>({...node, selected: node.id === currNode.id})));
        }, [setCurrentNode, setCurrTerm, setEditContext, setNodes], 
    )

    const handlePaneClick = useCallback(() => {
        setCurrentNode(null);
        setCurrTerm('');
        setIsNodeEditing("clear", true);
        setIsEdgeEditing('clear', true);
        setEditContext({kind: null});
        }, [setCurrentNode, setCurrTerm, setIsNodeEditing, setIsEdgeEditing, setEditContext],
    )

    const handleEdgeClick = useCallback((__:React.MouseEvent, currEdge: AppEdge): void => {
        // add a current edge in store here if needed
        setEditContext({kind: 'edge', id: currEdge.id});
        setEdges((prevEdges) => prevEdges.map((edge) => ({...edge, selected: edge.id === currEdge.id})));
        }, [setEditContext, setEdges]
    );
    
    return {
        handleAddTerm, 
        handleUpdateNodeLabel,
        nodeTypes,
        currTerm,
        setCurrTerm,
        setNodes,
        nodes,
        setEdges,
        edges,
        onNodesChange,
        onEdgesChange,
        onConnect,
        currentNode,
        setCurrentNode,
        handleSelectAll,
        handleUnselect,
        handleNodeClick,
        handlePaneClick,
        isNodeEditing,
        setIsNodeEditing,
        deleteNode,
        onNodesDelete,
        handleUpdateSize,
        handleUpdateNodeNote,
        setNote,
        edgeTypes,
        setIsEdgeEditing,
        isEdgeEditing,
        currentEdge,
        setCurrentEdge,
        handleUpdateEdgeNote,
        setEditContext,
        editContext,
        deleteEdge,
        handleEdgeClick,
        handleFocusInput, 
        userID,
        visibleNote, 
        setVisibleNote,
        editNoteRef,
        setUserID,
    };
};
