import type {  AppNode, EditEdgeProps } from "../../types/types";
import {
  getBezierPath,
  EdgeLabelRenderer,
  useInternalNode,
  type InternalNode,
} from '@xyflow/react';
import { getEdgeParams } from "../../hooks/utills";
import { memo } from "react";
import "../../styles/MapEditor.css"
import { useDataMap } from "../../hooks/useMapData";
// type SpecialPath = { p: string; cx: number; cy: number };
const EditEdge = ({ id, source, target, markerEnd, style }: EditEdgeProps) => {

    const sourceNode: InternalNode<AppNode> | undefined = useInternalNode(source);
    const targetNode: InternalNode<AppNode> | undefined = useInternalNode(target);
    const { setEditContext } = useDataMap();
    if (!sourceNode || !targetNode) {
        return null;
    }
    
    const { sx, sy, tx, ty, sourcePos, targetPos } = getEdgeParams(
        sourceNode,
        targetNode,
    );
    
    const [edgePath, labelX, labelY] = getBezierPath({
        sourceX: sx,
        sourceY: sy,
        sourcePosition: sourcePos,
        targetPosition: targetPos,
        targetX: tx,
        targetY: ty,
    });
    
    return (
        <>
        <path
            id={id}
            className="react-flow__edge-path"
            d={edgePath}
            strokeWidth={5}
            markerEnd={markerEnd}
            style={style}
        />
            <EdgeLabelRenderer>
                <div
                className="button-edge__label nodrag nopan"
                style={{
                position: "absolute",
                transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
                pointerEvents: "all",
                zIndex: 1,
          }}
                >
                    <button className="button-edge__button" onClick={ ()=>setEditContext({kind: 'edge', id}) }>
                        Edit Note
                    </button>
                </div>
            </EdgeLabelRenderer>
        </>
        

    );
    }

export default memo(EditEdge);