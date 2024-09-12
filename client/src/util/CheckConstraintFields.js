export const checkConstraintPermissions = (projectInfo, issueInfo, userInfo, number) => {
    console.log("issueInfo.is_permissions ", issueInfo);
    
    if(!issueInfo.is_permissions) return true   //means we not turn on permissions so all user can edit it

    const getRoleUserIndexInProject = projectInfo?.members?.findIndex(user => user.user_info._id === userInfo?.id)

    //check whether this user is belonging to this issue
    if(userInfo.id === issueInfo?.creator?._id) return true

    if(issueInfo?.assignees?.map(user => user._id).includes(userInfo.id)) {
        return issueInfo?.permissions?.users_belongto_issue?.assignees?.includes(number)
    }

    //check whether user participated in project or not => if not, check role
    if (getRoleUserIndexInProject !== -1) {  //user has admin role which can edit in this issue
        const userRole = projectInfo?.members[getRoleUserIndexInProject]?.user_role
        if (userRole === 0) {
            return true
        } else if(userRole === 1) {
            return issueInfo?.permissions?.users_not_belongto_issue?.members?.actions?.includes(number)
        }else if(userRole === 2) {
            return issueInfo?.permissions?.users_not_belongto_issue?.viewers?.actions?.includes(number)
        }
    }

    return false
}