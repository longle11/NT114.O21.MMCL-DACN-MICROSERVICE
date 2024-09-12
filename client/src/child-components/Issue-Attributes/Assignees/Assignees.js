import { Avatar, Select } from 'antd'
import React, { useState } from 'react'
import { updateUserInfo } from '../../../redux/actions/UserAction'
import { updateInfoIssue } from '../../../redux/actions/IssueAction'
import { useDispatch } from 'react-redux'
import { UserOutlined } from '@ant-design/icons'
import { checkConstraintPermissions } from '../../../util/CheckConstraintFields'

export default function Assignees(props) {
    const issueInfo = props.issueInfo
    const userInfo = props.userInfo
    const projectInfo = props.projectInfo


    //tham số truyền vào sẽ là id của comment khi click vào chỉnh sửa
    const [addAssignee, setAddAssignee] = useState(true)
    const renderOptionAssignee = () => {
        return projectInfo?.members?.filter((value, index) => {
            const isExisted = issueInfo?.assignees?.findIndex((user) => {
                return user._id === value.user_info._id
            })
            return !(issueInfo?.creator._id === value.user_info._id || isExisted !== -1)
        }).map((valueIssue, index) => {
            return {
                label: <span><span style={{ fontWeight: 'bold' }}>{valueIssue.user_info.username}</span> ({valueIssue.user_info.email})</span>,
                value: valueIssue.user_info._id
            }
        })
    }
    const dispatch = useDispatch()
    return (
        <div className="assignees mt-3">
            <span style={{ color: '#42526e', fontWeight: '500', marginBottom: 5, display: 'inline-block' }}>Assignees</span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)' }}>
                {issueInfo?.assignees?.length > 0 ? <div className='d-flex'>
                    {issueInfo?.assignees.map(user => {
                        return <span style={{ backgroundColor: '#e9eaf0', padding: '5px 10px', borderRadius: 5, width: 'fit-content', fontSize: 12, marginRight: 5 }} className='d-flex align-items-center font-weight-bold'><Avatar src={user?.avatar} size='small' className='mr-2' />
                            {user?.username}
                        </span>
                    })}
                </div> : <span style={{ backgroundColor: '#e9eaf0', padding: '5px 10px', borderRadius: 5, width: 'fit-content', fontSize: 12 }} className='d-flex align-items-center font-weight-bold'><Avatar icon={<UserOutlined />} size='small' className='mr-2' /> Unassignee</span>}
                {
                    checkConstraintPermissions(projectInfo, issueInfo, userInfo, 12) ? <div style={{ width: '100%', marginTop: 5 }}>
                    <button onKeyDown={() => { }} className='text-primary mt-2 mb-2 btn bg-transparent ml-2' style={{ width: 'max-content', fontSize: '12px', margin: '0px', cursor: 'pointer', display: addAssignee === false ? 'none' : 'block', padding: 0, textAlign: 'left' }} onClick={() => {
                        setAddAssignee(false)
                    }} >
                        <i className="fa fa-plus" style={{ marginRight: 5 }} />Add more
                    </button>
                </div> : <></>
                }

            </div>
            {!addAssignee ? (
                <div>
                    <Select
                        onBlur={() => {
                            setAddAssignee(true)
                        }}
                        style={{ width: '200px', marginTop: 10 }}
                        placeholder="Select a person"
                        onSelect={(value, option) => {
                            setAddAssignee(true)
                            const getUserIndex = projectInfo?.members.findIndex(user => user.user_info._id.toString() === value)
                            if (getUserIndex !== -1) {
                                //update user info will receive that task in auth service
                                dispatch(updateUserInfo(value, { assigned_issue: issueInfo?._id }))

                                dispatch(updateInfoIssue(issueInfo?._id, issueInfo?.issueInfo?._id, { assignees: value }, null, projectInfo?.members[getUserIndex].user_info.avatar, userInfo.id, "added", "assignees"))
                            }
                        }}
                        options={renderOptionAssignee()}
                    />
                </div>
            ) : <></>}
        </div>
    )
}
