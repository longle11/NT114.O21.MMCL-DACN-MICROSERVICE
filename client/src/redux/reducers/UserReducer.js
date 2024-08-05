
import { GET_USER_BY_KEYWORD_API, SHOW_MODAL_INPUT_TOKEN, USER_LOGGED_IN } from "../constants/constant"
/* eslint-disable import/no-anonymous-default-export */

const initialState = {
    list: [],
    userInfo: null,
    showModalInputToken: false,
    temporaryUserRegistrationId: null
}

export default (state = initialState, action) => {
    switch (action.type) {
        case GET_USER_BY_KEYWORD_API:
            state.list = action.list
            return { ...state }
        case USER_LOGGED_IN:
            state.userInfo = action.userInfo
            return { ...state }
        case SHOW_MODAL_INPUT_TOKEN:
            state.showModalInputToken = action.status
            state.temporaryUserRegistrationId = action.temporaryUserRegistrationId
            return { ...state }
        default:
            return state
    }
}
