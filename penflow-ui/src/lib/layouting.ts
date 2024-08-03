import {
    type Edge as ReactFlowEdge,
    type Node as ReactFlowNode,
    MarkerType
} from "reactflow";

import {FlowTaskLinkedList, FlowTaskNode} from "@/lib/ds/linkedlist-tasks";

export function layoutFlow(flowTasks: FlowTaskLinkedList): {
    nodes: ReactFlowNode[],
    edges: ReactFlowEdge[]
} {
    return _layoutFlow((flowTasks.head as FlowTaskNode));
}

export function _layoutFlow(
    start: FlowTaskNode | null,
    parentId: string | undefined = undefined,
    childName: string | undefined = undefined,
    placeholderCount: number = 1,
    totalHeight: number = 0,
    depth: number = 0,
    x: number = 0,
    y: number = 0,
): {
    nodes: ReactFlowNode[],
    edges: ReactFlowEdge[],
    placeholderCount: number,
    x: number,
    y: number,
} {
    // Consideration when lay outing tasks:
    //   1. The first item is always a placeholder.
    //   2. A task always comes with a placeholder bellow,
    //      meaning in between two tasks there is always a placeholder.
    //   3. Subtasks are placed inside an area, centered respect tasks
    //      and with a padding of 40px in each side. A subtasks can hold subtasks too.
    //   4. Dimensions:
    //        - Task:                   384_x_80px
    //        - Placeholder:            384_x_40px
    //        - Edge:                     ?_x_40px
    //        - Task+Placeholder:       384_x_200px
    //        - LastTask+Placeholder:   384_x_160px
    //   5. References:
    //        - Task:        (parentId, childName, self)
    //        - Placeholder: (parentId, childName, prevId)
    const TASK_WIDTH = 512;
    const TASK_HEIGHT = 80;
    const PLACEHOLDER_WIDTH = 256;
    const PLACEHOLDER_HEIGHT = 40;
    const EDGE_LENGTH = 40;
    const AREA_PADDING_LEFT = 40;
    const AREA_PADDING_RIGHT = 40;
    const AREA_PADDING_TOP = 90;
    const AREA_PADDING_BOTTOM = 40;
    const AREA_PADDING_X = AREA_PADDING_LEFT+AREA_PADDING_RIGHT;

    let nodes: ReactFlowNode[] = [];
    let edges: ReactFlowEdge[] = [];

    nodes.push({
        id: placeholderCount.toString(),
        data: {
            prevFlowTaskId: undefined,
            parentFlowTaskId: parentId,
            flowSubtaskName: childName,
        },
        position: {
            x: x + ((TASK_WIDTH-PLACEHOLDER_WIDTH)/2),
            y: y
        },
        parentId: parentId,
        style: {
            width: PLACEHOLDER_WIDTH,
            height: PLACEHOLDER_HEIGHT,
        },
        type: "placeholder"
    });
    if (start != null) {
        edges.push({
            id: `${placeholderCount}-${start.key}`,
            source: placeholderCount.toString(),
            target: start.key,
            type: "smoothstep",
            markerEnd: {
                type: MarkerType.ArrowClosed
            },
            style: {
                strokeWidth: 2,
                stroke: "#cbd5e1"
            }
        })
        y += PLACEHOLDER_HEIGHT+EDGE_LENGTH;
    } else {
        y += PLACEHOLDER_HEIGHT;
    }
    placeholderCount++;

    let current = start;
    while (current != null) {
        if (current.value.type === "behavioral") {
            // Control flow tasks layout uniquely
            switch (current.value.name) {
                case "core.control.loop.foreach":
                    // layout as: task(subtasks) -> placeholder [->]
                    //   1. Recursively generate subtask layout
                    //   2. Add task
                    //   3. Add task placeholder
                    //   4. Add generated subtasks
                    /*
                           -40px 0px                            384px 424px
                         ----|----|-------------------------------|----|----|
                                                                            |
                             |-----------------------------------------|    - 0px   => _y.start
                             |                                         |    |
                             |    |-------------------------------|    |    - 60px
                             |    | |--|  ----------------------  |    |    |
                             |    | |--|  ----------------------  |    |    |
                             |    |-------------------------------|    |    - 140px
                             |                    |                    |    |
                             |    |-------------------------------|    |    - 160px
                             |    |               +               |    |    |
                             |    |-------------------------------|    |    - 200px => _y.end
                             |                                         |    |
                             |-----------------------------------------|    - 240px
                                                  |                         |
                                  |-------------------------------|         - 280px
                                  |               +               |         |
                                  |-------------------------------|         - 320px
                                                  |                         |
                                                                            - [360px]
                    */
                    let { nodes: _nodes, edges: _edges, placeholderCount: _count, y: _y } = _layoutFlow(
                        current.children["foreach"],
                        current.key,
                        "foreach",
                        placeholderCount,
                        Math.max(totalHeight, current.height),
                        depth+1,
                        AREA_PADDING_LEFT*(current.height),
                        AREA_PADDING_TOP,
                    );
                    nodes.push(
                        {
                            id: current.key,
                            data: {
                                flowTask: current.value,
                                parentFlowTaskId: parentId,
                                flowSubtaskName: childName,
                            },
                            //
                            position: {
                                // Tasks are always at x=0
                                // Therefore parent task holding subtask is shifted to the left subtask_height times
                                // Child tasks holding subtasks are positioned relative to the parent
                                // Therefore padding is always 40, if there is another sibling with a higher height
                                // Then padding is calculated
                                x: parentId === undefined
                                    ? -AREA_PADDING_LEFT * (current.height)
                                    // Find a sibling with another height
                                    : depth != totalHeight && Math.abs(current.height - depth) === totalHeight-1
                                        ? AREA_PADDING_LEFT * (totalHeight - current.height)
                                        : AREA_PADDING_LEFT,
                                y: y
                            },
                            parentId: parentId,
                            style: {
                                // Subtasks area has to fit task + x-padding*(subtasks_height)
                                // As the area could fit other tasks holding subtasks
                                width: TASK_WIDTH + AREA_PADDING_X * (current.height),
                                height: _y + AREA_PADDING_BOTTOM,
                            },
                            type: "subflow"
                        },
                        {
                            id: _count.toString(),
                            data: {
                                prevFlowTaskId: current.key,
                                parentFlowTaskId: parentId,
                                flowSubtaskName: childName,
                            },
                            position: {
                                x: x + ((TASK_WIDTH - PLACEHOLDER_WIDTH) / 2),
                                y: y + _y + AREA_PADDING_BOTTOM + EDGE_LENGTH
                            },
                            parentId: parentId,
                            style: {
                                width: PLACEHOLDER_WIDTH,
                                height: PLACEHOLDER_HEIGHT,
                            },
                            type: "placeholder"
                        }
                    );
                    edges.push({
                        id: `${current.key}-${_count}`,
                        source: current.key,
                        target: _count.toString(),
                        type: "smoothstep",
                        style: {
                            strokeWidth: 2,
                            stroke: "#cbd5e1",
                        }
                    });
                    if (current.next != null) {
                        edges.push({
                            id: `${_count}-${current.next.key}`,
                            source: _count.toString(),
                            target: current.next.key,
                            type: "smoothstep",
                            markerEnd: {
                                type: MarkerType.ArrowClosed
                            },
                            style: {
                                strokeWidth: 2,
                                stroke: "#cbd5e1"
                            }
                        })
                        y = y + _y + AREA_PADDING_BOTTOM + EDGE_LENGTH + PLACEHOLDER_HEIGHT + EDGE_LENGTH;
                    } else {
                        y = y + _y + AREA_PADDING_BOTTOM + EDGE_LENGTH + PLACEHOLDER_HEIGHT;
                    }
                    placeholderCount = _count + 1;
                    nodes = nodes.concat(_nodes);
                    edges = edges.concat(_edges);
                    break;
            }
        } else if (current.value.type === "runnable") {
            // Runnable tasks layout equally: task -> placeholder [->]:
            //   1. Add task and placeholder diagram
            //   2. Add edge between task and placeholder
            //   3. If next task, add edge between placeholder and next task
            /*
                    0px                            384px
                 ----|-------------------------------|----|
                                                          |
                     |-------------------------------|    - 0px
                     | |--|  ----------------------  |    |
                     | |--|  ----------------------  |    |
                     |-------------------------------|    - 80px
                                     |                    |
                     |-------------------------------|    - 120px
                     |               +               |    |
                     |-------------------------------|    - 160px
                                     |                    |
                                                          - [200px]
            */
            nodes.push(
                {
                    id: current.key,
                    data: {
                        flowTask: current.value,
                        parentFlowTaskId: parentId,
                        flowSubtaskName: childName,
                    },
                    position: { x: x, y: y },
                    parentId: parentId,
                    style: {
                        width: TASK_WIDTH,
                        height: TASK_HEIGHT,
                    },
                    type: "task"
                },
                {
                    id: placeholderCount.toString(),
                    data: {
                        prevFlowTaskId: current.key,
                        parentFlowTaskId: parentId,
                        flowSubtaskName: childName,
                    },
                    position: {
                        x: x + ((TASK_WIDTH-PLACEHOLDER_WIDTH)/2),
                        y: y + TASK_HEIGHT+EDGE_LENGTH
                    },
                    parentId: parentId,
                    style: {
                        width: PLACEHOLDER_WIDTH,
                        height: PLACEHOLDER_HEIGHT,
                    },
                    type: "placeholder"
                }
            );
            edges.push({
                id: `${current.key}-${placeholderCount}`,
                source: current.key,
                target: placeholderCount.toString(),
                type: "smoothstep",
                style: {
                    strokeWidth: 2,
                    stroke: "#cbd5e1"
                }
            });
            if (current.next != null) {
                edges.push({
                    id: `${placeholderCount}-${current.next.key}`,
                    source: placeholderCount.toString(),
                    target: current.next.key,
                    type: "smoothstep",
                    markerEnd: {
                        type: MarkerType.ArrowClosed
                    },
                    style: {
                        strokeWidth: 2,
                        stroke: "#cbd5e1"
                    }
                })
                y += TASK_HEIGHT+EDGE_LENGTH+PLACEHOLDER_HEIGHT+EDGE_LENGTH;
            } else {
                y += TASK_HEIGHT+EDGE_LENGTH+PLACEHOLDER_HEIGHT;
            }
            placeholderCount++;
        }
        current = (current.next as FlowTaskNode);
    }

    return {
        nodes: nodes,
        edges: edges,
        x: x,
        y: y,
        placeholderCount: placeholderCount
    };
}