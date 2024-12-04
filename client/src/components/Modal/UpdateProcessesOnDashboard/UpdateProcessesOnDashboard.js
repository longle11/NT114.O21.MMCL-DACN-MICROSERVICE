import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { displayChildComponentInModal, handleClickOk } from '../../../redux/actions/ModalAction'
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import DeleteProcessModal from '../DeleteProcessModal/DeleteProcessModal';
import { showNotificationWithIcon } from '../../../util/NotificationUtil';
import { CreateProcessACtion, UpdateWorkflowAction } from '../../../redux/actions/ListProjectAction';
import NewChangesInactiveToActive from '../../../child-components/Child-Workflow-Component/New-Changes-Inactive-To-Active/NewChangesInactiveToActive';
import { delay } from '../../../util/Delay';
export default function UpdateProcessesOnDashboard(props) {
    const projectInfo = props.projectInfo
    const sprintList = props.sprintList
    const processesWorkflow = props.processesWorkflow
    const workflowWorking = props.workflowWorking
    const id = props.id
    const flowArrs = props.flowArrs
    const workflowList = props.workflowList
    const currentWorkflowInactive = props.currentWorkflowInactive
    const processList = useSelector(state => state.listProject.processList)
    const processListTemp = props.processListTemp
    const [virtualProcessesDashboard, setVirtualProcessesDashboard] = useState(processListTemp !== null ? processListTemp : [])
    const newProcesses = useRef([])
    const dispatch = useDispatch()


    useEffect(() => {
        dispatch(handleClickOk(handleSelectIssueOk))
    }, [virtualProcessesDashboard])


    useEffect(() => {
        setVirtualProcessesDashboard(processList)
    }, [processList])

    const handleSelectIssueOk = async () => {
        if (flowArrs.length > 0 && currentWorkflowInactive !== null) {
            for (let index = 0; index < flowArrs.length; index++) {
                if (flowArrs[index].issue_statuses.length > 0) {
                    dispatch(UpdateWorkflowAction(flowArrs[index].workflow_id, { issue_statuses: flowArrs[index].issue_statuses }))
                } else {
                    dispatch(UpdateWorkflowAction(flowArrs[index].workflow_id, { isActivated: false }))
                }
                await delay(200)
            }

            dispatch(UpdateWorkflowAction(currentWorkflowInactive._id, { isActivated: true }))
        }

        //proceed create all new processes 
        newProcesses.current?.forEach((data) => {
            dispatch(CreateProcessACtion(data))
        })
        //move workflow from inactive to active
        dispatch(UpdateWorkflowAction(workflowWorking.current._id, { isActivated: true }))

        workflowWorking.current = null
        newProcesses.current = null
    }


    const renderNewProcessesDisplayInWorkflow = (processesDashboard, processesWorkflow) => {
        const newCreatedProcesses = []

        processesWorkflow?.forEach(process => {
            if (!processesDashboard?.map(currentProcess => currentProcess?.name_process)?.includes(process?.data?.label)) {
                newCreatedProcesses.push(process?.data?.label)
            }
        })

        const index = newCreatedProcesses.findIndex(name => name === "Start")
        if (index !== -1) {
            newCreatedProcesses.splice(index, 1)
        }

        return newCreatedProcesses
    }
    const renderNewProcessesOnDashboard = (virtualProcessesDashboard, processesWorkflow) => {
        const data = renderNewProcessesDisplayInWorkflow(virtualProcessesDashboard, processesWorkflow?.nodes)
        const result = data.reduce((total, name, index) => {
            total += name
            if (index !== data.length - 1) {
                total += ", "
            }

            return total
        }, "")
        return result
    }
    return (
        <div>
            <span className='text-danger'>If you want to display processes in workflow to dashboard.<br /> Please drag the processes from workflow and drop into dashboard</span>
            {
                renderNewProcessesDisplayInWorkflow(virtualProcessesDashboard, processesWorkflow?.nodes).length > 0 ? <div className='mt-2'>
                    <span className='d-flex flex-column'>
                        <span className='font-weight-bold'><i style={{ color: '#ff9966' }} className="fa fa-exclamation-circle mr-2"></i>New processes are added on dashboard:</span>
                        {renderNewProcessesOnDashboard(virtualProcessesDashboard, processesWorkflow)}
                    </span>
                </div> : <></>
            }

            <NewChangesInactiveToActive
                flowArrs={flowArrs}
                workflowList={workflowList}
                currentWorkflowInactive={currentWorkflowInactive}
                projectInfo={projectInfo} />

            {/* Display processes in current dashboard */}
            <DragDropContext onDragEnd={(result) => {
                const source = result.source
                const dest = result.destination
                console.log("sourcee ", source);
                console.log("dest ", dest)

                if (dest !== null && source === null) {
                    return
                }
                if (source !== null && dest === null) {  //user want to delete this process from dashboard
                    if (source.index >= 0 && source.index < virtualProcessesDashboard?.length) {
                        if (projectInfo?.sprint_id !== null) {
                            const sprintInfoIndex = sprintList?.findIndex(sprint => sprint._id === projectInfo?.sprint_id)
                            if (sprintInfoIndex !== -1) {
                                const checkIssueExisted = sprintList[sprintInfoIndex]?.issue_list?.filter(issue => issue.issue_type?._id === virtualProcessesDashboard[source.index]._id)
                                if (checkIssueExisted.length > 0) {
                                    dispatch(displayChildComponentInModal(<DeleteProcessModal issue_list={checkIssueExisted.map(issue => issue._id)} processList={processList} sprintInfo={sprintList[sprintInfoIndex]} process={virtualProcessesDashboard[source.index]} />, 500, ''))
                                    return
                                }
                            }
                        }

                        const tempProcessesData = [...virtualProcessesDashboard]
                        tempProcessesData.splice(source.index, 1)
                        setVirtualProcessesDashboard([...tempProcessesData])
                    }
                    return
                }

                if (source === null || dest === null) return
                if (source.droppableId !== dest.droppableId && dest.droppableId.includes('processes-0')) {
                    const getCurrentProcessInWorkflow = processesWorkflow.nodes[source.index]
                    if (virtualProcessesDashboard.map(process => process._id.toString()).includes(getCurrentProcessInWorkflow.id.toString())) {
                        showNotificationWithIcon('error', '', 'This value is already existed on dashboard')
                    } else {
                        const newProcess = {
                            _id: getCurrentProcessInWorkflow.id,
                            name_process: getCurrentProcessInWorkflow.data.label,
                            project_id: id
                        }
                        const tempData = [...virtualProcessesDashboard]
                        tempData.push(newProcess)
                        newProcesses.current.push(newProcess)

                        setVirtualProcessesDashboard(tempData)
                    }
                }
            }}>
                <div className='mt-2'>
                    <label htmlFor='processesDashboard'>Processes are displayed in dashboard</label>
                    <div>
                        <Droppable droppableId='processes-0' direction='horizontal'>
                            {(provided) => {
                                return <div ref={provided.innerRef} {...provided.droppableProps} name="processesDashboard" style={{ padding: '10px 10px', border: '1px solid black', height: 'max-content', display: 'flex', overflowX: 'auto', scrollbarWidth: 'thin' }}>
                                    {virtualProcessesDashboard?.map((process, index) => {
                                        var color = '#ffff'
                                        if (processesWorkflow?.nodes?.map(currentProcess => currentProcess?.data?.label)?.includes(process.name_process)) {
                                            color = "#90EE90"
                                        }
                                        return <Draggable key={`process-0-${process._id.toString()}`} draggableId={`process-0-${process._id.toString()}`} index={index}>
                                            {(provided) => {
                                                return <div ref={provided.innerRef} {...provided.dragHandleProps} {...provided.draggableProps}>
                                                    <div style={{ padding: '6px 20px', border: '1px solid #dddd', marginRight: '10px', width: 'max-content', backgroundColor: color }}>{process.name_process}</div>
                                                </div>
                                            }}
                                        </Draggable>
                                    })}
                                    {provided.placeholder}
                                </div>
                            }}
                        </Droppable>
                    </div>
                </div>
                {/* Display processes in current workflow */}
                <div className='mt-2'>
                    <label htmlFor='processesWorkflow'>Processes are displayed in workflow</label>
                    <Droppable droppableId='processes-1' direction='horizontal'>
                        {(provided) => {
                            return <div ref={provided.innerRef} {...provided.droppableProps} name="processesWorkflow" style={{ padding: '10px 10px', border: '1px solid black', height: 'max-content', display: 'flex', overflowX: 'auto', scrollbarWidth: 'thin' }}>
                                {processesWorkflow?.nodes?.map((process, index) => {
                                    return <Draggable key={`process-1-${process.id.toString()}`} draggableId={`process-1-${process.id.toString()}`} index={index}>
                                        {(provided) => {
                                            if (process.id.toString() === '0') return <div key={process.id.toString()} ref={provided.innerRef} {...provided.dragHandleProps} {...provided.draggableProps}></div>
                                            return <div key={process.id.toString()} ref={provided.innerRef} {...provided.dragHandleProps} {...provided.draggableProps}>
                                                <div style={{ padding: '6px 20px', border: '1px solid #dddd', marginRight: '10px', width: 'max-content' }}>{process.data.label}</div>
                                            </div>
                                        }}
                                    </Draggable>
                                })}
                                {provided.placeholder}
                            </div>
                        }}
                    </Droppable>
                </div>
            </DragDropContext>
        </div>
    )
}
