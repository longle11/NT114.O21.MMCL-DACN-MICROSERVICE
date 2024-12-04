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
            <div className="description mt-1 mb-2">You can drag these nodes to the pane on the bottom.</div>
            <div className="dropdown">
                <button className="btn btn-light dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    Choose an existing process
                </button>
                <div className="dropdown-menu p-0" aria-labelledby="dropdownMenuButton">
                    {processList?.map(process => {
                        return <div style={{border: `1px solid ${process.tag_color}`, margin: '2px 0'}} className="dndnode dropdown-item" onDragStart={(event, index) => onDragStart(event, process.name_process)} draggable>
                            {process.name_process}
                        </div>
                    })}
                </div>
            </div>
        </aside>
    );
};
