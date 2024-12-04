import { GET_NOTIFICATION_LIST } from "../constants/constant"

const initialState = {
    notificationList: []
}
/* eslint-disable import/no-anonymous-default-export */
export default (state = initialState, action) => {
    if (action.type === GET_NOTIFICATION_LIST) {
        state.notificationList = action.notificationList
    }
    return { ...state }

}
