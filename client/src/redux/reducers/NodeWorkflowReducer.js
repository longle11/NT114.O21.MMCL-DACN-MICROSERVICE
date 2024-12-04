import { DELETE_NODE_IN_WORKFLOW } from "../constants/constant"

const initialState = {
    handleClickDeleteNode: () => { }
}
/* eslint-disable import/no-anonymous-default-export */
export default (state = initialState, action) => {
    if (action.type === DELETE_NODE_IN_WORKFLOW) {
        state.handleClickDeleteNode = action.handleClickDeleteNode
    }
    return { ...state }

}
