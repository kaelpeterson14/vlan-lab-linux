import { BaseEdge, EdgeLabelRenderer, getStraightPath } from "@xyflow/react"
import { useState } from "react"

interface Props {
    id: string
    sourceX: number
    sourceY: number
    targetX: number
    targetY: number
    data?: { description: string }
}

export default function VethEdge({ id, sourceX, sourceY, targetX, targetY, data }: Props) {
    const [hovered, setHovered] = useState(false)
    const [edgePath, labelX, labelY] = getStraightPath({ sourceX, sourceY, targetX, targetY })

    return (
        <>
            <BaseEdge
                id={id}
                path={edgePath}
                style={{ stroke: "#4b5563", strokeWidth: 2 }}
            />
            <EdgeLabelRenderer>
                <div
                    style={{
                        position: "absolute",
                        transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                        pointerEvents: "all",
                    }}
                    onMouseEnter={() => setHovered(true)}
                    onMouseLeave={() => setHovered(false)}
                >
                    <div className="w-3 h-3 rounded-full bg-gray-600 hover:bg-gray-400 transition-colors cursor-pointer" />
                    {hovered && (
                        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 w-64 bg-gray-900 border border-gray-600 rounded p-2 text-xs text-gray-300 font-mono z-50">
                            {data?.description}
                        </div>
                    )}
                </div>
            </EdgeLabelRenderer>
        </>
    )
}