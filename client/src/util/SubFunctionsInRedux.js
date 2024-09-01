const typeInfo = (issue, issueData) => {
    return {
        project_id: issueData.project_id?._id,
        issue_id: issueData?._id,
        name_project: issueData.project_id?.name_project,
        ordinal_number: issueData.ordinal_number.toString(),
        summary: issueData.summary,
        issue_status: issueData.issue_status,
        time: issue.createAt,
        action: issue.issue_action ? issue.issue_action : null,
        username: issueData.creator.username,
        avatar: issueData.creator.avatar,
        issue_type: issueData.issue_type
    }
}
export const renderIssueInfoMenuDashboard = (getAllIssues, type_issues) => {
    const issues_data = getAllIssues.data.data.filter(issue => {
        const findIndex = type_issues.findIndex(currentIssue => currentIssue.issue_id?.toString() === issue?._id?.toString())
        if (findIndex !== -1) return true
        return false
    })

    return type_issues.map(issue => {
        const index = issues_data.findIndex(id => id?._id?.toString() === issue.issue_id?.toString())
        if (index !== -1) {   
            return typeInfo(issue, issues_data[index])
        }
    })
}
