import { Breadcrumb, Button, Checkbox, Select, Tag } from 'antd'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { NavLink, useParams } from 'react-router-dom'
import { GetProjectAction } from '../../../redux/actions/ListProjectAction'
import { issueTypeOptions } from '../../../util/CommonFeatures'
import './IssueSetting.css'
import Search from 'antd/es/input/Search'
import CardIssueSetting from '../../../child-components/Issue-Setting/Card-Issue-Setting/CardIssueSetting'
import CardItemRightFields from '../../../child-components/Issue-Setting/Card-Item-Right-Fields/CardItemRightFields'
import CardItemLeftFields from '../../../child-components/Issue-Setting/Card-Item-Left-Fields/CardItemLeftFields'
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd'
import { addNewIssueTagProjectAction, updateIssueTagProjectAction } from '../../../redux/actions/CreateProjectAction'
import { showNotificationWithIcon } from '../../../util/NotificationUtil'
import mongoose from 'mongoose'
import htmlParser from 'html-react-parser'
import { renderInterfaceForCreatingNewTag } from '../../../util/IssueTagSetting'
export default function IssueSetting() {
    const { id } = useParams()
    const projectInfo = useSelector(state => state.listProject.projectInfo)
    const [status, setStatus] = useState(0)
    const [positionNewIssueTagAdded, setPositionNewIssueTagAdded] = useState({
        isOpen: false,
        positionOpen: 0,
        iconIssueTag: null,
        id_issue_tag: null,
        isOpenCollapse: null,
        isModifyAvailable: false,
        data: {
            icon: null,
            field_description: '',
            field_text: null,
            default_value: null,
            is_required: false,
            issue_status: 0,
            field_type_in_issue: null,
            name_issue_tag: null
        }    //this data field for user filling information
    })

    const dispatch = useDispatch()
    useEffect(() => {
        if (id) {
            dispatch(GetProjectAction(id, null, null))
        }
    }, [])
    const handleDragEnd = (result) => {
        const source = result.source
        const dest = result.destination
        if (dest === null || source === null) {
            return
        }
        console.log("source ", source);
        console.log("dest ", dest);
        const sourceName = source.droppableId.substring(0, source.droppableId.indexOf('-'))
        const destName = dest.droppableId.substring(0, dest.droppableId.indexOf('-'))
        const typeSourceIndex = ["description", "context", "more"].indexOf(sourceName)
        const typeDestIndex = ["description", "context", "more"].indexOf(destName)
        if (source.droppableId.includes('left') && dest.droppableId.includes('left')) {
            const getSourceArrs = projectInfo?.issue_fields_config?.filter(issue_config => issue_config.field_position_display.includes({ position: typeSourceIndex, issue_status: status }))
            if(getSourceArrs[source.index]) {
                dispatch(updateIssueTagProjectAction(id, { field_key_issue: getSourceArrs[source.index].field_key_issue, position_display: typeDestIndex, issue_status: status }))
            }
        } else if (source.droppableId.includes('add-available') && dest.droppableId.includes('left')) { //this case for add available issue tag to specify fields
            const getTagNeedToDisplay = issueTagNotDisplay()[source.index]
            if (getTagNeedToDisplay && typeDestIndex !== -1) {
                dispatch(updateIssueTagProjectAction(id, {
                    field_key_issue: getTagNeedToDisplay?.field_key_issue,
                    position_display: typeDestIndex,
                    issue_status: status,
                }))
            }
        } else if (source.droppableId.includes('add-new') && dest.droppableId.includes('left')) {
            setPositionNewIssueTagAdded({
                isOpen: true,
                positionOpen: typeDestIndex,
                id_issue_tag: source.index,
                isOpenCollapse: null,
                isModifyAvailable: false,
                data: {
                    icon: cardTagSettings[source.index].icon,
                    field_description: '',
                    field_text: null,
                    default_value: null,
                    is_required: false,
                    issue_status: status,
                    field_type_in_issue: cardTagSettings[source.index].field_type_in_issue,
                    name_issue_tag: cardTagSettings[source.index].name
                }
            })
        }
        return null
    }

    const renderIssueTagNew = () => {
        return <div
            className="list-group-item list-group-item-action"
            id="add_new_tag"
            style={{
                padding: '5px 20px',
            }}>
            <div className='d-flex align-items-center justify-content-between' id="add_new_tag-id_collapse">
                <div className='description_field-info-left mr-2'>
                    <span className='mr-2'>{htmlParser(positionNewIssueTagAdded.data.icon)}</span>
                    <span>{positionNewIssueTagAdded.data.field_text}</span>
                </div>
                <div className='d-flex align-items-center'>
                    {positionNewIssueTagAdded.data.is_required ? <Tag style={{ height: 'max-content' }} color='#ddd'>
                        <span className='font-weight-bold' style={{ color: '#44546F' }}>REQUIRED</span>
                    </Tag> : <></>}
                </div>
            </div>
            <div id="add_new_tag-collapse" className="collapse show" aria-labelledby="add_new_tag-id_collapse" data-parent="#add_new_tag">
                {
                    <div>
                        <div>
                            <div className="form-group">
                                <label htmlFor="file_name">Field Name <span className='text-danger'>*</span></label>
                                <input
                                    style={{ fontSize: 13 }}
                                    type="file_name"
                                    className="form-control"
                                    id="file_name"
                                    onChange={(e) => {
                                        setPositionNewIssueTagAdded({ ...positionNewIssueTagAdded, data: { ...positionNewIssueTagAdded.data, field_text: e.target.value } })
                                    }}
                                    defaultValue={null}
                                    value={positionNewIssueTagAdded.data.field_text}
                                    placeholder="Name the field you seleted from the Create a field section."
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="field_description">Field Description</label>
                                <input
                                    style={{ fontSize: 13 }}
                                    type="field_description"
                                    className="form-control"
                                    onChange={(e) => {
                                        setPositionNewIssueTagAdded({ ...positionNewIssueTagAdded, data: { ...positionNewIssueTagAdded.data, field_description: e.target.value } })
                                    }}
                                    defaultValue={null}
                                    value={positionNewIssueTagAdded.data.field_description}
                                    id="field_description"
                                    placeholder="Describe how people should you this field."
                                />
                            </div>

                            {renderInterfaceForCreatingNewTag(positionNewIssueTagAdded.id_issue_tag, true, positionNewIssueTagAdded, setPositionNewIssueTagAdded, null)}
                        </div>
                    </div>
                }
                <hr />
                <div className='d-flex justify-content-end'>
                    <Checkbox onChange={(e) => {
                        setPositionNewIssueTagAdded({ ...positionNewIssueTagAdded, data: { ...positionNewIssueTagAdded.data, is_required: e.target.checked } })
                    }} className='mr-2'>Require</Checkbox>
                    <Button className='mr-2' onClick={() => {
                        setPositionNewIssueTagAdded({
                            isOpen: false,
                            positionOpen: -1,
                            id_issue_tag: -1,
                            isOpenCollapse: null,
                            isModifyAvailable: false,
                            data: {
                                icon: null,
                                field_description: '',
                                field_text: null,
                                isModifyAvailable: false,
                                default_value: null,
                                is_required: false,
                                issue_status: 0,
                                field_type_in_issue: null,
                                name_issue_tag: null
                            }
                        })
                    }}>Cancel</Button>
                    <Button type='primary' onClick={() => {
                        if (positionNewIssueTagAdded.data.field_text !== null && positionNewIssueTagAdded.data.field_text?.trim() !== "") {
                            dispatch(addNewIssueTagProjectAction(id, {
                                updated_new_tag: {
                                    icon_field_type: positionNewIssueTagAdded.data.icon,
                                    field_description: positionNewIssueTagAdded.data.field_description,
                                    field_name: positionNewIssueTagAdded.data.field_text,
                                    is_required: positionNewIssueTagAdded.data.is_required,
                                    field_key_issue: `new-tag_${positionNewIssueTagAdded.data.name_issue_tag}_${(new mongoose.Types.ObjectId())?.toString()}`,
                                    field_is_edited: true,
                                    field_type: positionNewIssueTagAdded.id_issue_tag,
                                    field_is_deleted: true,
                                    field_type_in_issue: positionNewIssueTagAdded.data.field_type_in_issue,
                                    field_position_display: { position: positionNewIssueTagAdded.positionOpen, issue_status: positionNewIssueTagAdded.data.issue_status },
                                    default_value: [6, 7].includes(positionNewIssueTagAdded.id_issue_tag) && positionNewIssueTagAdded.data.default_value === null ? [] : positionNewIssueTagAdded.data.default_value
                                }
                            }))

                            setPositionNewIssueTagAdded({
                                isOpen: false,
                                positionOpen: -1,
                                id_issue_tag: -1,
                                isOpenCollapse: null,
                                isModifyAvailable: false,
                                data: {
                                    icon: null,
                                    field_description: '',
                                    field_text: null,
                                    isModifyAvailable: false,
                                    default_value: null,
                                    is_required: false,
                                    issue_status: 0,
                                    field_type_in_issue: null,
                                    name_issue_tag: null
                                }
                            })
                        } else {
                            showNotificationWithIcon('error', '', 'Field (*) can not left blank')
                        }
                    }}>Create</Button>
                </div>
            </div>
        </div>
    }


    const cardTagSettings = [
        { icon: `<i className="fab fa-amilia"></i>`.toString(), text: "Short text", field_type_in_issue: 'string', name: 'short_text' },
        { icon: `<i className="fa fa-paragraph"></i>`, text: "Paragraph", field_type_in_issue: 'string', name: 'paragraph' },
        { icon: `<i className="fa fa-calendar-alt"></i>`, text: "Date", field_type_in_issue: 'string', name: 'date' },
        { icon: `<i className="fa-solid fa-list-ol"></i>`, text: "Number", field_type_in_issue: 'number', name: 'number' },
        { icon: `<i className="fa-solid fa-clock"></i>`, text: "Time stamp", field_type_in_issue: 'string', name: 'time_stamp' },
        { icon: `<i className="fa fa-tag"></i>`, text: "Labels", field_type_in_issue: 'array', name: 'labels' },
        { icon: `<i className="fa fa-arrow-alt-circle-down"></i>`, text: "Dropdown", field_type_in_issue: 'array', name: 'dropdown' },
        { icon: `<i className="fa-solid fa-square-check"></i>`, text: "Checkbox", field_type_in_issue: 'array', name: 'checkbox' },
        { icon: `<i className="fa fa-user"></i>`, text: "Single user", field_type_in_issue: 'object', name: 'single_user' },
        { icon: `<i className="fa fa-users"></i>`, text: "Multi users", field_type_in_issue: 'array-object', name: 'multi_users' },
        { icon: `<i className="fa fa-link"></i>`, text: "URL", field_type_in_issue: 'string', name: 'url' },
    ]

    const issueTagNotDisplay = () => {
        return projectInfo?.issue_fields_config?.filter(issue_config => !issue_config.field_position_display?.map(field => field.issue_status)?.includes(status))
    }

    const issueTagDisplayDescription = () => {
        return projectInfo?.issue_fields_config?.filter(issue_config => issue_config.field_position_display.findIndex(field => field.position === 0 && field.issue_status === status) !== -1)
    }

    const issueTagDisplayContext = () => {
        return projectInfo?.issue_fields_config?.filter(issue_config => issue_config.field_position_display.findIndex(field => field.position === 1 && field.issue_status === status) !== -1)
    }

    const issueTagDisplayMore = () => {
        return projectInfo?.issue_fields_config?.filter(issue_config => issue_config.field_position_display.findIndex(field => field.position === 2 && field.issue_status === status) !== -1)
    }

    return (
        <div>
            <Breadcrumb
                style={{ marginBottom: 10 }}
                items={[
                    {
                        title: <a href="/manager">Projects</a>
                    },
                    {
                        title: <a href={`/projectDetail/${id}/board`}>{projectInfo?.name_project}</a>
                    },
                    {
                        title: <a href={"#"}>Project Settings</a>
                    },
                    {
                        title: <a href={"#"}>Issue types</a>
                    }
                ]}
            />
            <DragDropContext onDragEnd={handleDragEnd}>
                <div className='row'>
                    <div className='setting-info-left col-9' style={{ overflowY: 'auto', scrollbarWidth: 'thin', height: '700px' }}>
                        <div className='row'>
                            <Select className='col-9' onChange={(e) => {
                                setStatus(e)
                            }} style={{ width: '100%', paddingRight: 0 }} defaultValue={0} options={issueTypeOptions(projectInfo?.issue_types_default)?.filter(status => [0, 1, 2, 4].includes(status.value))} />
                            <Button className='ml-2'>Manage your workflow</Button>
                        </div>
                        <div className="description-field">
                            <h6 className='mt-4'>Description Field</h6>
                            {positionNewIssueTagAdded.isOpen === true && positionNewIssueTagAdded.positionOpen === 0 ? renderIssueTagNew() : <></>}
                            <Droppable droppableId='description-left-fields'>
                                {(provided) => {
                                    return <div className="list-group" ref={provided.innerRef} {...provided.droppableProps}>
                                        {issueTagDisplayDescription()?.map((issue_config, index) => {
                                            return <Draggable
                                                isDragDisabled={issue_config?.field_key_issue === "summary"}
                                                draggableId={`description-field_${issue_config?.field_key_issue}`}
                                                key={`description-field_${issue_config?.field_key_issue}`}
                                                index={index}>
                                                {(provided) => {
                                                    return <div ref={provided.innerRef} {...provided.dragHandleProps} {...provided.draggableProps}>
                                                        <CardItemLeftFields
                                                            status={status}
                                                            positionNewIssueTagAdded={positionNewIssueTagAdded}
                                                            setPositionNewIssueTagAdded={setPositionNewIssueTagAdded}
                                                            issue_config={issue_config}
                                                            key={index}/>
                                                    </div>
                                                }}
                                            </Draggable>
                                        })}
                                        {provided.placeholder}
                                    </div>
                                }}
                            </Droppable>
                        </div>

                        <div className="context-field mt-2">
                            <h6 className='mt-4'>Context Field</h6>
                            {positionNewIssueTagAdded.isOpen === true && positionNewIssueTagAdded.positionOpen === 1 ? renderIssueTagNew() : <></>}
                            <Droppable droppableId='context-left-fields'>
                                {(provided) => {
                                    return <div className="list-group" ref={provided.innerRef} {...provided.droppableProps}>
                                        {issueTagDisplayContext()?.map((issue_config, index) => {
                                            return <Draggable isDragDisabled={issue_config?.field_key_issue === "issue_type"} draggableId={`context-field_${index}`} key={`context-field_${index}`} index={index}>
                                                {(provided) => {
                                                    return <dsiv ref={provided.innerRef} {...provided.dragHandleProps} {...provided.draggableProps}>
                                                        <CardItemLeftFields
                                                            status={status}
                                                            positionNewIssueTagAdded={positionNewIssueTagAdded}
                                                            setPositionNewIssueTagAdded={setPositionNewIssueTagAdded}
                                                            issue_config={issue_config}
                                                            key={index}/>
                                                    </dsiv>
                                                }}
                                            </Draggable>
                                        })}
                                        {provided.placeholder}
                                    </div>
                                }}
                            </Droppable>
                        </div>

                        <div className="more-field mt-2">
                            <h6 className='mt-4'>More Field</h6>
                            {positionNewIssueTagAdded.isOpen === true && positionNewIssueTagAdded.positionOpen === 2 ? renderIssueTagNew() : <></>}
                            <Droppable droppableId='more-left-fields'>
                                {(provided) => {
                                    return <div className="list-group" ref={provided.innerRef} {...provided.droppableProps}>
                                        {issueTagDisplayMore()?.length !== 0 ? issueTagDisplayMore()?.map((issue_config, index) => {
                                            return <Draggable draggableId={`more-field_${index}`} key={`more-field_${index}`} index={index}>
                                                {(provided) => {
                                                    return <div ref={provided.innerRef} {...provided.dragHandleProps} {...provided.draggableProps}>
                                                        <CardItemLeftFields
                                                            status={status}
                                                            positionNewIssueTagAdded={positionNewIssueTagAdded}
                                                            setPositionNewIssueTagAdded={setPositionNewIssueTagAdded}
                                                            issue_config={issue_config}
                                                            key={index}/>
                                                    </div>
                                                }}
                                            </Draggable>
                                        }) : <div style={{ height: 150, border: '2px dashed #ddd', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <span style={{ width: 500, textAlign: 'center' }}>Drag fields here or drag the dotted line up to add fields to your “Subtask” issues’ layout. When empty, these fields may appear under a “Show more” link or may be hidden.</span>
                                        </div>}
                                        {provided.placeholder}
                                    </div>
                                }}
                            </Droppable>
                        </div>
                    </div>
                    <div className='setting-info-right col-3' style={{ overflowY: 'auto', scrollbarWidth: 'thin', height: '700px' }}>
                        <div className='shadow-none p-1 mb-5 bg-light rounded'>
                            <h6 className='pl-2 pt-2'>Fields</h6>
                            <div id="field_right-setting">
                                <div className="card" style={{ marginLeft: 4 }}>
                                    <div className="card-header d-flex justify-content-between align-items-center" id="field-heading_right">
                                        <span className="mb-0">
                                            <NavLink style={{ color: '#000', textDecoration: 'none', fontSize: 13, fontWeight: 'bold' }} className="btn btn-link" data-toggle="collapse" data-target="#field-collapse_right" aria-expanded="true" aria-controls="field-collapse_right">
                                                CREATE A FIELD
                                            </NavLink>
                                        </span>
                                        <i className="fa fa-angle-down mr-2"></i>
                                    </div>
                                    <div id="field-collapse_right" className="collapse show" aria-labelledby="field-heading_right" data-parent="#field_right-setting">
                                        <span style={{ fontSize: 12, padding: '5px 0 5px 0', marginLeft: 4, display: 'block' }}>
                                            Drag a field type to one of the sections on the left to create a custom field for this issue type.
                                        </span>
                                        <Droppable droppableId='add-new-fields'>
                                            {provided => {
                                                return <div ref={provided.innerRef} {...provided.droppableProps} className='d-flex flex-wrap pl-2'>
                                                    {cardTagSettings.map((new_tag, index) => {
                                                        return <CardIssueSetting index={index} text={new_tag.text} icon={htmlParser(new_tag.icon)} />
                                                    })}
                                                    {provided.placeholder}
                                                </div>
                                            }}
                                        </Droppable>
                                    </div>
                                    <hr style={{ height: 3, backgroundColor: '#ddd' }} />
                                    <div className='pl-2 pr-2'>
                                        <div className='form-group'>
                                            <h6>Search all fields</h6>
                                            <Search style={{ width: '100%' }} placeholder='Search all fields' />
                                            <small>Reuse {issueTagNotDisplay()?.length} fields from other issue types and projects</small>
                                        </div>
                                        <div>
                                            <h6>Suggested fields</h6>
                                            <Droppable droppableId='add-available-fields'>
                                                {provided => {
                                                    return <div ref={provided.innerRef} {...provided.droppableProps} style={{ padding: '5px 0 5px 2px' }}>
                                                        {issueTagNotDisplay()?.map((issue_config, index) => {
                                                            return <Draggable draggableId={`add-field_${index}`} key={`add-field_${index}`} index={index}>
                                                                {(provided) => {
                                                                    return <div ref={provided.innerRef} {...provided.dragHandleProps} {...provided.draggableProps}>
                                                                        <CardItemRightFields index={index} issue_config={issue_config} />
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
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </DragDropContext>
        </div >
    )
}
