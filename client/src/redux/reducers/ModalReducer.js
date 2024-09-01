import { CLOSE_MODAL, DISPLAY_MODAL_WITH_COMPONENT, HANDLE_CLICK_OK_MODAL, OPEN_MODAL } from "../constants/constant"
/* eslint-disable import/no-anonymous-default-export */

const initialState = {
    visible: false,
    component: <p>hello world</p>,
    handleOk: (props) => {
        alert("display successfully")
    }
}

export default (state = initialState, action) => {
    switch (action.type) {

        case OPEN_MODAL:
            return { ...state, visible: true }
        case CLOSE_MODAL:
            return { ...state, visible: false }
        case DISPLAY_MODAL_WITH_COMPONENT:
            return { ...state, visible: true, component: action.component }
        case HANDLE_CLICK_OK_MODAL:
            return { ...state, handleOk: action.handleOk }
        default:
            return { ...state }
    }
}
