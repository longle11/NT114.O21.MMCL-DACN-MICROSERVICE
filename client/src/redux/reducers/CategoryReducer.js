import { GET_CATEGORY_API } from "../constants/constant"

const initialState = {
    categoryList: []
}
/* eslint-disable import/no-anonymous-default-export */
export default (state = initialState, action) => {
    switch (action.type) {

        case GET_CATEGORY_API:
            state.categoryList = action.data
            return { ...state }

        default:
            return state
    }
}
