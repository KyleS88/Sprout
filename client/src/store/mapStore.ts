import { create } from 'zustand';
import { addEdge, applyNodeChanges, applyEdgeChanges, type EdgeChange, type NodeChange, type Connection } from '@xyflow/react';
import { type AppState, type AppNode, type AppEdge, type EditContext} from '../types/types';
import axios from 'axios';

const useStore = create<AppState>((set, get) => ({
    userId: "",
    nodes: [] as AppNode[],
    edges: [] as AppEdge[],
    isNodeEditing: [] as string[],
    isEdgeEditing: [] as string[],
    onNodesChange: (changes: NodeChange<AppNode>[]) => {
        set((state)=> {
            const updatedNodes: AppNode[] = applyNodeChanges<AppNode>(changes, state.nodes);
            return {
                nodes: updatedNodes as AppNode[],
            };
        });
    },
    onEdgesChange: (changes: EdgeChange<AppEdge>[]) => {
        set({
            edges: applyEdgeChanges<AppEdge>(changes, get().edges) as AppEdge[]
        });
    },
    onConnect: async (params: Connection) => {
        try {
            const isIdExist: boolean = get().edges.some(edge=>edge.id == `${params.source}|${params.target}`);
            if (isIdExist) 
                throw Error("This edge already exist");
            const newEdge: AppEdge = {
                ...params,
                id: `${params.source}|${params.target}`,
                type: 'EditEdge',
                data: {label: "Edit Note", note: "", userID: get().userId},
                };
                await axios.post("http://localhost:3000/api/user/edges", {edges: [newEdge]})
                set({
                    edges: addEdge<AppEdge>(newEdge, get().edges) 
                });  
        } catch (err: unknown) {
            if (err instanceof Error)
                console.error(err);
        }
        
    },
    setNodes: (updater) => {
        if (typeof updater === 'function') {
            set((state): Partial<AppState> => ({nodes: updater(state.nodes)}));
        } else {
            set({ nodes: updater });
        }
    },
    setEdges: (updater) => {
        if (typeof updater === 'function') {
            set((state): Partial<AppState> => ({edges: updater(state.edges) }));
        } else {
            set({ edges: updater });
        }
    },
    setIsNodeEditing: (nodeId: string, isClear: boolean) => {
        if (!isClear && nodeId === 'clear') {
            set(() => ({
                isNodeEditing: []
            }));
        } else if (!isClear) {
            set({ isNodeEditing: [nodeId] })
        } else {
            set((state): Partial<AppState> => { 
                let returnArray: string[] = [];
                returnArray = state.isNodeEditing.includes(nodeId)? state.isNodeEditing: [...state.isNodeEditing, nodeId]
                return { isNodeEditing: returnArray }
            });
        };
    },
    deleteNode: (nodeIdArray: string[]) => {
        set((state): Partial<AppState> => ({
            nodes: state.nodes.filter((node) => !nodeIdArray.includes(node.id))
        }));
    },
    currentNode: null,
    setCurrentNode: (newCurrNode: AppNode| null) => {
        set({ currentNode: newCurrNode });
    },
    setIsEdgeEditing: (edgeId: string, isClear: boolean) => {
        if (!isClear && edgeId === 'clear') {
            set(() => ({
                isEdgeEditing: []
            }));
        } else if (!isClear) {
            set({ isEdgeEditing: [edgeId] })
        } else {
            set((state): Partial<AppState> => { 
                let returnArray: string[] = [];
                returnArray = state.isEdgeEditing.includes(edgeId)? state.isEdgeEditing: [...state.isEdgeEditing, edgeId]
                return { isEdgeEditing: returnArray }
            });
        };
    },
    currentEdge: null,
    setCurrentEdge: (newCurrEdge: AppEdge | null) => {
        set({ currentEdge: newCurrEdge });
    }, 
    editContext: { kind: null },
    setEditContext: (ctx: EditContext) => {
        if (ctx.kind === 'node') {
            set({
                editContext: ctx,
                isEdgeEditing: [],
                isNodeEditing: [ctx.id]

            })
        } else if (ctx.kind === 'edge') {
            set({
                editContext: ctx,
                isEdgeEditing: [ctx.id],
                isNodeEditing: []
            });
        } else {
            set({
                editContext: { kind: null },
                isEdgeEditing: [],
                isNodeEditing: []
            });
        };    
    },
    deleteEdge: (edgeIdArray: string[]) => {
        const splitIdArray: string[] = edgeIdArray.flatMap((edgeId) => edgeId.split('|'));
        console.log(splitIdArray)
        set((state): Partial<AppState> => ({
            edges: state.edges.filter((edge) => 
                (!splitIdArray.includes(edge.source) || !splitIdArray.includes(edge.target))
            )
        }));
    },    
    visibleNote: "",
    setVisibleNote: (note: string) => {
        set({visibleNote: note})
    },
    setUserID: (userId: string) => {
        set({userId})
    },
}));
export default useStore;
