import React, { useEffect } from 'react'
import { handleClickOk, openModalInfo } from '../../../redux/actions/ModalAction'
import { useDispatch } from 'react-redux'
import { NavLink } from 'react-router-dom'
import CreateSprint from '../../Forms/CreateSprint/CreateSprint'
import { drawer_edit_form_action } from '../../../redux/actions/DrawerAction'
import { Tag } from 'antd'
import dayjs from 'dayjs'

export default function SprintModalInfo(props) {
    const sprintInfo = props.sprintInfo
    const dispatch = useDispatch()
    useEffect(() => {
        dispatch(handleClickOk(handleSelectIssueOk))
    }, [])
    const handleSelectIssueOk = async () => {

    }
    return (
        <div style={{ width: '100%' }}>
            <div className='d-flex align-items-center justify-content-between'>
                <div className='d-flex align-items-center'>
                    <span className='mr-1 ml-1'><i style={{ color: '#333' }} className="fab fa-viadeo"></i></span>
                    <span style={{ color: '#333', fontWeight: 'bold' }}>SPRINT</span>
                </div>
                <div className='d-flex align-items-center'>
                    <NavLink onClick={(e) => {
                        dispatch(openModalInfo(false))
                        dispatch(drawer_edit_form_action(<CreateSprint currentSprint={sprintInfo} />, 'Save', '700px'))
                    }} className='mr-1 ml-1'><i style={{ color: '#333' }} className="fa fa-ellipsis-h"></i></NavLink>
                    <NavLink onClick={(e) => {
                        dispatch(openModalInfo(false))
                    }} style={{ color: '#333' }}><i className="fa fa-times ml-2"></i></NavLink>
                </div>
            </div>
            <div>
                <div className='mt-2'>
                    <Tag color="#E9F2FF"><span style={{ color: '#0055CC', fontWeight: 'bold' }}>Active</span></Tag>
                    <h5 className='font-weight-bold mt-2'>{sprintInfo.sprint_name}</h5>
                    <div className='d-flex align-items-center justify-content-between'>
                        <div className='d-flex flex-column'>
                            <label htmlFor='start_date' className='font-weight-bold'>Start date</label>
                            <span>{dayjs(sprintInfo.start_date).format("DD/MM/YYYY hh:mm A")}</span>
                        </div>
                        <div className='d-flex flex-column'>
                            <label htmlFor='end_date' className='font-weight-bold'>Planned end</label>
                            <span>{dayjs(sprintInfo.end_date).format("DD/MM/YYYY hh:mm A")}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
