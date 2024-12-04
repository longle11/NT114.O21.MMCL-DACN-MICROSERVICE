import { Editor } from '@tinymce/tinymce-react'
import React from 'react'

export default function Paragraph(props) {
    const setPositionNewIssueTagAdded = props.setPositionNewIssueTagAdded
    const positionNewIssueTagAdded = props.positionNewIssueTagAdded
    const is_edited = props.is_edited
    const issue_config = props.issue_config
    
    return (
        <div className='form-group'>
            <label>Default description</label>
            <Editor name='description'
                disabled={!is_edited}
                apiKey='golyll15gk3kpiy6p2fkqowoismjya59a44ly52bt1pf82oe'
                init={{
                    height: 250,
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
                initialValue={issue_config?.default_value}
                
                onEditorChange={(value) => {
                    setPositionNewIssueTagAdded({ ...positionNewIssueTagAdded, isModifyAvailable: true, data: { ...positionNewIssueTagAdded.data, default_value: value } })
                }}
            />
        </div>
    )
}