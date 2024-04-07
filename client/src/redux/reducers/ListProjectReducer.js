/* eslint-disable import/no-anonymous-default-export */
import { GET_LIST_PROJECT_API, GET_PROJECT_API } from "../constants/constant"
const initialState = {
    listProject: [],
    projectInfo: {}
}

export default (state = initialState, action) => {
    switch (action.type) {

        case GET_LIST_PROJECT_API:
            state.listProject = action.data
            return { ...state }
        case GET_PROJECT_API:
            state.projectInfo = action.data
            return { ...state }
        default:
            return state
    }
}
