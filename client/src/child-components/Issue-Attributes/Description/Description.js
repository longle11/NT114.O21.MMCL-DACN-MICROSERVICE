import React, { useState } from 'react'
import { updateInfoIssue } from '../../../redux/actions/IssueAction'
import { useDispatch } from 'react-redux'
import Parser from 'html-react-parser';
import { Editor } from '@tinymce/tinymce-react';
import { Button } from 'antd';
import { checkConstraintPermissions } from '../../../util/CheckConstraintFields';
import { NavLink } from 'react-router-dom';
import { getValueOfStringFieldInIssue } from '../../../util/IssueFilter';

export default function Description(props) {
    const userInfo = props.userInfo
    const issueInfo = props.issueInfo
    const projectInfo = props.projectInfo
    const dispatch = useDispatch()
    const [editDescription, setEditDescription] = useState(true)
    const [description, setDescription] = useState('')
    const handlEditorChange = (content, editor) => {
        setDescription(content)
    }
    const renderContentModal = () => {
        if (getValueOfStringFieldInIssue(issueInfo, "description") !== null && getValueOfStringFieldInIssue(issueInfo, "description")?.trim() !== '') {
            if (checkConstraintPermissions(projectInfo, issueInfo, userInfo, 9)) {
                return Parser(`${getValueOfStringFieldInIssue(issueInfo, "description")}`)
            } else {
                return <p className='text-danger'>You don't have permissions enough to see description</p>
            }
        }
        return <NavLink style={{ color: 'blue' }}>There is no description yet. Add Your Description</NavLink>
    }
    return (
        <div className="description">
            {editDescription ? (<p onKeyDown={() => { }} onClick={() => {
                if (checkConstraintPermissions(projectInfo, issueInfo, userInfo, 1)) {
                    setEditDescription(false)
                }
            }}>
                {renderContentModal()}
            </p>) : (
                <>
                    <Editor name='description'
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
                        initialValue={getValueOfStringFieldInIssue(issueInfo, "description")}
                        onEditorChange={handlEditorChange}
                    />

                    <div className='mt-2'>
                        <Button onClick={() => {
                            setEditDescription(true)
                            dispatch(updateInfoIssue(issueInfo?._id, issueInfo?.project_id?._id, { description: description }, '', '', userInfo?.id, "update", "description", projectInfo, userInfo))
                        }} type="primary" className='mr-2'>Save</Button>
                        <Button onClick={() => {
                            setEditDescription(true)
                        }}>Cancel</Button>
                    </div>
                </>
            )}
        </div>
    )
}
