import { GET_INFO_ISSUE, GET_ISSUE_HISTORIES_LIST, GET_ISSUE_LIST, GET_ISSUES_BACKLOG, GET_WORKLOG_HISTORIES_LIST } from "../constants/constant"

/* eslint-disable import/no-anonymous-default-export */
const initialState = {
    //duoc su dung de hien thi modal cua issue
    issueInfo: null,
    issuesBacklog: [],
    historyList: [],
    worklogList: [],
    issueList: []
}

export default (state = initialState, action) => {
    if (action.type === GET_INFO_ISSUE) {
        state.issueInfo = action.issueInfo
    } else if (action.type === GET_ISSUES_BACKLOG) {
        state.issuesBacklog = action.issuesBacklog
    }
    else if (action.type === GET_ISSUE_HISTORIES_LIST) {
        state.historyList = action.historyList
    }
    else if (action.type === GET_ISSUE_LIST) {
        state.issueList = action.issueList
    }
    else if (action.type === GET_WORKLOG_HISTORIES_LIST) {
        state.worklogList = action.worklogList
    }
    return { ...state }
}
