import { GET_CATEGORY_TO_EDIT_DRAWER, GET_ITEM_CATEGORY_DRAWER } from "../constants/constant"
/* eslint-disable import/no-anonymous-default-export */

const initialState = {
    list: {}
}

export default (state = initialState, action) => {
    switch (action.type) {

        case GET_CATEGORY_TO_EDIT_DRAWER:
            return { ...state }
        case GET_ITEM_CATEGORY_DRAWER:
            let newState = action.props
            state.list = {...newState}

            return {...state}

        default:
            return state
    }
}
