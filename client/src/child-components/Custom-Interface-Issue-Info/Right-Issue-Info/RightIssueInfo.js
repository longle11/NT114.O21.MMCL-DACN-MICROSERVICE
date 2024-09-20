import { Button, Progress } from 'antd'
import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { convertMinuteToFormat, convertTime } from '../../../validations/TimeValidation'
import TrackingTimeModal from '../../../components/Modal/TrackingTimeModal/TrackingTimeModal'
import { displayComponentInModal } from '../../../redux/actions/ModalAction'
import Reporter from '../../Issue-Attributes/Reporter/Reporter'
import CurrentSprint from '../../Issue-Attributes/Current-Sprint/CurrentSprint'
import EpicLink from '../../Issue-Attributes/Epic-Link/EpicLink'
import FixVersion from '../../Issue-Attributes/Fix-Version/FixVersion'
import StoryPoint from '../../Issue-Attributes/Story-Point/StoryPoint'
import Component from '../../Issue-Attributes/Component/Component'
import IssuePriority from '../../Issue-Attributes/Issue-Priority/IssuePriority'
import TimeOriginalEstimate from '../../Issue-Attributes/Time-Original-Estimate/TimeOriginalEstimate'
import Assignees from '../../Issue-Attributes/Assignees/Assignees'
import SubIssueComponent from '../../Sub-Issue-Component/SubIssueComponent'
import Parent from '../../Issue-Attributes/Parent/Parent'
import { checkConstraintPermissions } from '../../../util/CheckConstraintFields'
import StartEndDate from '../../Issue-Attributes/Start-End-Date/StartEndDate'
import './RightIssueInfo.css'
export default function RightIssueInfo(props) {
    const userInfo = props.userInfo
    const issueInfo = props.issueInfo
    const processList = props.processList
    const issuesInProject = props.issuesInProject
    const projectInfo = props.projectInfo
    const sprintList = props.sprintList
    const epicList = props.epicList
    const versionList = props.versionList
    const id = props.id
    const hanleClickDisplayAddSubIssue = props.hanleClickDisplayAddSubIssue
    const hanleClickEditSummaryInSubIssue = props.hanleClickEditSummaryInSubIssue
    const displayNumberCharacterInSummarySubIssue = props.displayNumberCharacterInSummarySubIssue
    const dispatch = useDispatch()

    const showAddSubIssue = props.showAddSubIssue
    const subIssueSummary = props.subIssueSummary
    const [editAttributeTag, setEditAttributeTag] = useState('')

    const handleEditAttributeTag = (status) => {
        setEditAttributeTag(status)
    }

    const calculateProgress = () => {
        if (issueInfo?.timeSpent !== 0 && issueInfo?.timeOriginalEstimate !== 0) {
            return issueInfo?.timeSpent / (issueInfo?.timeOriginalEstimate) * 100
        }
        return 0
    }

    return (
        <div className="col-4 p-0"
            style={{ height: '90%', overflowY: 'auto', scrollbarWidth: 'none' }}>
            {issueInfo?.issue_status !== 4 ? <SubIssueComponent
                projectInfo={projectInfo}
                issueInfo={issueInfo}
                processList={processList}
                userInfo={userInfo}
                issuesInProject={issuesInProject}
                id={id}
                showAddSubIssue={showAddSubIssue}
                subIssueSummary={subIssueSummary}
                hanleClickDisplayAddSubIssue={hanleClickDisplayAddSubIssue}
                hanleClickEditSummaryInSubIssue={hanleClickEditSummaryInSubIssue}
                displayNumberCharacterInSummarySubIssue={displayNumberCharacterInSummarySubIssue} /> : <></>}
            {/* For assignees */}
            <Assignees
                projectInfo={projectInfo}
                userInfo={userInfo}
                issueInfo={issueInfo} />

            <div style={{ width: '100%', marginTop: 10 }}>
                <Button style={{ textAlign: 'left', height: 'fit-content', width: '100%', padding: '10px 10px', backgroundColor: 'transparent', border: '1px solid #DFE1E6', borderRadius: '3px 3px 0 0' }} type="button" data-toggle="collapse" data-target="#collapseInfoModal" aria-expanded="false" aria-controls="collapseInfoModal">
                    Details <span className='ml-2' style={{ fontSize: 12 }}>Labels, Sprint, Epic Link, Fix Version,....</span>
                </Button>
                <div className="collapse pt-2" id="collapseInfoModal" style={{ border: '1px solid #DFE1E6', borderTop: 'none', borderRadius: '0 0 3px 3px', padding: '0 10px' }}>
                    <Reporter issueInfo={issueInfo} />

                    {issueInfo?.issue_status !== 4 ? <CurrentSprint
                        handleEditAttributeTag={handleEditAttributeTag}
                        editAttributeTag={editAttributeTag}
                        issueInfo={issueInfo}
                        projectInfo={projectInfo}
                        id={id}
                        userInfo={userInfo}
                        sprintList={sprintList} /> : <></>}

                    {issueInfo?.issue_status !== 4 ? <EpicLink
                        handleEditAttributeTag={handleEditAttributeTag}
                        editAttributeTag={editAttributeTag}
                        issueInfo={issueInfo}
                        projectInfo={projectInfo}
                        id={id}
                        userInfo={userInfo}
                        epicList={epicList} /> : <></>}

                    {issueInfo?.issue_status !== 4 ? <FixVersion
                        handleEditAttributeTag={handleEditAttributeTag}
                        editAttributeTag={editAttributeTag}
                        issueInfo={issueInfo}
                        projectInfo={projectInfo}
                        id={id}
                        userInfo={userInfo}
                        versionList={versionList} /> : <></>}

                    {issueInfo?.issue_status !== 4 ? <Component
                        handleEditAttributeTag={handleEditAttributeTag}
                        editAttributeTag={editAttributeTag} /> : <></>}

                    {issueInfo?.issue_status === 4 ? <Parent issueParentInfo={issueInfo?.parent} /> : <></>}

                    <StoryPoint handleEditAttributeTag={handleEditAttributeTag}
                        editAttributeTag={editAttributeTag}
                        issueInfo={issueInfo}
                        projectInfo={projectInfo}
                        userInfo={userInfo} />

                    <StartEndDate handleEditAttributeTag={handleEditAttributeTag}
                        editAttributeTag={editAttributeTag}
                        date={issueInfo?.start_date}
                        projectInfo={projectInfo}
                        name_date="Start Date"
                        type_date="start_date"
                        userInfo={userInfo}
                        issueInfo={issueInfo}
                    />

                    <StartEndDate handleEditAttributeTag={handleEditAttributeTag}
                        editAttributeTag={editAttributeTag}
                        date={issueInfo?.end_date}
                        projectInfo={projectInfo}
                        name_date="End Date"
                        type_date="end_date"
                        userInfo={userInfo}
                        issueInfo={issueInfo}
                    />

                    <IssuePriority handleEditAttributeTag={handleEditAttributeTag}
                        editAttributeTag={editAttributeTag}
                        issueInfo={issueInfo}
                        projectInfo={projectInfo}
                        userInfo={userInfo} />
                    <TimeOriginalEstimate handleEditAttributeTag={handleEditAttributeTag}
                        editAttributeTag={editAttributeTag}
                        projectInfo={projectInfo}
                        issueInfo={issueInfo}
                        userInfo={userInfo} />

                </div>
            </div>
            <div className="time-tracking mt-2" style={{ cursor: 'pointer' }}>
                <span style={{ color: '#42526e', fontWeight: '500' }}>Time Tracking</span>
                <div>
                    <div>
                        <div className='d-flex align-items-center' style={{ width: '100%' }}>
                            <i className="fa fa-clock" />
                            <Progress style={{ width: '100%' }} onClick={() => {
                                if (checkConstraintPermissions(projectInfo, issueInfo, userInfo, 15)) {
                                    dispatch(displayComponentInModal(<TrackingTimeModal projectInfo={projectInfo} userInfo={userInfo} issueInfo={issueInfo} />, 500, null))
                                }
                            }} percent={Math.floor(calculateProgress())} size="small" status="active" />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span className="logged ml-4">{issueInfo?.timeSpent === 0 ? '0h' : convertMinuteToFormat(issueInfo?.timeSpent)} logged</span>
                            <span className="estimate-time mr-2">
                                {issueInfo?.timeOriginalEstimate !== 0 && issueInfo?.timeSpent !== 0 ? (issueInfo?.timeOriginalEstimate - issueInfo?.timeSpent === 0 ? '0h' : convertMinuteToFormat(issueInfo?.timeOriginalEstimate - issueInfo?.timeSpent)) : '0h'} remaining
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            <div style={{ color: '#929398' }}>Created at {convertTime(issueInfo?.createAt, true)}</div>
            <div style={{ color: '#929398' }}>{convertTime(issueInfo?.createAt) !== convertTime(issueInfo?.updateAt) ? `Updated at ${convertTime(issueInfo?.updateAt)}` : "No updated recently"}</div>
        </div>
    )
}
