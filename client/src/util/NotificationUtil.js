import { notification } from 'antd';
import { createNotificationAction } from '../redux/actions/NotificationAction';
import { delay } from './Delay';
import { getValueOfArrayObjectFieldInIssue, getValueOfNumberFieldInIssue } from './IssueFilter';
export const showNotificationWithIcon = (type, message, description) => {
    if (type === "success") {
        notification.success({
            message: message,
            description: description,
            duration: 1
        });
    } else if (type === "error") {
        notification.error({
            message: message,
            description: description,
            duration: 1
        });
    }
}

const renderAssigneesOnlyId = (issues) => {
    if (issues?.length > 0) {
        return issues.map(issue => {
            var tempIssue = { ...issue }
            const getIndexAssignees = issue.issue_data_type_array_object.findIndex(field => field.field_key_issue === 'assignees')
            if (getIndexAssignees !== -1) {
                const value = issue.issue_data_type_array_object[getIndexAssignees].value
                if (!value) {
                    return issue
                }
                if (value?.length > 0) {
                    if (Object.keys(value[0]).length > 0) {
                        tempIssue.issue_data_type_array_object[getIndexAssignees].value = issue.issue_data_type_array_object[getIndexAssignees].value.map(user => user._id.toString())
                        return tempIssue
                    }
                }

                //this case assignees don't reference to any user model
                return issue
            }
            return {}
        })
    }

    var tempIssue = { ...issues }
    const getIndexAssignees = issues.issue_data_type_array_object.findIndex(field => field.field_key_issue === 'assignees')
    if (getIndexAssignees !== -1) {
        const value = issues.issue_data_type_array_object[getIndexAssignees].value
        if (!value) {
            return issues
        }
        if (Object.keys(value).length > 0) {
            tempIssue.issue_data_type_array_object[getIndexAssignees].value = issues.issue_data_type_array_object[getIndexAssignees].value.map(user => user._id.toString())
            return tempIssue
        }

        return issues
    }
    return {}
}

export const users_notifications = [
    {
        name: 'All users in project (except the creator)',
        id: 0
    },
    {
        name: 'Assignees in issues',
        id: 1
    },
    {
        name: 'Current User',
        id: 2
    },
    {
        name: 'Reporter',
        id: 3
    },
    {
        name: 'Project Lead',
        id: 4
    },
    {
        name: 'Project Role',
        id: -1   // in database it should not be displayed => 5 for administrators, 6 for members and 7 for viewers
    },
    {
        name: 'Administrator',
        id: 5
    },
    {
        name: 'Member',
        id: 6
    },
    {
        name: 'Viewer',
        id: 7
    }
]

const renderValidUsers = (types_user, issueInfo, userInfo, projectInfo) => {
    const getAllValidUsers = []

    if (types_user.includes(0)) {
        projectInfo?.members
            ?.filter(user => user.user_info._id !== userInfo.id)
            ?.forEach(user => {
                console.log("user ", user);
                
                getAllValidUsers.push(user.user_info._id.toString())
            })
    }

    if (types_user.includes(1)) {
        getValueOfArrayObjectFieldInIssue(issueInfo, "assignees")?.forEach(user => {
            if (!getAllValidUsers.includes(user.toString())) {
                getAllValidUsers.push(user.toString())
            }
        })
    }
    if (types_user.includes(2)) {
        if (!getAllValidUsers.includes(userInfo.id.toString())) {
            getAllValidUsers.push(userInfo.id.toString())
        }
    }

    //administrator
    if (types_user.includes(5)) {
        projectInfo?.members?.forEach(ele => {
            if (ele.user_role === 0 && !getAllValidUsers.includes(ele.user_info._id.toString())) {
                getAllValidUsers.push(ele.user_info._id.toString())
            }
        })
    }

    //member
    if (types_user.includes(6)) {
        projectInfo?.members?.forEach(ele => {
            if (ele.user_role === 1 && !getAllValidUsers.includes(ele.user_info._id.toString())) {
                getAllValidUsers.push(ele.user_info._id.toString())
            }
        })
    }

    //viewer
    if (types_user.includes(7)) {
        projectInfo?.members?.forEach(ele => {
            if (ele.user_role === 2 && !getAllValidUsers.includes(ele.user_info._id.toString())) {
                getAllValidUsers.push(ele.user_info._id.toString())
            }
        })
    }

    return getAllValidUsers
}

