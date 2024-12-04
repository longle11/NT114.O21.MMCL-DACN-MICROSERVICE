export const getValueOfNumberFieldInIssue = (arr_issues, field_name) => {
    const index = arr_issues?.issue_data_type_number?.findIndex(field => field.field_key_issue === field_name)
    if (typeof index === "number" && index !== -1 && arr_issues?.issue_data_type_number?.length > 0) {
        return arr_issues?.issue_data_type_number[index]?.value
    } else {
        return null
    }
}

export const getValueOfStringFieldInIssue = (arr_issues, field_name) => {
    const index = arr_issues?.issue_data_type_string?.findIndex(field => field.field_key_issue === field_name)
    if (typeof index === "number" && index !== -1 && arr_issues?.issue_data_type_string?.length > 0) {
        return arr_issues?.issue_data_type_string[index]?.value
    } else {
        return null
    }
}


export const getValueOfArrayFieldInIssue = (arr_issues, field_name) => {
    const index = arr_issues?.issue_data_type_array?.findIndex(field => field.field_key_issue === field_name)
    if (typeof index === "number" && index !== -1 && arr_issues?.issue_data_type_array?.length > 0) {
        return arr_issues?.issue_data_type_array[index]?.value
    } else {
        return null
    }
}


export const getValueOfObjectFieldInIssue = (arr_issues, field_name) => {
    const index = arr_issues?.issue_data_type_object?.findIndex(field => field.field_key_issue === field_name)
    if (typeof index === "number" && index !== -1 && arr_issues?.issue_data_type_object?.length > 0) {
        return arr_issues?.issue_data_type_object[index]?.value
    } else {
        return null
    }
}

export const getValueOfArrayObjectFieldInIssue = (arr_issues, field_name) => {
    const index = arr_issues?.issue_data_type_array_object?.findIndex(field => field.field_key_issue === field_name)
    if (typeof index === "number" && index !== -1 && arr_issues?.issue_data_type_array_object?.length > 0) {
        return arr_issues?.issue_data_type_array_object[index]?.value
    } else {
        return null
    }
}

export const renderIssuesWithMyIssues = (arrs, searchWithMyIssue) => {
    return arrs?.filter(issue => {
        if (!searchWithMyIssue) return true
        else {
            var getAssigneesList = getValueOfArrayObjectFieldInIssue(issue, 'assignees')
            if (!getAssigneesList) return false
            else {
                getAssigneesList = getAssigneesList.map(user => user?._id?.toString())

                if (getAssigneesList?.includes(searchWithMyIssue?.toString())) {
                    return true
                }
            }
        }
        return false
    })
}