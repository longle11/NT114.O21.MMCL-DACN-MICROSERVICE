import { Button, Tag } from 'antd'
import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function KanbanTemplate() {
    const navigate = useNavigate()
    return (
        <div className='container h-100 w-100 d-flex align-items-center'>

            <div className="card bg-light mb-3">
                <div className="card-header d-flex justify-content-between align-items-center">
                    <h3 className='m-0'>Kanban</h3>
                    <div className='d-flex'>
                        <Button onClick={(e) => {
                        navigate(`/create-project/0`)
                    }} className='mr-2'>Use template</Button>
                        <Button><i className="fa-solid fa-circle-xmark"></i></Button>
                    </div>
                </div>
                <div className="card-body">
                    <div className='row'>
                        <div className='col-9'>
                            <p>Kanban (the Japanese word for "visual signal") is all about helping teams visualize their work, limit work currently in progress, and maximize efficiency. Use the Kanban template to increase planning flexibility, reduce bottlenecks and promote transparency throughout the development cycle.</p>
                            <div className="container">
                                <div className="row">
                                    <div className="col-4">
                                        <img style={{ width: '100%' }} src='https://jira-frontend-bifrost.prod-east.frontend.public.atl-paas.net/assets/kanban.43b81a53.png' />
                                    </div>
                                    <div className="col-8 d-flex flex-column justify-content-center">
                                        <p className='font-weight-bold'>Track work using a simple board</p>
                                        <span>Work items are represented visually on your kanban board, allowing teams to track the status of work at any time. The columns on your board represent each step in your team’s workflow, from to-do to done.</span>
                                    </div>
                                    <div className="w-100" />
                                    <div className="col-8 d-flex flex-column justify-content-center">
                                        <p className='font-weight-bold'>Use the board to limit work in progress</p>
                                        <span>Set the maximum amount of work that can exist in each status with work in progress (WIP) limits. By limiting work in progress, you can improve team focus, and better identify inefficiencies and bottlenecks.</span>
                                    </div>
                                    <div className="col-4">
                                        <img style={{ width: '100%' }} src='https://jira-frontend-bifrost.prod-east.frontend.public.atl-paas.net/assets/columns-and-progress.fabc7765.png' />
                                    </div>

                                    <div className="w-100" />
                                    <div className="col-4">
                                        <img style={{ width: '100%' }} src='https://jira-frontend-bifrost.prod-east.frontend.public.atl-paas.net/assets/agile-reports.60c73c97.png' />
                                    </div>
                                    <div className="col-8 d-flex flex-column justify-content-center">
                                        <p className='font-weight-bold'>Continuously improve with agile reports</p>
                                        <span>One of the key tenets of kanban is optimizing flow for continuous delivery. Agile reports, like the cumulative flow diagram, help ensure your team are consistently delivering maximum value back to your business.</span>
                                    </div>
                                </div>
                            </div>

                        </div>
                        <div className='col-3'>
                            <div>
                                <p style={{ fontWeight: 'bold' }} className='mb-1'>Recommended for</p>
                                <span>Teams that control work volume from a backlog
                                    DevOps teams that want to connect work across their tools
                                </span>
                            </div>
                            <div className='mt-3'>
                                <p style={{ fontWeight: 'bold' }} className='mb-1'>Issue types</p>
                                <div>
                                    <span className="align-items-center d-flex"><i className="fa-solid fa-bookmark mr-2" style={{ color: '#65ba43', fontSize: 13 }}></i> Story</span>
                                    <span className="align-items-center d-flex"><i className="fa-solid fa-square-check mr-2" style={{ color: '#4fade6', fontSize: 13 }}></i> Task</span>
                                    <span className="align-items-center d-flex"><i className="fa-solid fa-circle-exclamation mr-2" style={{ color: '#cd1317', fontSize: 13 }}></i> Bug</span>
                                    <span className="align-items-center d-flex"><i className="fa-solid fa-bolt mr-2" style={{ color: 'purple', fontSize: 13 }}></i> Epic</span>
                                    <span className="align-items-center d-flex"><i className="fa-solid fa-list-check mr-2" style={{ color: '#e97f33', fontSize: 13 }}></i> Subtask</span>
                                </div>
                            </div>
                            <div className='mt-3'>
                                <p style={{ fontWeight: 'bold' }} className='mb-1'>Workflow</p>
                                <div>
                                    <Tag color='#dddd'>To Do</Tag>
                                    <Tag color='#1d7afc'>In Progress</Tag>
                                    <Tag color='#22a06b'>Done</Tag>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <hr />
                <div className="card-body d-flex d-flex justify-content-end align-items-center mr-3">
                    <span className='mr-2'>Next: Select a project type</span>
                    <Button onClick={(e) => {
                        navigate(`/create-project/0`)
                    }} type='primary'>Use template</Button>
                </div>
            </div>
        </div>
    )
}
