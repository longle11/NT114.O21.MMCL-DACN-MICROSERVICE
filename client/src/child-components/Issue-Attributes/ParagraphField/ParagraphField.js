import React, { useState } from 'react'
import { updateInfoIssue } from '../../../redux/actions/IssueAction'
import { useDispatch } from 'react-redux'
import Parser from 'html-react-parser';
import { Editor } from '@tinymce/tinymce-react';
import { Button } from 'antd';
import { checkConstraintPermissions } from '../../../util/CheckConstraintFields';
import { NavLink } from 'react-router-dom';
import { getValueOfStringFieldInIssue } from '../../../util/IssueFilter';

export default function ParagraphField(props) {
    const userInfo = props.userInfo
    const issueInfo = props.issueInfo
    const projectInfo = props.projectInfo
    const field_key_issue = props.field_key_issue
    const dispatch = useDispatch()
    const [editParagraph, setEditParagraph] = useState(true)
    const [paragraph, setParagraph] = useState('')
    const handlEditorChange = (content, editor) => {
        setParagraph(content)
    }
    const renderContentModal = () => {
        if (getValueOfStringFieldInIssue(issueInfo, field_key_issue) !== null && getValueOfStringFieldInIssue(issueInfo, field_key_issue)?.trim() !== '') {
            if (checkConstraintPermissions(projectInfo, issueInfo, userInfo, 9)) {
                return Parser(`${getValueOfStringFieldInIssue(issueInfo, field_key_issue)}`)
            } else {
                return <p className='text-danger'>You don't have permissions enough to see paragraph</p>
            }
        }
        return <NavLink style={{ color: 'blue' }}>There is no paragraph yet. Add Your</NavLink>
    }
    return (
        <div className="paragraph">
            {editParagraph ? (<p onKeyDown={() => { }} onClick={() => {
                if (checkConstraintPermissions(projectInfo, issueInfo, userInfo, 1)) {
                    setEditParagraph(false)
                }
            }}>
                {renderContentModal()}
            </p>) : (
                <>
                    <Editor name='paragraph'
                        apiKey='golyll15gk3kpiy6p2fkqowoismjya59a44ly52bt1pf82oe'
                        init={{
                            plugins: 'anchor autolink charmap codesample emoticons image link lists media searchreplace table visualblocks wordcount linkchecker',
                            toolbar: 'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table | align lineheight | numlist bullist indent outdent | emoticons charmap | removeformat',
                            tinycomments_mode: 'embedded',
                            tinycomments_author: 'Author name',
                            mergetags_list: [
                                { value: 'First.Name', title: 'First Name' },
                                { value: 'Email', title: 'Email' },
                            ],
                            ai_request: (request, respondWith) => respondWith.string(() => Promise.reject("See docs to implement AI Assistant")),
                        }}
                        initialValue={getValueOfStringFieldInIssue(issueInfo, field_key_issue)}
                        onEditorChange={handlEditorChange}
                    />

                    <div className='mt-2'>
                        <Button onClick={() => {
                            setEditParagraph(true)
                            dispatch(updateInfoIssue(issueInfo?._id, issueInfo?.project_id?._id, { [field_key_issue]: paragraph }, '', '', userInfo?.id, "update", field_key_issue, projectInfo, userInfo))
                        }} type="primary" className='mr-2'>Save</Button>
                        <Button onClick={() => {
                            setEditParagraph(true)
                        }}>Cancel</Button>
                    </div>
                </>
            )}
        </div>
    )
}
