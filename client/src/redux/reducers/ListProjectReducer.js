/* eslint-disable import/no-anonymous-default-export */
import { GET_A_SPRINT, GET_LIST_PROJECT_API, GET_PROCESSES_PROJECT, GET_PROJECT_API, GET_SPRINT_PROJECT, GET_WORKFLOW_LIST } from "../constants/constant"
const initialState = {
    listProject: [],
    projectInfo: {},
    processList: [],
    sprintList: [],
    sprintInfo: {},
    workflowList: []
}

export default (state = initialState, action) => {
    switch (action.type) {
        case GET_LIST_PROJECT_API:
            state.listProject = action.data
            return { ...state }
        case GET_PROJECT_API:
            state.projectInfo = action.data
            return { ...state }
        case GET_PROCESSES_PROJECT:
            state.processList = action.processList
            return { ...state }
        case GET_SPRINT_PROJECT:
            state.sprintList = action.sprintList
            return { ...state }
        case GET_A_SPRINT:
            state.sprintInfo = action.sprintInfo
            return { ...state }
        case GET_WORKFLOW_LIST:
            state.workflowList = action.workflowList
            return { ...state }
        default:
            return state
    }
}
