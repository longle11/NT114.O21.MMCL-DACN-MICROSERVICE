import { Button } from 'antd'
import React from 'react'
import { Draggable } from 'react-beautiful-dnd'

export default function CardIssueSetting(props) {
    const icon = props.icon
    const text = props.text
    const index = props.index
    
    return (
        <Draggable draggableId={`add-fields_${index}`} key={`add-fields_${index}`} index={index}>
            {provided => {
                return <div ref={provided.innerRef} {...provided.dragHandleProps} {...provided.draggableProps}>
                    <div className="card card-items" style={{ width: '6rem', height: '5rem', position: 'relative' }}>
                        <div style={{ position: 'absolute', top: 0, right: 0 }}>
                            <Button style={{ borderRadius: 0, border: 'none', padding: '0 5px', boxShadow: 'none' }}>
                                <i className="fa fa-question-circle item-question_issue_setting d-none"></i>
                            </Button>
                        </div>
                        <div style={{ marginTop: 5, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ fontSize: 17 }}>{icon}</span>
                            <span style={{ fontSize: 12 }}>{text}</span>
                        </div>
                    </div>
                </div>
            }}
        </Draggable>

    )
}