// check condition for sending notification to valid users => notification_id = 0
export const sendNotificationToValidUserWithCreatingIssues = async (projectInfo, userInfo, issueInfo, dispatch, creator_history) => {
    const getIndex = projectInfo?.notification_config?.findIndex(notification => {
        return notification.notification_id === 0 && notification.is_activated
    })
    if (getIndex !== -1) {

        const types_user = projectInfo?.notification_config[getIndex].user_types_is_received_notifications
        const getAllValidUsers = renderValidUsers(types_user, issueInfo, userInfo, projectInfo)
        for (let index = 0; index < getAllValidUsers.length; index++) {
            const link = `/projectDetail/${projectInfo?._id.toString()}/issues/issue-detail/${issueInfo._id.toString()}`
            dispatch(createNotificationAction({
                project_id: projectInfo?._id.toString(),
                send_from: creator_history,
                send_to: getAllValidUsers[index],
                link_url: link,
                content: `<span>Created new ${getValueOfNumberFieldInIssue(issueInfo, "issue_status") !== 4 ? "issue" : "sub-issue"} in <NavLink className="edit-navlink-notification ml-1 mr-1" to={${link}}>WD-${issueInfo.ordinal_number}</NavLink> issue </span>`,
                action_type: "issue:created"
            }))
            await delay(200)
        }
    }
    return null //don't create any notification and send to valid users
}


// check condition for sending notification to valid users => notification_id = 1
export const sendNotificationToValidUserWithEditingIssues = async (projectInfo, userInfo, issueInfo, dispatch, creator_history, edited_type) => {
    const getIndex = projectInfo?.notification_config?.findIndex(notification => {
        return notification.notification_id === 1 && notification.is_activated
    })

    if (getIndex !== -1) {

        const types_user = projectInfo.notification_config[getIndex].user_types_is_received_notifications

        const getAllValidUsers = renderValidUsers(types_user, issueInfo, userInfo, projectInfo)

        for (let index = 0; index < getAllValidUsers.length; index++) {
            const link = `/projectDetail/${projectInfo?._id.toString()}/issues/issue-detail/${issueInfo._id.toString()}`
            dispatch(createNotificationAction({
                project_id: projectInfo?._id.toString(),
                send_from: creator_history,
                send_to: getAllValidUsers[index],
                link_url: link,
                content: `<span>Updated ${edited_type} in <NavLink className="edit-navlink-notification ml-1 mr-1" to={${link}}>WD-${issueInfo.ordinal_number}</NavLink> issue </span>`,
                action_type: "issue:updated"
            }))

            await delay(200)
        }
    }
    return null //don't create any notification and send to valid users
}


// check condition for sending notification to valid users => notification_id = 2
export const sendNotificationToValidUserWithAssigningToIssue = async (projectInfo, userInfo, issueInfo, dispatch, creator_history, added_user, add_user_name) => {
    const getIndex = projectInfo?.notification_config?.findIndex(notification => {
        return notification.notification_id === 1 && notification.is_activated
    })

    if (getIndex !== -1) {

        const types_user = projectInfo.notification_config[getIndex].user_types_is_received_notifications

        const getAllValidUsers = renderValidUsers(types_user, issueInfo, userInfo, projectInfo)

        for (let index = 0; index < getAllValidUsers.length; index++) {
            const link = `/projectDetail/${projectInfo?._id.toString()}/issues/issue-detail/${issueInfo._id.toString()}`
            dispatch(createNotificationAction({
                project_id: projectInfo?._id.toString(),
                send_from: creator_history,
                send_to: getAllValidUsers[index],
                link_url: link,
                content: `<span>Add ${added_user === getAllValidUsers[index] ? "you" : add_user_name} in <NavLink className="edit-navlink-notification ml-1 mr-1" to={${link}}>WD-${issueInfo.ordinal_number}</NavLink> issue </span>`,
                action_type: "issue-user:added"
            }))

            await delay(200)
        }
    }
    return null //don't create any notification and send to valid users
}


