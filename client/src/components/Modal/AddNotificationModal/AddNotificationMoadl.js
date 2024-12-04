import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { handleClickOk, openModal } from '../../../redux/actions/ModalAction'
import { Checkbox, Col, Row, Select } from 'antd'
import { showNotificationWithIcon, users_notifications } from '../../../util/NotificationUtil'
import { updateProjectAction } from '../../../redux/actions/CreateProjectAction'

export default function AddNotificationModal(props) {
    const projectInfo = props.projectInfo
    const notificationEvent = props.notificationEvent
    const dispatch = useDispatch()
    const [chooseEvent, setChooseEvent] = useState(notificationEvent === null ? null : notificationEvent?.notification_id)
    const [typesUser, setTypesUser] = useState(notificationEvent === null ? null : notificationEvent?.user_types_is_received_notifications?.map(id => id.toString()))
    useEffect(() => {
        dispatch(handleClickOk(handleSelectIssueOk))
    }, [chooseEvent, typesUser])
    const handleSelectIssueOk = () => {
        if (chooseEvent !== null && typesUser.length === 0) {
            showNotificationWithIcon('error', '', "Please select at least one user type to receive notifications")
        } else {
            if (typesUser?.length > 0) {
                var typesUserForConverting = [...typesUser]
                if (typesUser.length > 0) {
                    typesUserForConverting = [...typesUser.map(value => parseInt(value))]
                }

                const getMinus1Index = typesUserForConverting.findIndex(value => value === -1)
                if (getMinus1Index !== -1) {
                    typesUserForConverting.splice(getMinus1Index, 1)
                }
                dispatch(updateProjectAction(projectInfo?._id, { notification_id: chooseEvent, is_activated: true, user_types_is_received_notifications: typesUserForConverting }))
                dispatch(openModal(false))
            }
        }
    }
    const deleteItemOnSelect = (value) => {
        const index = typesUser.findIndex(type => type === value)
        const newTypes = [...typesUser]
        if (index === -1) {
            newTypes.push(value)
        } else {
            newTypes.splice(index, 1)
        }
        setTypesUser([...newTypes])
    }
    return (
        <div>
            <p>Users will be notified the next time this event occurs.</p>
            <div>
                <label className='mb-1' htmlFor='event_activated'>When this happens</label>
                <Select
                    name="event_activated"
                    style={{ width: '100%' }}
                    options={projectInfo?.notification_config?.filter(notification => !notification.is_activated)?.map(notification => {
                        return {
                            label: notification.event_name,
                            value: notification.notification_id
                        }
                    })}
                    defaultValue={notificationEvent !== null ? notificationEvent?.event_name : null}
                    disabled={notificationEvent !== null}
                    placeholder="Select event"
                    onSelect={(value) => {
                        setChooseEvent(value)
                    }} />
            </div>
            <div>
                <label className='mt-2 mb-0' htmlFor='sendTo'>When this happens</label>
                <Checkbox.Group
                    style={{
                        width: '100%',
                    }}
                    defaultValue={typesUser}
                    onChange={value => {
                        if (typesUser === null) {
                            setTypesUser([...value])
                        } else {
                            const getAllElesInProjectRole = typesUser?.reduce((total, value) => {
                                if (value === "5" || value === "6" || value === "7") {
                                    total.push(value)
                                }
                                return total
                            }, [])
                            const newArr = [...getAllElesInProjectRole, ...value]
                            setTypesUser([...newArr])
                        }
                    }}
                >
                    <Row>
                        {
                            users_notifications.filter(ele => {
                                if (ele.id === 5 || ele.id === 6 || ele.id === 7) {
                                    return false
                                }
                                return true
                            }).map(type => <Col span={16}>
                                <Checkbox disabled={chooseEvent === null} className='mt-2' value={`${type.id}`}>{type.name}</Checkbox>
                            </Col>)
                        }
                    </Row>
                </Checkbox.Group>
            </div>
            {
                typesUser?.includes("-1") || typesUser?.includes("5") || typesUser?.includes("6") || typesUser?.includes("7") ? <div>
                    <Select
                        className='mt-2'
                        placeholder="Select project role"
                        options={[
                            {
                                label: "Administrator",
                                value: "5"
                            },
                            {
                                label: "Member",
                                value: "6"
                            },
                            {
                                label: "Viewer",
                                value: "7"
                            }
                        ]}
                        style={{ width: '100%' }}
                        onDeselect={(value) => {
                            deleteItemOnSelect(value)
                        }}
                        onSelect={(value) => {
                            deleteItemOnSelect(value)
                        }}
                        defaultValue={notificationEvent?.user_types_is_received_notifications?.reduce((total, data) => {
                            console.log("notificationEvent?.user_types_is_received_notifications ", notificationEvent?.user_types_is_received_notifications, "data ", data);
                            if (notificationEvent?.user_types_is_received_notifications?.includes(data) && [5, 6, 7].includes(data) && !total.includes(data)) {
                                total.push(data.toString())
                            }
                            return total
                        }, [])}
                        mode="multiple" />
                </div> : <></>
            }
        </div>
    )
}
