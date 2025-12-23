'use client';

import React, { useCallback, useState, useMemo, useEffect } from 'react';
import { getVenomDivisions, saveVenomDivision, deleteVenomDivision } from '@/app/actions/organization';
import {
    ReactFlow,
    useNodesState,
    useEdgesState,
    Controls,
    Background,
    MiniMap,
    Panel,
    Node,
    Edge,
    addEdge,
    Connection,
    ReactFlowProvider,
    MarkerType,
    NodeTypes,
    useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Plus, Trash2, GripHorizontal, Save, Layers, Layout, X, Download } from "lucide-react";
import OrgNode, { OrgNodeData } from './OrgNode';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import { toPng } from 'html-to-image';

const nodeTypes: NodeTypes = {
    org: OrgNode,
};

type DivisionData = {
    id: string;
    name: string;
    nodes: Node[];
    edges: Edge[];
};

const initialDivisions: DivisionData[] = [
    {
        id: 'main',
        name: 'Main Structure',
        nodes: [
            {
                id: '1',
                type: 'org',
                position: { x: 250, y: 0 },
                data: { name: 'CEO Name', position: 'Chief Executive Officer', isRoot: true },
            },
        ],
        edges: []
    }
];

function OrgChartContent() {
    const [divisions, setDivisions] = useState<DivisionData[]>(initialDivisions);
    const [activeDivisionId, setActiveDivisionId] = useState<string>('main');
    const { getNodes, getNodesBounds, getViewport } = useReactFlow();

    // Load initial data from DB
    useEffect(() => {
        const loadData = async () => {
            const dbDivisions = await getVenomDivisions();
            if (dbDivisions && dbDivisions.length > 0) {
                // Parse JSON fields
                const parsed = dbDivisions.map((d: any) => ({
                    id: d.id,
                    name: d.name,
                    nodes: d.nodes,     // Prisma Json type automatically parses to object
                    edges: d.edges
                }));
                setDivisions(parsed);
                setActiveDivisionId(parsed[0].id);
                // Also set nodes/edges for first load
                setNodes(parsed[0].nodes);
                setEdges(parsed[0].edges);
            }
        };
        loadData();
    }, []);

    // These local states track the *currently active* chart
    // We synchronize them back to the divisions array on change/switch
    const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

    // Sync active division on switch
    useEffect(() => {
        const division = divisions.find(d => d.id === activeDivisionId);
        if (division) {
            setNodes(division.nodes);
            setEdges(division.edges);
        }
    }, [activeDivisionId]);

    // Update local store (divisions) when nodes/edges change
    useEffect(() => {
        setDivisions(prev => prev.map(d => {
            if (d.id === activeDivisionId) {
                return { ...d, nodes: nodes, edges: edges };
            }
            return d;
        }));
    }, [nodes, edges, activeDivisionId]);


    // Callbacks for Node interactions
    const onConnect = useCallback(
        (params: Connection) => setEdges((eds) => addEdge({
            ...params,
            type: 'smoothstep',
            animated: true,
            style: { stroke: '#8b5cf6', strokeWidth: 2 },
            markerEnd: {
                type: MarkerType.ArrowClosed,
                color: '#8b5cf6',
            },
        }, eds)),
        [setEdges],
    );

    const handleNodeEdit = useCallback((id: string, field: string, value: string) => {
        setNodes((nds) => nds.map((node) => {
            if (node.id === id) {
                return {
                    ...node,
                    data: { ...node.data, [field]: value }
                };
            }
            return node;
        }));
    }, [setNodes]);

    const handleNodeDelete = useCallback((id: string) => {
        setNodes((nds) => nds.filter((n) => n.id !== id));
        setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
        toast.success("Member removed");
    }, [setNodes, setEdges]);

    // Inject the handlers
    const nodesWithHandlers = useMemo(() => nodes.map(node => ({
        ...node,
        data: {
            ...node.data,
            onEdit: handleNodeEdit,
            onDelete: handleNodeDelete
        }
    })), [nodes, handleNodeEdit, handleNodeDelete]);


    const handleAddNode = () => {
        const id = uuidv4();
        const newNode: Node = {
            id,
            type: 'org',
            position: { x: 250, y: 200 },
            data: {
                name: 'New Employee',
                position: 'Role Title',
            },
        };
        setNodes((nds) => [...nds, newNode]);
        toast.info("New member card added");
    };

    const handleAddDivision = async () => {
        const name = prompt("Enter new division name (e.g. Marketing):");
        if (!name) return;

        const newId = uuidv4();
        const newDivision: DivisionData = {
            id: newId,
            name,
            nodes: [{
                id: uuidv4(),
                type: 'org',
                position: { x: 250, y: 0 },
                data: { name: `${name} Lead`, position: 'Division Head', isRoot: true },
            }],
            edges: []
        };

        setDivisions(prev => [...prev, newDivision]);
        setActiveDivisionId(newId);

        // Auto-save to DB
        await saveVenomDivision({
            id: newId,
            name,
            nodes: newDivision.nodes,
            edges: newDivision.edges
        });
        toast.success(`Created ${name} division chart`);
    };

    const handleDeleteDivision = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (divisions.length <= 1) {
            toast.error("Cannot delete the last division");
            return;
        }
        if (!confirm("Are you sure you want to delete this division chart?")) return;

        const newDivisions = divisions.filter(d => d.id !== id);
        setDivisions(newDivisions);
        if (activeDivisionId === id) {
            setActiveDivisionId(newDivisions[0].id);
        }

        await deleteVenomDivision(id);
        toast.success("Division removed");
    };

    const handleSave = async () => {
        // Save ALL divisions
        const promises = divisions.map(d => saveVenomDivision({
            id: d.id,
            name: d.name,
            nodes: d.nodes,
            edges: d.edges
        }));
        await Promise.all(promises);
        toast.success("Charts saved to database!");
    };

    // Restore functionality removed as we load from DB now.
    // Keeping button hidden or removing it from UI.

    function downloadImage(dataUrl: string) {
        const a = document.createElement('a');

        a.setAttribute('download', 'org-chart.png');
        a.setAttribute('href', dataUrl);
        a.click();
    }

    const handleDownloadImage = () => {
        // We select the viewport element to convert to image
        // The standard class for the viewport is 'react-flow__viewport'
        const viewportElement = document.querySelector('.react-flow__viewport') as HTMLElement;

        if (!viewportElement) {
            toast.error("Could not find chart viewport");
            return;
        }

        const nodesBounds = getNodesBounds(getNodes());
        const viewport = getViewport();
        const imageWidth = nodesBounds.width;
        const imageHeight = nodesBounds.height;

        toPng(viewportElement, {
            backgroundColor: '#ffffff',
            width: imageWidth,
            height: imageHeight,
            style: {
                width: imageWidth.toString(),
                height: imageHeight.toString(),
                transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
            },
        }).then(downloadImage);
    };

    return (
        <div className="h-[85vh] w-full flex flex-col bg-slate-50 dark:bg-slate-950 rounded-xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800">
            {/* Toolbar */}
            <div className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 flex items-center justify-between z-20 relative">
                <div className="flex items-center gap-4">
                    <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                        {divisions.map(div => (
                            <div
                                key={div.id}
                                onClick={() => setActiveDivisionId(div.id)}
                                className={`
                                    px-3 py-1.5 text-sm font-medium rounded-md cursor-pointer flex items-center gap-2 transition-all
                                    ${activeDivisionId === div.id
                                        ? 'bg-white dark:bg-slate-700 shadow-sm text-purple-600 dark:text-purple-400'
                                        : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                    }
                                `}
                            >
                                {div.name}
                                {divisions.length > 1 && (
                                    <span
                                        onClick={(e) => handleDeleteDivision(e, div.id)}
                                        className="opacity-50 hover:opacity-100 hover:text-red-500"
                                    >
                                        <X size={12} />
                                    </span>
                                )}
                            </div>
                        ))}
                        <button
                            onClick={handleAddDivision}
                            className="px-2 py-1.5 text-slate-400 hover:text-purple-600 transition"
                            title="Add New Division Chart"
                        >
                            <Plus size={16} />
                        </button>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={handleAddNode}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition shadow-lg shadow-purple-500/20"
                    >
                        <Plus size={16} /> Add Member
                    </button>
                    {/* Restore button used to be here */}
                    <button
                        onClick={handleSave}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 text-white rounded-lg text-sm font-medium transition"
                    >
                        <Save size={16} /> Save
                    </button>
                    <button
                        onClick={handleDownloadImage}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 text-white rounded-lg text-sm font-medium transition"
                    >
                        <Download size={16} /> Download
                    </button>
                </div>
            </div>

            {/* Canvas */}
            <div className="flex-1 w-full bg-slate-50 dark:bg-black/20 relative">
                <ReactFlow
                    // Key forces re-mount when switching divisions to ensure clean state transition if needed, 
                    // though setNodes usually handles it. But key is safer for distinct charts.
                    key={activeDivisionId}
                    nodes={nodesWithHandlers}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    nodeTypes={nodeTypes}
                    fitView
                    minZoom={0.2}
                    maxZoom={1.5}
                    defaultEdgeOptions={{
                        type: 'smoothstep',
                        animated: true,
                        style: { strokeWidth: 2, stroke: '#64748b' }
                    }}
                >
                    <Background color="#94a3b8" gap={20} size={1} />
                    <Controls className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-xl" />
                    <MiniMap
                        nodeColor="#cbd5e1"
                        maskColor="rgba(0, 0, 0, 0.1)"
                        className="!bg-white dark:!bg-slate-900 border-2 dark:border-slate-700 rounded-lg overflow-hidden shadow-lg"
                    />

                    <Panel position="top-center" className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-full shadow-lg border border-slate-200 dark:border-slate-700 text-xs text-slate-500 flex gap-4">
                        <span className="flex items-center gap-1.5"><GripHorizontal size={14} className="text-purple-500" /> Draggable Nodes</span>
                        <span className="flex items-center gap-1.5"><strong className="text-purple-500">·</strong> Connect dots to link</span>
                        <span className="flex items-center gap-1.5 border-l pl-3 ml-1"><Layout size={14} className="text-purple-500" /> {divisions.find(d => d.id === activeDivisionId)?.name}</span>
                    </Panel>
                </ReactFlow>
            </div>
        </div>
    );
}

export default function OrgChart() {
    return (
        <ReactFlowProvider>
            <OrgChartContent />
        </ReactFlowProvider>
    );
}
