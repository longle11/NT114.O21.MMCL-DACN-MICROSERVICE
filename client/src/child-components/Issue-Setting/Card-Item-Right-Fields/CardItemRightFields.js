import React from 'react'
import './CardItemRightFields.css'
import { Avatar, Button, Popconfirm } from 'antd'
import { Draggable } from 'react-beautiful-dnd'
import htmlParser from 'html-react-parser'
import { useDispatch } from 'react-redux'
import { deleteIssueTagProjectAction } from '../../../redux/actions/CreateProjectAction'
import { useParams } from 'react-router-dom'
export default function CardItemRightFields(props) {
    const index = props.index
    const issue_config = props.issue_config
    const { id } = useParams()
    const dispatch = useDispatch()
    return (
        <Draggable className="available-fields_custom" draggableId={`available-fields__${index}`} key={`available-fields__${index}`} index={index}>
            {provided => {
                return <div ref={provided.innerRef} {...provided.dragHandleProps} {...provided.draggableProps}>
                    <div className='w-100'>
                        <div className='right_items-fields d-flex align-items-center justify-content-between' style={{
                            boxShadow: '0px 1px 1px #091E4240, 0px 0px 1px #091E424F',
                            borderRadius: 3,
                            marginBottom: 4,
                            padding: '8px 10px',
                            width: '100%'
                        }}>
                            <div className='info-left'>
                                <span className='mr-2'>{htmlParser(issue_config?.icon_field_type)}</span>
                                <span>{issue_config?.field_name}</span>
                            </div>
                            {issue_config?.field_is_deleted ? <div className='info-right'>
                                <span className='item_info_setting_1_right-hover d-block'><Avatar shape='square' src="https://z45letranphilong.atlassian.net/rest/api/2/universal_avatar/view/type/project/avatar/10406?size=medium" /></span>
                                <Popconfirm title="Do you want to delete this tag?"
                                    onConfirm={() => {
                                        dispatch(deleteIssueTagProjectAction(id, { field_key_issue: issue_config?.field_key_issue }))
                                    }}
                                >
                                    <span className='item_info_setting_2_right-hover d-none'><Button className='pl-2 pr-2'><i className="fa fa-trash"></i></Button></span>
                                </Popconfirm>
                            </div> : <></>}
                        </div>
                    </div>
                </div>
            }}
        </Draggable>
    )
}
