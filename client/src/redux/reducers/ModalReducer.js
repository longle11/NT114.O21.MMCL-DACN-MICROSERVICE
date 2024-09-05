import { CLOSE_MODAL, CLOSE_MODAL_INFO, DISPLAY_MODAL_INFO_WITH_COMPONENT, DISPLAY_MODAL_WITH_COMPONENT, HANDLE_CLICK_OK_MODAL, OPEN_MODAL, OPEN_MODAL_INFO } from "../constants/constant"
/* eslint-disable import/no-anonymous-default-export */

const initialState = {
    visible: false,
    visibleModalInfo: false,
    component: <p>hello world</p>,
    componentModalInfo: <p>hello world</p>,
    handleOk: (props) => {
        alert("display successfully")
    }
}

export default (state = initialState, action) => {
    switch (action.type) {
        case OPEN_MODAL:
            return { ...state, visible: true }
        case OPEN_MODAL_INFO:
            return { ...state, visibleModalInfo: true }
        case CLOSE_MODAL:
            return { ...state, visible: false }
        case CLOSE_MODAL_INFO:
            return { ...state, visibleModalInfo: false }
        case DISPLAY_MODAL_WITH_COMPONENT:
            return { ...state, visible: true, component: action.component }
        case DISPLAY_MODAL_INFO_WITH_COMPONENT:
            return { ...state, visibleModalInfo: true, componentModalInfo: action.componentModalInfo }
        case HANDLE_CLICK_OK_MODAL:
            return { ...state, handleOk: action.handleOk }
        default:
            return { ...state }
    }
}
