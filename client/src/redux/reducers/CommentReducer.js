import { GET_COMMENT_LIST } from "../constants/constant"

const initialState = {
    commentList: []
}
/* eslint-disable import/no-anonymous-default-export */
export default (state = initialState, action) => {
    if (action.type === GET_COMMENT_LIST) {
        state.commentList = action.commentList
    }
    return { ...state }

}
