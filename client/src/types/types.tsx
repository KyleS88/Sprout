    import {
        type Edge,
        type Node,
        type OnNodesChange,
        type OnEdgesChange,
        type OnConnect,
        type NodeTypes,
        type NodeProps,
        type EdgeProps,
        type OnNodesDelete,
        type EdgeTypes
    } from '@xyflow/react';

    export interface MyCanvasProp {
        nodes: AppNode[];
        edges: AppEdge[];
        nodeTypes: NodeTypes | undefined;
        edgeTypes: EdgeTypes;
        handleNodeClick: (_:React.MouseEvent, currNode: AppNode)=>void;
        handleEdgeClick: (_: React.MouseEvent, currEdge: AppEdge)=>void;
        handlePaneClick: ()=>void;
        onNodesChange: OnNodesChange<AppNode>;
        onEdgesChange: OnEdgesChange<AppEdge>;
        onConnect: OnConnect;
        onNodesDelete: OnNodesDelete;
    }
    // Use for debouncing
    export type Timer = ReturnType<typeof setTimeout>

    export type NodeData = {
        label: string;
        note: string;
        userId: string;
    }

    export type ResizeNodeData = Node<NodeData, 'ResizeNode'>;

    export type ResizeNode = Node<NodeData, 'ResizeNode'> & {
        position: {
            x: number;
            y: number;
        },
        style: {
            height: number;
            width: number;
        },
    };
    export type DefaultNode = Node<NodeData, 'default'> & {
        position: {
            x: number; 
            y: number;
        },
        style: {
            height: number;
            width: number;
        },
    };

    export type AppNode = ResizeNode | DefaultNode;

    export type EdgeData = { 
        label: string;
        note: string;
        userID: string;
    };
    
    export type EditContext =
        | { kind: 'node'; id: string }
        | { kind: 'edge'; id: string }
        | { kind: null };

    export type AppEdge = Edge<EdgeData, 'EditEdge'> & {data: EdgeData}
    export type AuthState = {
        isAuthenticated: boolean,
        setIsAuthenticated: (isAuth: boolean) => void,
        token: string,
        setToken: (token: string) => void,
    };
    export type AppState = {
        nodes: AppNode[];
        edges: AppEdge[];
        isNodeEditing: string[];
        onNodesChange: OnNodesChange<AppNode>;
        onEdgesChange: OnEdgesChange<AppEdge>;
        onConnect: OnConnect;
        setNodes: (updater: AppNode[] | ((nodes: AppNode[]) => AppNode[])) => void;
        setEdges: (updater: AppEdge[] | ((edges: AppEdge[]) => AppEdge[])) => void;
        setIsNodeEditing: (nodeId: string, status: boolean) => void;
        deleteNode: (nodeId: string[]) => void;
        currentNode: AppNode | null;
        setCurrentNode: (newCurrNode: AppNode | null) => void;
        isEdgeEditing: string[];
        setIsEdgeEditing: (edgeId: string, status: boolean) => void;
        currentEdge: AppEdge | null;
        setCurrentEdge: (newCurrEdge: AppEdge | null) => void;
        editContext: EditContext,
        setEditContext: (ctx: EditContext) => void;
        deleteEdge: (edgeId: string[]) => void;
        setVisibleNote: (note: string)=>void, 
        visibleNote: string,
        userId: string,
        setUserID: (userId: string) => void,
    };

    export interface ResizeNodeProps extends NodeProps<AppNode> {
        handleUpdateNodeLabel: (nodeId: string, newLabel: string) => void;
    };

    export type EditEdgeProps = EdgeProps<AppEdge>;

    export type GetSpecialPathParams = {
        sourceX: number;
        sourceY: number; 
        targetX: number;
        targetY: number;
    }
    export interface MySidebarProps {
        inputRef?:React.RefObject<HTMLInputElement|null>;
        nodes: AppNode[];
        currTerm: string;
        setCurrTerm: React.Dispatch<React.SetStateAction<string>>;
        handleAddTerm: () => void;
        handleSelectAll: () => void;
        handleUnselect: () => void;
        handleEditNotes: (id: string) => void;
    }
    export interface MapEditorProps {
        setIsEditNote: React.Dispatch<React.SetStateAction<boolean>>;
    }

    export type RawNode = { id: string, uuid: string, type: string, position_x: number, position_y: number, label: string, note: string, style_height: number, style_width: string, user_id: string };
    export type RawEdge = { id: string, source: string, target: string, note: string, type: string, userID: string };