// check condition for sending notification to valid users => notification_id = 5
export const sendNotificationToValidUserWithSomeoneMadesComments = async (projectInfo, userInfo, issueInfo, dispatch) => {
    const getIndex = projectInfo?.notification_config?.findIndex(notification => {
        return notification.notification_id === 5 && notification.is_activated
    })

    if (getIndex !== -1) {

        const types_user = projectInfo.notification_config[getIndex].user_types_is_received_notifications
        const adjustAssignees = renderAssigneesOnlyId(issueInfo)
        const getAllValidUsers = renderValidUsers(types_user, adjustAssignees, userInfo, projectInfo)

        for (let index = 0; index < getAllValidUsers.length; index++) {
            const link = `/projectDetail/${projectInfo?._id.toString()}/issues/issue-detail/${issueInfo._id.toString()}`
            dispatch(createNotificationAction({
                project_id: projectInfo?._id.toString(),
                send_from: userInfo.id,
                send_to: getAllValidUsers[index],
                link_url: link,
                content: `<span>Post a comment in <NavLink className="edit-navlink-notification ml-1 mr-1" to={${link}}>WD-${issueInfo.ordinal_number}</NavLink> issue </span>`,
                action_type: "issue-comment:added"
            }))

            await delay(200)
        }
    }
    return null //don't create any notification and send to valid users
}

// check condition for sending notification to valid users => notification_id = 6
export const sendNotificationToValidUserWithSomeoneModifyTheirComments = async (projectInfo, userInfo, issueInfo, dispatch) => {
    const getIndex = projectInfo?.notification_config?.findIndex(notification => {
        return notification.notification_id === 6 && notification.is_activated
    })

    if (getIndex !== -1) {

        const types_user = projectInfo.notification_config[getIndex].user_types_is_received_notifications
        const adjustAssignees = renderAssigneesOnlyId(issueInfo)
        const getAllValidUsers = renderValidUsers(types_user, adjustAssignees, userInfo, projectInfo)

        for (let index = 0; index < getAllValidUsers.length; index++) {
            const link = `/projectDetail/${projectInfo?._id.toString()}/issues/issue-detail/${issueInfo._id.toString()}`
            dispatch(createNotificationAction({
                project_id: projectInfo?._id.toString(),
                send_from: userInfo.id,
                send_to: getAllValidUsers[index],
                link_url: link,
                content: `<span>Modify a comment in <NavLink className="edit-navlink-notification ml-1 mr-1" to={${link}}>WD-${issueInfo.ordinal_number}</NavLink> issue </span>`,
                action_type: "issue-comment:updated"
            }))

            await delay(200)
        }
    }
    return null //don't create any notification and send to valid users
}


// check condition for sending notification to valid users => notification_id = 7
export const sendNotificationToValidUserWithSomeoneDeletesTheirComments = async (projectInfo, userInfo, issueInfo, dispatch) => {
    const getIndex = projectInfo?.notification_config?.findIndex(notification => {
        return notification.notification_id === 7 && notification.is_activated
    })

    if (getIndex !== -1) {

        const types_user = projectInfo.notification_config[getIndex].user_types_is_received_notifications
        const adjustAssignees = renderAssigneesOnlyId(issueInfo)
        const getAllValidUsers = renderValidUsers(types_user, adjustAssignees, userInfo, projectInfo)

        for (let index = 0; index < getAllValidUsers.length; index++) {
            const link = `/projectDetail/${projectInfo?._id.toString()}/issues/issue-detail/${issueInfo._id.toString()}`
            dispatch(createNotificationAction({
                project_id: projectInfo?._id.toString(),
                send_from: userInfo.id,
                send_to: getAllValidUsers[index],
                link_url: link,
                content: `<span>Delete a comment in <NavLink className="edit-navlink-notification ml-1 mr-1" to={${link}}>WD-${issueInfo.ordinal_number}</NavLink> issue </span>`,
                action_type: "issue-comment:deleted"
            }))

            await delay(200)
        }
    }
    return null //don't create any notification and send to valid users
}


