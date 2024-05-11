import { GET_CATEGORY_API } from "../constants/constant"

const initialState = {
    categoryList: []
}
/* eslint-disable import/no-anonymous-default-export */
export default (state = initialState, action) => {
    if (action.type === GET_CATEGORY_API) {
        state.categoryList = action.data
        return { ...state }
    }
    return state
}
