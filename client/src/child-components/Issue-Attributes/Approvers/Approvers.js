import { Avatar, Select } from 'antd'
import React, { useState } from 'react'
import { updateUserInfo } from '../../../redux/actions/UserAction'
import { updateInfoIssue } from '../../../redux/actions/IssueAction'
import { useDispatch } from 'react-redux'
import { UserOutlined } from '@ant-design/icons'
import { checkConstraintPermissions } from '../../../util/CheckConstraintFields'
import { getValueOfArrayObjectFieldInIssue } from '../../../util/IssueFilter'
import { eyeSlashIcon } from '../../../util/icon'

export default function Approvers(props) {
    const issueInfo = props.issueInfo
    const userInfo = props.userInfo
    const projectInfo = props.projectInfo


    //tham số truyền vào sẽ là id của comment khi click vào chỉnh sửa
    const [addApprovers, setAddApprovers] = useState(true)
    const renderOptionAssignee = () => {
        return projectInfo?.members?.filter((value, index) => {
            const isExisted = getValueOfArrayObjectFieldInIssue(issueInfo, "approvers")?.findIndex((user) => {
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
        <div className="approvers mt-2">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)' }}>
                {
                    checkConstraintPermissions(projectInfo, issueInfo, userInfo, 9) ? (getValueOfArrayObjectFieldInIssue(issueInfo, "approvers")?.length > 0 ? <div className='d-flex'>
                        {getValueOfArrayObjectFieldInIssue(issueInfo, "approvers").map(user => {
                            return <span style={{ backgroundColor: '#e9eaf0', padding: '5px 10px', borderRadius: 5, width: 'fit-content', fontSize: 12, marginRight: 5 }} className='d-flex align-items-center font-weight-bold'><Avatar src={user?.avatar} size='small' className='mr-2' />
                                {user?.username}
                            </span>
                        })}
                    </div> : <span style={{ backgroundColor: '#e9eaf0', padding: '5px 10px', borderRadius: 5, width: 'fit-content', fontSize: 12 }} className='d-flex align-items-center font-weight-bold'><Avatar icon={<UserOutlined />} size='small' className='mr-2' /> Unassignee</span>) : eyeSlashIcon
                }
                {
                    checkConstraintPermissions(projectInfo, issueInfo, userInfo, 1) ? <div style={{ marginTop: 5 }}>
                        <button onKeyDown={() => { }} className='text-primary mt-2 mb-2 btn bg-transparent ml-2' style={{ width: 'max-content', fontSize: '12px', margin: '0px', cursor: 'pointer', display: addApprovers === false ? 'none' : 'block', padding: 0, textAlign: 'left' }} onClick={() => {
                            setAddApprovers(false)
                        }} >
                            <i className="fa fa-plus" style={{ marginRight: 5 }} />Add more
                        </button>
                    </div> : <></>
                }
            </div>
            {!addApprovers ? (
                <div>
                    <Select
                        onBlur={() => {
                            setAddApprovers(true)
                        }}
                        style={{ width: '200px', marginTop: 10 }}
                        placeholder="Select a person"
                        className='info-item-field'
                        onSelect={(value, option) => {
                            setAddApprovers(true)
                            const getUserIndex = projectInfo?.members.findIndex(user => user.user_info._id.toString() === value)
                            if (getUserIndex !== -1) {
                                //update user info will receive that task in auth service
                                dispatch(updateUserInfo(value, { assigned_issue: issueInfo?._id }))

                                dispatch(updateInfoIssue(issueInfo?._id, issueInfo?.project_id?._id, { approvers: value }, null, projectInfo?.members[getUserIndex].user_info.avatar, userInfo.id, "added", "approvers", projectInfo, userInfo))
                            }
                        }}
                        options={renderOptionAssignee()}
                    />
                </div>
            ) : <></>}
        </div>
    )
}