// check condition for sending notification to valid users => notification_id = 8
export const sendNotificationToValidUserWithSomeoneWriteTheirWorklog = async (projectInfo, userInfo, issueInfo, dispatch) => {
    const getIndex = projectInfo?.notification_config?.findIndex(notification => {
        return notification.notification_id === 8 && notification.is_activated
    })

    if (getIndex !== -1) {

        const types_user = projectInfo.notification_config[getIndex].user_types_is_received_notifications
        const adjustAssignees = renderAssigneesOnlyId(issueInfo)
        const getAllValidUsers = renderValidUsers(types_user, adjustAssignees, userInfo, projectInfo)

        for (let index = 0; index < getAllValidUsers.length; index++) {
            const link = `/projectDetail/${projectInfo?._id.toString()}/issues/issue-detail/${issueInfo._id.toString()}`
            dispatch(createNotificationAction({
                project_id: projectInfo?._id.toString(),
                send_from: userInfo.id,
                send_to: getAllValidUsers[index],
                link_url: link,
                content: `<span>Create a worklog in <NavLink className="edit-navlink-notification ml-1 mr-1" to={${link}}>WD-${issueInfo.ordinal_number}</NavLink> issue </span>`,
                action_type: "issue-worklog:created"
            }))

            await delay(200)
        }
    }
    return null //don't create any notification and send to valid users
}


// check condition for sending notification to valid users => notification_id = 13
export const sendNotificationToValidUserWithSprintStarted = async (projectInfo, userInfo, sprintInfo, dispatch) => {
    const getIndex = projectInfo?.notification_config?.findIndex(notification => {
        return notification.notification_id === 13 && notification.is_activated
    })

    if (getIndex !== -1) {
        const types_user = projectInfo.notification_config[getIndex].user_types_is_received_notifications
        const adjustAssignees = renderAssigneesOnlyId(sprintInfo?.issue_list)
        const getAllValidUsers = []

        adjustAssignees?.forEach(issue => {
            const users = renderValidUsers(types_user, issue, userInfo, projectInfo)
            users.forEach(user => {
                if(!getAllValidUsers.includes(user)) {
                    getAllValidUsers.push(user)
                }
            })
        })
        for (let index = 0; index < getAllValidUsers.length; index++) {
            const link = `/projectDetail/${projectInfo?._id.toString()}/board/${sprintInfo?._id}`
            dispatch(createNotificationAction({
                project_id: projectInfo?._id.toString(),
                send_from: userInfo.id,
                send_to: getAllValidUsers[index],
                link_url: link,
                content: `<span>Sprint <NavLink className="edit-navlink-notification ml-1 mr-1" to={${link}}>${sprintInfo?.sprint_name}</NavLink> is started</span>`,
                action_type: "issue-worklog:created"
            }))

            await delay(200)
        }
    }
    return null //don't create any notification and send to valid users
}

// check condition for sending notification to valid users => notification_id = 16
export const sendNotificationToValidUserWithSprintCreated = async (projectInfo, userInfo, dispatch, sprintInfo) => {
    const getIndex = projectInfo?.notification_config?.findIndex(notification => {
        return notification.notification_id === 16 && notification.is_activated
    })

    if (getIndex !== -1) {
        const types_user = projectInfo.notification_config[getIndex].user_types_is_received_notifications
        console.log("types_user ", types_user);
        
        const getAllValidUsers = renderValidUsers(types_user, null, userInfo, projectInfo)
        console.log("getAllValidUsers ", getAllValidUsers);
        

        for (let index = 0; index < getAllValidUsers.length; index++) {
            const link = `/projectDetail/${projectInfo?._id.toString()}/backlog`
            dispatch(createNotificationAction({
                project_id: projectInfo?._id.toString(),
                send_from: userInfo.id,
                send_to: getAllValidUsers[index],
                link_url: link,
                content: `<span>Sprint <NavLink className="edit-navlink-notification ml-1 mr-1" to={${link}}>${sprintInfo?.sprint_name}</NavLink> is created</span>`,
                action_type: "issue-worklog:created"
            }))

            await delay(200)
        }
    }
    return null //don't create any notification and send to valid users
}

