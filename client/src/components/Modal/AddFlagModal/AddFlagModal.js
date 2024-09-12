import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { handleClickOk, openModal } from '../../../redux/actions/ModalAction'
import { Editor } from '@tinymce/tinymce-react'
import { iTagForIssueTypes } from '../../../util/CommonFeatures'
import { updateInfoIssue } from '../../../redux/actions/IssueAction'
import { createCommentAction } from '../../../redux/actions/CommentAction'

export default function AddFlagModal(props) {
    const editCurrentIssue = props.editCurrentIssue
    const userInfo = props.userInfo
    const dispatch = useDispatch()
    const [editDescriptionFlagged, setEditDescriptionFlagged] = useState('')
    useEffect(() => {
        dispatch(handleClickOk(handleSelectIssueOk))
    }, [editDescriptionFlagged])
    const handleSelectIssueOk = () => {
        dispatch(updateInfoIssue(editCurrentIssue._id, editCurrentIssue.project_id._id, { isFlagged: true }, null, null, userInfo.id, "added", "flag"))

        if (editDescriptionFlagged.trim() !== '') {
            //create comment to emphasize that is the flag added into the issue
            dispatch(createCommentAction({ content: `<span><i style={{ fontSize: 23 }} className="fa fa-flag mr-1 flag-icon-comment"></i><span className="font-weight-bold"}>Flag added</span><span><br/>${editDescriptionFlagged}`, issueId: editCurrentIssue._id, creator: userInfo?.id }))
        }
        dispatch(openModal(false))
        setEditDescriptionFlagged('')
    }
    return (
        <div>
            <span className='mb-2 d-flex align-items-center'><span className='font-weight-bold mr-2'>Issue</span> {iTagForIssueTypes(editCurrentIssue?.issue_status, 'mr-1', null)} <span style={{ color: '#626F86' }}>WD-{editCurrentIssue?.ordinal_number} {editCurrentIssue?.summary}</span></span>
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
                    placeholder: 'Optional: Let your team know why this issue has been flagged',
                    height: 350,
                }}
                onEditorChange={(value) => {
                    setEditDescriptionFlagged(value)
                }}
            />
        </div>
    )
}
