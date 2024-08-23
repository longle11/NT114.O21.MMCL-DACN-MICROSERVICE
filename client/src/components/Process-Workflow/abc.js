export const initialNodes = [
    {
        id: '0',
        type: 'custom',
        data: {},
        position: { x: 250, y: 0 },
    },
    {
        id: '66c7375e226f6eb89825edbc',
        data: { label: 'To Do' },
        position: { x: 100, y: 200 },
    },
    {
        id: '66c7375e226f6eb89825edbe',
        data: { label: 'In Progress' },
        position: { x: 350, y: 200 },
    },
    {
        id: '66c7375e226f6eb89825edc0',
        data: { label: 'Done' },
        position: { x: 700, y: 200 },
    },
];
export const initialEdges = [
    { id: 'e0-66c7375e226f6eb89825edbc', source: '0', target: '66c7375e226f6eb89825edbc', label: 'Created' },
];