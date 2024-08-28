export const renderIssueInfoMenuDashboard = (getAllIssues, type_issues) => {
    const issues_data = getAllIssues.data.data.filter(issue => {
        const findIndex = type_issues.findIndex(currentIssue => currentIssue.issue_id.toString() === issue._id.toString())
        if (findIndex !== -1) return true
        return false
    })

    return type_issues.map(issue => {
        const index = issues_data.findIndex(id => id._id.toString() === issue.issue_id.toString())
        if (index !== -1) {
            return {
                project_id: issues_data[index].project_id?._id,
                issue_id: issues_data[index]?._id,
                name_project: issues_data[index].project_id?.name_project,
                ordinal_number: issues_data[index].ordinal_number.toString(),
                summary: issues_data[index].summary,
                issue_status: issues_data[index].issue_status,
                time: issue.createAt
            }
        }
    })
}