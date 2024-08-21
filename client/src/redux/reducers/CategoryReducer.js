import { GET_VERSION, GET_CATEGORY_API, GET_EPICS, GET_EPICS_BY_ID, GET_VERSION_BY_ID } from "../constants/constant"

const initialState = {
    categoryList: [],
    epicList: [],
    epicInfo: {},
    versionList: [],
    versionInfo: {}
}
/* eslint-disable import/no-anonymous-default-export */
export default (state = initialState, action) => {
    if (action.type === GET_CATEGORY_API) {
        state.categoryList = action.data
    }
    else if(action.type === GET_EPICS) {
        state.epicList = action.epicList
    }
    else if(action.type === GET_EPICS_BY_ID) {
        state.epicInfo = action.epicInfo
    }
    else if(action.type === GET_VERSION) {
        state.versionList = action.versionList
    }
    else if(action.type === GET_VERSION_BY_ID) {
        state.versionInfo = action.versionInfo
    }
    return { ...state }

}
