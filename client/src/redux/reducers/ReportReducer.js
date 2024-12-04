
import { GET_BURNDOWNCHART_INFO } from "../constants/constant"
/* eslint-disable import/no-anonymous-default-export */

const initialState = {
    info: {}
}

export default (state = initialState, action) => {
    switch (action.type) {
        case GET_BURNDOWNCHART_INFO:
            state.info = action.info
            return { ...state }
        default:
            return state
    }
}
