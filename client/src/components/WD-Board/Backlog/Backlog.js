import { Button, Tag, Avatar, Col, Switch, Checkbox, Row } from 'antd'
import Search from 'antd/es/input/Search'
import React, { useState } from 'react'
import {
    DownOutlined,
    FrownFilled,
    FrownOutlined,
    MehOutlined,
    SmileOutlined,
    UserOutlined
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { drawer_edit_form_action } from '../../../redux/actions/DrawerAction';
import CreateIssue from '../../Forms/CreateEpic/CreateEpic';
import { NavLink } from 'react-router-dom';
import TaskForm from '../../Forms/TaskForm';
export default function Backlog() {
    const [onChangeVersion, setOnChangeVersion] = useState(false)
    const [onChangeEpic, setOnChangeEpic] = useState(false)
    const dispatch = useDispatch()
    const onChange = (checkedValues) => {
        console.log('checked = ', checkedValues);
    };
    return (
        <div>
            <span>Projects / Website Developments / WD Board</span>
            <div className='d-flex justify-content-between'>
                <h4>Backlog</h4>
                <div>
                    <button className='btn btn-primary'>Share</button>
                    <button className='btn btn-danger'>Setting</button>
                </div>
            </div>
            <div className="search-info-backlogs d-flex">
                <div className="search-block">
                    <Search
                        placeholder="input search text"
                        style={{ width: 300 }}
                        onSearch={value => {

                        }}
                    />
                </div>
                <div className="avatar-group d-flex">
                    {/* {projectInfo?.members?.map((value, index) => {
                        const table = <Table cols={memberCols} rowKey={value._id} dataSource={projectInfo?.members} />
                        return renderAvatarMembers(value, table)
                    })} */}
                </div>
                <Button type="primary" onClick={() => {
                    // setType(0)
                }} className=' ml-2 mr-3'>All issues</Button>
                <Button onClick={() => {
                    // setType(1)
                }}>Only my issues</Button>
            </div>
            <div style={{ margin: '0 40px' }}>
                <div style={{ display: 'flex' }}>
                    <div>
                        <button className='btn btn-primary' id="dropdownVersionButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">VERSIONS<i className="fa-sharp fa-solid fa-caret-down ml-4"></i></button>
                        <div className="dropdown-menu" aria-labelledby="dropdownVersionButton">
                            <p>Unreleased versions in this project</p>
                            <hr />
                            <div className='d-flex align-items-center'>
                                <Switch onChange={() => {
                                    setOnChangeVersion(!onChangeVersion)
                                }} value={onChangeVersion} />
                                <span className='ml-3'>Show version panel</span>
                            </div>
                        </div>
                    </div>
                    <div>
                        <button className='btn btn-primary' id="dropdownEpicButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">EPICS<i className="fa-sharp fa-solid fa-caret-down ml-4"></i></button>
                        <div className="dropdown-menu" aria-labelledby="dropdownEpicButton">
                            <Checkbox.Group style={{ width: '100%', margin: '10px' }} onChange={onChange}>
                                <Row>
                                    <Col span="16">
                                        <Checkbox value="A">A</Checkbox>
                                    </Col>
                                    <Col span="16">
                                        <Checkbox value="B">B</Checkbox>
                                    </Col>
                                    <Col span="16">
                                        <Checkbox value="C">C</Checkbox>
                                    </Col>
                                    <Col span="16">
                                        <Checkbox value="D">D</Checkbox>
                                    </Col>
                                    <Col span="16">
                                        <Checkbox value="E">E</Checkbox>
                                    </Col>
                                </Row>
                            </Checkbox.Group>
                            <hr />
                            <div className='d-flex align-items-center'>
                                <Switch onChange={() => {
                                    setOnChangeEpic(!onChangeEpic)
                                }} value={onChangeEpic} />
                                <span className='mr-3'>Show epic panel</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className='main-info-backlog' style={{ minHeight: '200px', display: onChangeEpic || onChangeVersion ? 'flex' : 'block' }}>
                    <div className="card version-info-backlog" style={{ width: '25rem', display: onChangeVersion ? 'block' : 'none', margin: '10px 5px' }}>
                        <div className='d-flex justify-content-between'>
                            <h6>Versions</h6>
                            <i className="fa-solid fa-xmark" onClick={() => {
                                setOnChangeVersion(!onChangeVersion)
                            }}></i>
                        </div>
                        <div className="card-body d-flex flex-column justify-content-center">
                            <img src="https://jira-frontend-bifrost.prod-east.frontend.public.atl-paas.net/assets/releases-80px.782fa98d.svg" />
                            <p>Versions help you package and schedule project deliveries.</p>
                            <p>Your unreleased versions will appear here so you can manage them directly from the backlog.</p>
                        </div>
                    </div>

                    <div className="card epic-info-backlog" style={{ width: '25rem', display: onChangeEpic ? 'block' : 'none', margin: '10px 5px' }}>
                        <div className='d-flex justify-content-between'>
                            <h6>Epci</h6>
                            <i className="fa-solid fa-xmark" onClick={() => {
                                setOnChangeEpic(!onChangeEpic)
                            }}></i>
                        </div>
                        <div className="card-body d-flex flex-column justify-content-center p-2">
                            <button style={{ width: '100%', textAlign: 'left' }} className='btn btn-transparent'>Issue without epic</button>
                            <div style={{border: '2px solid #aaa', borderRadius: '10px' }}>
                                <button style={{ width: '100%', textAlign: 'left' }} className="btn btn-transparent" type="button" data-toggle="collapse" data-target="#collapseExample" aria-expanded="false" aria-controls="collapseExample">
                                    <i className="fa-solid fa-caret-down mr-3"></i>Epic name 1
                                </button>
                                <div className="collapse " id="collapseExample">
                                    <div className='d-flex flex-column'>
                                        <div>
                                            <span>Issues (0)</span>
                                            <span>Completed (0)</span>
                                            <span>Unestimated (0)</span>
                                            <span>Estimate (0)</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div>
                        <NavLink to='#' onClick={() => {
                            dispatch(drawer_edit_form_action(<TaskForm />, 'Save', '760px'))
                        }}>Create issue in epic</NavLink>
                        <NavLink to='#'>Viewed linked pages</NavLink>
                        </div>
                    </div>

                    <div className='issues-info-backlog' style={{ width: '100%', margin: '10px' }}>
                        <h6>Backlog <span>7 issues</span></h6>
                        <ul style={{ listStyle: 'none', padding: 0, border: '1px solid #ddd' }}>
                            <li style={{ borderBottom: '1px solid #ddd', padding: '5px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div className='content-issue-backlog'>
                                    <i className="fa-solid fa-bookmark mr-2" style={{ color: '#65ba43', fontSize: '20px' }} ></i>
                                    <span>Development payment gateway for paypak</span>
                                </div>
                                <div className='attach-issue-backlog d-flex align-items-center  '>
                                    {/* specify which components does issue belong to? */}
                                    <Tag color="gold">MVP1</Tag>
                                    {/* specify which epics does issue belong to? */}
                                    <Tag className='ml-2' color="magenta">Payment gateway</Tag>
                                    {/* Assigness */}
                                    <div className='ml-2'>
                                        <Avatar icon={<UserOutlined />} />
                                    </div>
                                    {/* issue id */}
                                    <span className='ml-2'>WD-2735</span>
                                    {/* priority backlog */}
                                    <i className="fa-solid fa-arrow-up ml-2" style={{ color: '#e97f33', fontSize: '20px' }} />
                                </div>
                            </li>
                            <li style={{ borderBottom: 'none', padding: '5px 0', paddingLeft: '10px' }}>abcdef</li>
                        </ul>
                        <button className='btn btn-transparent btn-create-issue' style={{ fontSize: '14px', color: '#ddd' }}>
                            <i className="fa-regular fa-plus mr-2"></i>
                            Create issue
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
