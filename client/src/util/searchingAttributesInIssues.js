import { getValueOfNumberFieldInIssue, getValueOfObjectFieldInIssue } from "./IssueFilter"

export const searchingIssuesValidConditions = (searchIssue, allIssues) => {
    var issuesInProjectAfterSearching = []
    if (searchIssue.epics?.length > 0) {
        issuesInProjectAfterSearching = [...allIssues?.filter(issue => searchIssue.epics.includes(getValueOfObjectFieldInIssue(issue, "epic_link") ? getValueOfObjectFieldInIssue(issue, "epic_link")?._id?.toString() : null))]
    } else {
        issuesInProjectAfterSearching = [...allIssues]
    }

    if (searchIssue.statuses?.length > 0) {
        issuesInProjectAfterSearching = [...allIssues?.filter(issue => searchIssue.statuses.includes(getValueOfNumberFieldInIssue(issue, "issue_status")))]
    }

    if (searchIssue.versions?.length > 0) {
        issuesInProjectAfterSearching = [...allIssues?.filter(issue => searchIssue.versions.includes(getValueOfObjectFieldInIssue(issue, "fix_version") ? getValueOfObjectFieldInIssue(issue, "fix_version")?._id?.toString() : null))]
    }

    if (searchIssue.types?.length > 0) {
        issuesInProjectAfterSearching = [...allIssues?.filter(issue => searchIssue.types.includes(getValueOfObjectFieldInIssue(issue, "issue_type") ? getValueOfObjectFieldInIssue(issue, "issue_type")?._id : null))]
    }
    
    return issuesInProjectAfterSearching
}