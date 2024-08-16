import { GET_CATEGORY_API, GET_EPICS } from "../constants/constant"

const initialState = {
    categoryList: [],
    epicList: []
}
/* eslint-disable import/no-anonymous-default-export */
export default (state = initialState, action) => {
    if (action.type === GET_CATEGORY_API) {
        state.categoryList = action.data
    }else if(action.type === GET_EPICS) {
        state.epicList = action.epicList
    }
    return { ...state }

}
