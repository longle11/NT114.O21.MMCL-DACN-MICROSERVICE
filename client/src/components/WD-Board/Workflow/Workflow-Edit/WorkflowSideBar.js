import React, { useEffect } from 'react';
import { useDnD } from './DNDContext';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { GetProcessListAction } from '../../../../redux/actions/ListProjectAction';

// eslint-disable-next-line import/no-anonymous-default-export
export default function WorkflowSideBar() {
    const [_, setType] = useDnD();
    const dispatch = useDispatch()
    const { id } = useParams()
    const processList = useSelector(state => state.listProject.processList)
    useEffect(() => {
        dispatch(GetProcessListAction(id))
    }, [])

    const onDragStart = (event, nodeType) => {
        setType(nodeType);
        event.dataTransfer.effectAllowed = 'move';
    };

    return (
        <aside>
            <div className="description">You can drag these nodes to the pane on the right.</div>
            {processList?.map(process => {
                return <div className="dndnode input" onDragStart={(event) => onDragStart(event, null)} draggable>
                    {process.name_process}
                </div>
            })}
        </aside>
    );
};
 