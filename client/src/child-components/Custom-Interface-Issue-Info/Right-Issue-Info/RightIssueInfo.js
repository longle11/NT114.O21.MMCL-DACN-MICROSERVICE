import { Button, Progress, Tooltip } from 'antd'
import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { convertMinuteToFormat, convertTime } from '../../../validations/TimeValidation'
import TrackingTimeModal from '../../../components/Modal/TrackingTimeModal/TrackingTimeModal'
import { displayComponentInModal } from '../../../redux/actions/ModalAction'
import SubIssueComponent from '../../Sub-Issue-Component/SubIssueComponent'
import { checkConstraintPermissions } from '../../../util/CheckConstraintFields'
import './RightIssueInfo.css'
import { getValueOfNumberFieldInIssue } from '../../../util/IssueFilter'
import { aggregationFields, renderField, renderFieldArrayIssue, renderFieldArrayObjectIssue, renderFieldNumberIssue, renderFieldObjectIssue, renderFieldStringIssue, renderPinnedField } from '../../../util/IssueAttributesCreating'
import { updateInfoIssue } from '../../../redux/actions/IssueAction'
export default function RightIssueInfo(props) {
    const userInfo = props.userInfo
    const issueInfo = props.issueInfo
    const processList = props.processList
    const issuesInProject = props.issuesInProject
    const projectInfo = props.projectInfo
    const sprintList = props.sprintList
    const epicList = props.epicList
    const versionList = props.versionList
    const componentList = props.componentList
    const id = props.id
    const hanleClickDisplayAddSubIssue = props.hanleClickDisplayAddSubIssue
    const hanleClickEditSummaryInSubIssue = props.hanleClickEditSummaryInSubIssue
    const displayNumberCharacterInSummarySubIssue = props.displayNumberCharacterInSummarySubIssue
    const dispatch = useDispatch()

    const showAddSubIssue = props.showAddSubIssue
    const subIssueSummary = props.subIssueSummary


    const calculateProgress = () => {
        if (getValueOfNumberFieldInIssue(issueInfo, "timeSpent") !== 0 && getValueOfNumberFieldInIssue(issueInfo, "timeOriginalEstimate") !== 0) {
            return getValueOfNumberFieldInIssue(issueInfo, "timeSpent") / (getValueOfNumberFieldInIssue(issueInfo, "timeOriginalEstimate")) * 100
        }
        return 0
    }

    const renderContextField = () => {
        const leftContext1 = renderFieldStringIssue(issueInfo, 1, dispatch, projectInfo, userInfo, props.handleEditAttributeTag, props.editAttributeTag, sprintList, id, epicList, versionList)
        const leftContext2 = renderFieldNumberIssue(issueInfo, 1, dispatch, projectInfo, userInfo, props.handleEditAttributeTag, props.editAttributeTag, sprintList, id, epicList, versionList)
        const leftContext3 = renderFieldObjectIssue(issueInfo, 1, dispatch, projectInfo, userInfo, props.handleEditAttributeTag, props.editAttributeTag, sprintList, id, epicList, versionList)
        const leftContext4 = renderFieldArrayIssue(issueInfo, 1, dispatch, projectInfo, userInfo, props.handleEditAttributeTag, props.editAttributeTag, sprintList, id, epicList, versionList)
        const leftContext5 = renderFieldArrayObjectIssue(issueInfo, 1, dispatch, projectInfo, userInfo, props.handleEditAttributeTag, props.editAttributeTag, sprintList, id, epicList, versionList, componentList)
        const leftContextConcat = leftContext1?.concat(leftContext2, leftContext3, leftContext4, leftContext5)

        if (leftContextConcat !== null && leftContextConcat?.length > 0) {
            return <div style={{ width: '100%', marginTop: 10 }}>
                <Button
                    style={{
                        textAlign: 'left',
                        height: 'fit-content',
                        width: '100%',
                        padding: '10px 10px',
                        backgroundColor: 'transparent',
                        border: '1px solid #DFE1E6',
                        borderRadius: '3px 3px 0 0'
                    }}
                    type="button"
                    data-toggle="collapse"
                    data-target="#collapseInfoModal"
                    ria-expanded="false"
                    aria-controls="collapseInfoModal">
                    Details <span className='ml-2' style={{ fontSize: 12 }}> {aggregationFields(issueInfo, 1)}</span>
                </Button>
                <div className="collapse pt-2 show" id="collapseInfoModal" style={{ border: '1px solid #DFE1E6', borderTop: 'none', borderRadius: '0 0 3px 3px', padding: '0 10px' }}>
                    {leftContext1}
                    {leftContext2}
                    {leftContext3}
                    {leftContext4}
                    {leftContext5}
                </div>
            </div>
        }
        return <></>
    }

    const renderMoreField = () => {
        const leftMoreField1 = renderFieldStringIssue(issueInfo, 2, dispatch, projectInfo, userInfo, props.handleEditAttributeTag, props.editAttributeTag, sprintList, id, epicList, versionList)
        const leftMoreField2 = renderFieldNumberIssue(issueInfo, 2, dispatch, projectInfo, userInfo, props.handleEditAttributeTag, props.editAttributeTag, sprintList, id, epicList, versionList)
        const leftMoreField3 = renderFieldObjectIssue(issueInfo, 2, dispatch, projectInfo, userInfo, props.handleEditAttributeTag, props.editAttributeTag, sprintList, id, epicList, versionList)
        const leftMoreField4 = renderFieldArrayIssue(issueInfo, 2, dispatch, projectInfo, userInfo, props.handleEditAttributeTag, props.editAttributeTag, sprintList, id, epicList, versionList)
        const leftMoreField5 = renderFieldArrayObjectIssue(issueInfo, 2, dispatch, projectInfo, userInfo, props.handleEditAttributeTag, props.editAttributeTag, sprintList, id, epicList, versionList, componentList)

        const leftMoreFieldConcat = leftMoreField1?.concat(leftMoreField2, leftMoreField3, leftMoreField4, leftMoreField5)

        if (leftMoreFieldConcat !== null && leftMoreFieldConcat?.length > 0) {
            return <div style={{ width: '100%', marginTop: 10 }}>
                <Button
                    style={{
                        textAlign: 'left',
                        height: 'fit-content',
                        width: '100%',
                        padding: '10px 10px',
                        backgroundColor: 'transparent',
                        border: '1px solid #DFE1E6',
                        borderRadius: '3px 3px 0 0'
                    }}
                    type="button"
                    data-toggle="collapse"
                    data-target="#collapseMoreInfoModal"
                    aria-expanded="false"
                    aria-controls="collapseMoreInfoModal">
                    More info <span className='ml-2' style={{ fontSize: 12 }}>{aggregationFields(issueInfo, 2)}</span>
                </Button>
                <div className="collapse pt-2" id="collapseMoreInfoModal" style={{ border: '1px solid #DFE1E6', borderTop: 'none', borderRadius: '0 0 3px 3px', padding: '0 10px' }}>
                    {leftMoreField1}
                    {leftMoreField2}
                    {leftMoreField3}
                    {leftMoreField4}
                    {leftMoreField5}
                </div>
            </div>
        }
        return <></>
    }

    return (
        <div>
            {getValueOfNumberFieldInIssue(issueInfo, "issue_status") !== 4 ? <SubIssueComponent
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
            {
                renderPinnedField(issueInfo).length > 0 ? <div style={{ width: '100%', marginTop: 10 }}>
                    <Button
                        style={{
                            textAlign: 'left',
                            height: 'fit-content',
                            width: '100%',
                            padding: '10px 10px',
                            backgroundColor: 'transparent',
                            border: '1px solid #DFE1E6',
                            borderRadius: '3px 3px 0 0'
                        }}
                        type="button"
                        data-toggle="collapse"
                        data-target="#collapsePinnedInfoModal"
                        aria-expanded="false"
                        aria-controls="collapsePinnedInfoModal">
                        Your pinned fields
                    </Button>
                    <div className="collapse pt-2" id="collapsePinnedInfoModal" style={{ border: '1px solid #DFE1E6', borderTop: 'none', borderRadius: '0 0 3px 3px', padding: '0 10px' }}>
                        {
                            renderPinnedField(issueInfo)?.map(field => {
                                if (field) {
                                    return <div className="row d-flex align-items-center mt-2 mb-2 items-field">
                                        <span className='col-5 d-flex align-items-center' style={{ fontSize: 14, color: '#42526e', fontWeight: '500', display: 'flex', alignItems: 'center' }}>
                                            {field?.field_name}
                                            <Tooltip placement="topRight" title="Unpin">
                                                {field.pinned ? <a style={{ color: '#000' }} className="ml-2 field-pinned" onClick={() => {
                                                    dispatch(updateInfoIssue(issueInfo._id, issueInfo.project_id, {
                                                        [field.field_key_issue]: !field.pinned
                                                    }, null, null, userInfo.id, 'pinned', field.field_name, projectInfo, userInfo))
                                                }}><i style={{ color: '#FF8000' }} className="fa fa-thumbtack"></i></a> : <></>}
                                            </Tooltip>
                                        </span>
                                        <div className="col-7 item-value_field">
                                            {renderField(field.field_key_issue, props.handleEditAttributeTag, props.editAttributeTag, issueInfo, projectInfo, userInfo, sprintList, id, epicList, versionList)}
                                        </div>
                                    </div>
                                }
                                return null
                            })
                        }
                    </div>
                </div> : <></>
            }

            {renderContextField()}

            {renderMoreField()}

            <div className="time-tracking mt-2" style={{ cursor: 'pointer' }}>
                <span style={{ color: '#42526e', fontWeight: '500' }}>Time Tracking</span>
                <div>
                    <div>
                        <div className='d-flex align-items-center' style={{ width: '100%' }}>
                            <i className="fa fa-clock" />
                            <Progress style={{ width: '100%' }} onClick={() => {
                                if (checkConstraintPermissions(projectInfo, issueInfo, userInfo, 4)) {
                                    dispatch(displayComponentInModal(<TrackingTimeModal projectInfo={projectInfo} userInfo={userInfo} issueInfo={issueInfo} />, 500, null))
                                }
                            }} percent={Math.floor(calculateProgress())} size="small" status="active" />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span className="logged ml-4">{!getValueOfNumberFieldInIssue(issueInfo, "timeSpent") ? '0h' : convertMinuteToFormat(getValueOfNumberFieldInIssue(issueInfo, "timeSpent"))} logged</span>
                            <span className="estimate-time mr-2">
                                {getValueOfNumberFieldInIssue(issueInfo, "timeOriginalEstimate") !== 0 && getValueOfNumberFieldInIssue(issueInfo, "timeSpent") !== 0 ? (getValueOfNumberFieldInIssue(issueInfo, "timeOriginalEstimate") - getValueOfNumberFieldInIssue(issueInfo, "timeSpent") === 0 ? '0h' : convertMinuteToFormat(getValueOfNumberFieldInIssue(issueInfo, "timeOriginalEstimate") - getValueOfNumberFieldInIssue(issueInfo, "timeSpent"))) : '0h'} remaining
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
