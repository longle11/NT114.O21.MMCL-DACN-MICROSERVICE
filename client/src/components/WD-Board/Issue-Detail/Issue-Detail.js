import { Avatar, Breadcrumb, Button, Checkbox, Col, Row, Tag } from 'antd';
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { getIssuesBacklog} from '../../../redux/actions/IssueAction';
import { GetProcessListAction } from '../../../redux/actions/ListProjectAction';
import { iTagForPriorities, iTagForIssueTypes } from '../../../util/CommonFeatures';
import { getEpicList } from '../../../redux/actions/CategoryAction';
import { useNavigate, useParams } from 'react-router-dom';
import { UserOutlined } from '@ant-design/icons';
import Search from 'antd/es/input/Search';
import './Issue-Detail.css'
import { GET_ISSUES_BACKLOG } from '../../../redux/constants/constant';
import InfoModal from '../../Modal/InfoModal/InfoModal';
export default function IssueDetail() {
    const projectInfo = useSelector(state => state.listProject.projectInfo)
    const processList = useSelector(state => state.listProject.processList)
    const [issueInfo, setIssueInfo] = useState({})
    const issuesBacklog = useSelector(state => state.issue.issuesBacklog)
    const { id, issueId } = useParams()

    const navigate = useNavigate()


    useEffect(() => {
        dispatch(getIssuesBacklog(id))
        dispatch(GetProcessListAction(id))
        dispatch(getEpicList(id))
    }, [])
    const dispatch = useDispatch()

    const renderAllIssuesInProject = () => {

        if (Object.keys(issueInfo)?.length === 0) {
            if (issueId === 'issue-detail') {
                if (issuesBacklog && issuesBacklog?.length !== 0) {
                    dispatch({
                        type: GET_ISSUES_BACKLOG,
                        issuesBacklog: [...issuesBacklog]
                    })
                    setIssueInfo(issuesBacklog[0])
                }
            } else {
                const index = issuesBacklog?.findIndex(issue => issue._id === issueId)
                if (index !== -1) {
                    setIssueInfo(issuesBacklog[index])
                    //proceed to move that issue into top of all issues
                    const issueSplitted = issuesBacklog?.splice(index, 1)
                    dispatch({
                        type: GET_ISSUES_BACKLOG,
                        issuesBacklog: [...issueSplitted.concat(issuesBacklog)]
                    })
                }
            }
        }
        const getAllIssues = issuesBacklog?.map((issue, index) => {
            return <li onClick={() => {
                setIssueInfo(issue)
                navigate(`/projectDetail/${id}/issues/issue-detail/${issue?._id}`)
            }} className={`list-group-item`} key={issue._id.toString()} style={{ backgroundColor: issueInfo?._id === issue._id ? '#E9F2FF' : '#ffff  ' }}>
                <p>{issue.summary}</p>
                <div className='d-flex justify-content-between align-items-center'>
                    <div className='d-flex align-items-center'>
                        {iTagForIssueTypes(issue.issue_status, null, null)}
                        {iTagForPriorities(issue.issue_priority, null, null)}
                    </div>
                    <Avatar icon={<UserOutlined />} />
                </div>
            </li>
        })
        return <ul className="list-group">
            {getAllIssues}
        </ul>
    }
    return (
        <div style={{ overflow: 'none', height: '100vh' }}>
            <div className='issue-info-header'>
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
                <h4>Issues</h4>
                <div className='d-flex align-items-center'>
                    <Search
                        className='issue-search'
                        placeholder="Search issues"
                        style={{
                            width: 200
                        }}
                    />
                    <div className='issue-options d-flex'>
                        <div className='dropdown'>
                            <Button type='primary' className='mr-2 ml-2 btn-options' id="btn-option1 dropdownTypeMenu" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                Type <i className="fa fa-angle-down ml-2" style={{ fontSize: 13, fontWeight: 'bold' }}></i>
                            </Button>
                            <div className="dropdown-menu" aria-labelledby="dropdownTypeMenu" style={{ width: 'max-content', padding: '10px' }}>
                                <p style={{ fontSize: 13, marginBottom: 5 }}>STANDARD ISSUE TYPES</p>
                                <Checkbox.Group className='mb-3'>
                                    <Row>
                                        <Col span="16">
                                            <Checkbox value="0">{iTagForIssueTypes(0)}</Checkbox>
                                        </Col>
                                        <Col span="16">
                                            <Checkbox value="1">{iTagForIssueTypes(1)}</Checkbox>
                                        </Col>
                                        <Col span="16">
                                            <Checkbox value="2">{iTagForIssueTypes(2)}</Checkbox>
                                        </Col>
                                    </Row>
                                </Checkbox.Group>
                                <p style={{ fontSize: 13, marginBottom: 5 }}>SUB-TASK ISSUE TYPE</p>
                                <Checkbox value="3">Sub task</Checkbox>
                            </div>
                        </div>

                        <div className='dropdown'>
                            <Button type='primary' className='mr-2 btn-options' id="btn-option2 dropdownStatusMenu" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                Status <i className="fa fa-angle-down ml-2" style={{ fontSize: 13, fontWeight: 'bold' }}></i>
                            </Button>
                            <div className="dropdown-menu" aria-labelledby="dropdownStatusMenu">
                                <Checkbox.Group style={{ width: '100%', margin: '10px' }}>
                                    <Row>
                                        {processList.map((process) => {
                                            return <Col span="16">
                                                <Checkbox value={process._id}><Tag color={process.tag_color}>{process.name_process}</Tag></Checkbox>
                                            </Col>
                                        })}
                                    </Row>
                                </Checkbox.Group>
                            </div>
                        </div>
                        <div className='dropdown'>
                            <Button type='primary' className='mr-2 btn-options' id="btn-option3 dropdownAssigneeMenu" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                Assignee <i className="fa fa-angle-down ml-2" style={{ fontSize: 13, fontWeight: 'bold' }}></i>
                            </Button>
                            <div className="dropdown-menu" aria-labelledby="dropdownAssigneeMenu">

                            </div>
                        </div>
                        <div className='dropdown'>
                            <Button type='primary' className='mr-2 btn-options' id="btn-option4 dropdownMoreMenu" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                More <i className="fa fa-angle-down ml-2" style={{ fontSize: 13, fontWeight: 'bold' }}></i>
                            </Button>
                            <div className="dropdown-menu" aria-labelledby="dropdownMoreMenu">

                            </div>
                        </div>
                    </div>
                    <div>
                        <Button type='primary' className='mr-2 btn-options'>Clear option filter </Button>
                        <Button type='primary' className='mr-2 btn-options'>Save option filter </Button>
                    </div>
                </div>
            </div>
            <div className="issue-info-body" style={{ width: '100%', padding: '5px 10px' }}>
                <div className='row'>
                    <div className='issue-info-left col-2' style={{ border: '1px solid #dddd', padding: 0, borderRadius: '5px', height: 'fit-content', backgroundColor: '#091e420f' }}>
                        <div className='d-flex justify-content-between'>
                            <button className='btn btn-transparent'>Created <i className="fa-solid fa-caret-down ml-2"></i></button>
                            <div>
                                <button className='btn btn-transparent' style={{ fontSize: 13 }}><i className="fa-solid fa-sort"></i></button>
                                <button className='btn btn-transparent' onClick={() => {
                                    dispatch(getIssuesBacklog(id))
                                }}><i className="fa-solid fa-arrows-rotate" style={{ fontSize: 13 }}></i></button>
                            </div>
                        </div>
                        <div style={{ maxHeight: 450, scrollbarWidth: 'none', overflowY: 'auto' }}>
                            {renderAllIssuesInProject()}
                        </div>
                        <div style={{ padding: '8px', display: 'flex', justifyContent: 'center' }}>{issuesBacklog?.length === 0 ? "0 of 0" : `1 - ${issuesBacklog?.length} of ${issuesBacklog?.length}`}</div>
                    </div>
                    {/* col 10 row */}
                    {(issueInfo !== null || issueInfo !== undefined) && Object.keys(issueInfo).length === 0 ? <div className='col-10'>No issues</div> : <div className='col-10'>
                        <InfoModal issueInfo={issueInfo} displayNumberCharacterInSummarySubIssue={25}/>
                    </div>}
                </div>
            </div>
        </div>
    )
}
