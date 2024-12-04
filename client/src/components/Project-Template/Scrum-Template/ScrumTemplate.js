import { Button, Tag } from 'antd'
import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function ScrumTemplate() {
    const navigate = useNavigate()
    return (
        <div className='container h-100 w-100 d-flex align-items-center'>

            <div className="card bg-light mb-3">
                <div className="card-header d-flex justify-content-between align-items-center">
                    <h3 className='m-0'>Scrum</h3>
                    <div className='d-flex'>
                        <Button onClick={(e) => {
                            navigate(`/create-project/1`)
                        }} className='mr-2'>Use template</Button>
                        <Button><i className="fa-solid fa-circle-xmark"></i></Button>
                    </div>
                </div>
                <div className="card-body">
                    <div className='row'>
                        <div className='col-9'>
                            <p>The Scrum template helps teams work together using sprints to break down large, complex projects into bite-sized pieces of value. Encourage your team to learn through incremental delivery, self-organize while working on a problem, and regularly reflect on their wins and losses to continuously improve.</p>
                            <div className="container">
                                <div className="row">
                                    <div className="col-4">
                                        <img style={{ width: '60%' }} src='https://jira-frontend-bifrost.prod-east.frontend.public.atl-paas.net/assets/backlog.87c4d35e.svg' />
                                    </div>
                                    <div className="col-8 d-flex flex-column justify-content-center">
                                        <p className='font-weight-bold'>Plan upcoming work in a backlog</p>
                                        <span>Prioritize and plan your team's work on the backlog. Break down work from your project timeline, and order work items so your team knows what to deliver first.</span>
                                    </div>
                                    <div className="w-100" />
                                    <div className="col-8 d-flex flex-column justify-content-center">
                                        <p className='font-weight-bold'>Organize cycles of work into sprints</p>
                                        <span>Sprints are short, time-boxed periods when a team collaborates to complete a set amount of customer value. Use sprints to drive incremental delivery, allow your team to ship high-quality work and deliver value faster.</span>
                                    </div>
                                    <div className="col-4">
                                        <img style={{ width: '100%' }} src='https://jira-frontend-bifrost.prod-east.frontend.public.atl-paas.net/assets/agile-on-grid.fb85a74b.png' />
                                    </div>

                                    <div className="w-100" />
                                    <div className="col-4">
                                        <img style={{ width: '100%' }} src='https://jira-frontend-bifrost.prod-east.frontend.public.atl-paas.net/assets/bar-chart.a199c1ca.png' />
                                    </div>
                                    <div className="col-8 d-flex flex-column justify-content-center">
                                        <p className='font-weight-bold'>Understand your team’s velocity</p>
                                        <span>Improve predictability on planning and delivery with out-of-the-box reports, including the sprint report and velocity chart. Empower your team to understand their capacity and iterate on their processes.</span>
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
                        navigate(`/create-project/1`)
                    }} type='primary'>Use template</Button>
                </div>
            </div>
        </div>
    )
}
