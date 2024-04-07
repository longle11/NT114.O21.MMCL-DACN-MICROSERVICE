
import { GET_USER_BY_KEYWORD_API, USER_LOGGED_IN } from "../constants/constant"
/* eslint-disable import/no-anonymous-default-export */

const initialState = {
    list: [],
    status: false,
    userInfo: null
}

export default (state = initialState, action) => {
    switch (action.type) {

        case GET_USER_BY_KEYWORD_API:
            state.list = action.list
            return { ...state }
        case USER_LOGGED_IN:
            state.status = action.status
            state.userInfo = action.userInfo
            return { ...state }

        default:
            return state
    }
}
