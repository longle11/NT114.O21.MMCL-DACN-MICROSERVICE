import { GET_INFO_ISSUE } from "../constants/constant"

/* eslint-disable import/no-anonymous-default-export */
const initialState = {
    //duoc su dung de hien thi modal cua issue
    issueInfo: null
}

export default (state = initialState, action) => {
    switch (action.type) {
        case GET_INFO_ISSUE:
            state.issueInfo = action.issueInfo
            return { ...state }
        default:
            return state
    }
}
