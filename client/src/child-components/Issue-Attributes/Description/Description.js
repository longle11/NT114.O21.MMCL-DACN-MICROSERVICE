import React, { useState } from 'react'
import { updateInfoIssue } from '../../../redux/actions/IssueAction'
import { useDispatch } from 'react-redux'
import Parser from 'html-react-parser';
import { Editor } from '@tinymce/tinymce-react';
import { Button } from 'antd';

export default function Description(props) {
    const userInfo = props.userInfo
    const issueInfo = props.issueInfo
    const dispatch = useDispatch()
    const [editDescription, setEditDescription] = useState(true)
    const [description, setDescription] = useState('')
    const handlEditorChange = (content, editor) => {
        setDescription(content)
    }
    const renderContentModal = () => {
        if (issueInfo?.description !== null && issueInfo?.description?.trim() !== '') {
            return Parser(`${issueInfo?.description}`)
        }

        if (issueInfo?.creator._id === userInfo?.id) {
            return <p style={{ color: 'blue' }}>Add Your Description</p>
        }
        return <p>There is no description yet</p>
    }
    return (
        <div className="description">
            <p style={{ fontWeight: 'bold', fontSize: '15px' }}>Description</p>
            {editDescription ? (<p onKeyDown={() => { }} onDoubleClick={() => {
                if (issueInfo?.creator?._id === userInfo?.id) {
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
                        initialValue={issueInfo?.description}
                        onEditorChange={handlEditorChange}
                    />

                    <div className='mt-2'>
                        <Button onClick={() => {
                            setEditDescription(true)
                            dispatch(updateInfoIssue(issueInfo?._id, issueInfo?.project_id?._id, { description: description }, '', '', userInfo?.id, "update", "description"))
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
