import { Breadcrumb } from 'antd'
import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { NavLink, useParams } from 'react-router-dom'
import { GetProjectAction, GetSprintAction } from '../../../../redux/actions/ListProjectAction'

export default function ReportTemplate() {
    const projectInfo = useSelector(state => state.listProject.projectInfo)
    const sprintInfo = useSelector(state => state.listProject.sprintInfo)
    const { id } = useParams()
    const dispatch = useDispatch()

    useEffect(() => {
        if (typeof id?.toString() === 'string') {
            if (typeof projectInfo?.sprint_id?.toString() === 'string') {
                dispatch(GetSprintAction(projectInfo?.sprint_id))
            }
            dispatch(GetProjectAction(id, null, null))
        }
    }, [])
    return (

        <div>
            <Breadcrumb
                style={{ marginBottom: 10 }}
                items={[
                    {
                        title: <a href="/manager">Projects</a>,
                    },
                    {
                        title: <a href={`/projectDetail/${id}/board`}>{projectInfo?.name_project}</a>,
                    }
                ]}
            />

            <h4>All reports</h4>

            <h5>Agile</h5>
            <div className='agile-reports d-flex'>
                <div className="card" style={{ width: '18rem', marginRight: 10 }}>
                    <img className="card-img-top" src="https://www.visual-paradigm.com/servlet/editor-content/scrum/scrum-burndown-chart/sites/7/2018/11/burndown-chart-and-emotion.png" alt="Burndown image" />
                    <div className="card-body">
                        <h5>
                            <NavLink to={`/projectDetail/${id}/reports/burndownchart/${sprintInfo?._id}`} className="card-title">Burndown Chart</NavLink>
                        </h5>
                        <p className="card-text">Track the total work remaining and project the likelihood of achieving the sprint goal. This helps your team manage its progress and respond accordingly.</p>
                    </div>
                </div>

                <div className="card" style={{ width: '18rem' }}>
                    <img className="card-img-top" src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRQf18WnnJdmg2ZuTa40b25waMd2IiKCQTt3g&s" alt="Burnup image" />
                    <div className="card-body">
                        <h5>
                            <NavLink to={`/projectDetail/${id}/reports/burndownchart/${sprintInfo?._id}`} className="card-title">Burnup Chart</NavLink>
                        </h5>
                        <p className="card-text">Track the total scope independently from the total work done. This helps your team manage its progress and better understand the effect of scope change.</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
