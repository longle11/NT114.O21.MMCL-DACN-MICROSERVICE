import { CLOSE_CHILD_MODAL, CLOSE_MODAL, CLOSE_MODAL_INFO, DISPLAY_CHILD_MODAL_WITH_COMPONENT, DISPLAY_MODAL_INFO_WITH_COMPONENT, DISPLAY_MODAL_WITH_COMPONENT, HANDLE_CHILD_CLICK_OK_MODAL, HANDLE_CLICK_OK_MODAL, OPEN_CHILD_MODAL, OPEN_MODAL, OPEN_MODAL_INFO } from "../constants/constant"
/* eslint-disable import/no-anonymous-default-export */
import React from 'react';
const initialState = {
    visible: false,
    childVisible: false,
    visibleModalInfo: false,
    component: <p>hello world</p>,
    childComponent: <p>hello world</p>,
    componentModalInfo: <p>hello world</p>,
    setWidth: 1024,
    childSetWidth: 1024,
    setWidthInfo: 1024,
    setTitle: null,
    childSetTitle: null,
    handleOk: (props) => {
        alert("display successfully")
    },
    childHandleOk: (props) => {
        alert("display successfully")
    }
}

export default (state = initialState, action) => {
    switch (action.type) {
        case OPEN_MODAL:
            return { ...state, visible: true }
        case OPEN_CHILD_MODAL:
            return { ...state, childVisible: true }
        case OPEN_MODAL_INFO:
            return { ...state, visibleModalInfo: true }
        case CLOSE_MODAL:
            return { ...state, visible: false }
        case CLOSE_CHILD_MODAL:
            return { ...state, childVisible: false }
        case CLOSE_MODAL_INFO:
            return { ...state, visibleModalInfo: false }
        case DISPLAY_MODAL_WITH_COMPONENT:
            return { ...state, visible: true, component: action.component, setWidth: action.setWidth, setTitle: action.setTitle }
        case DISPLAY_CHILD_MODAL_WITH_COMPONENT:
            return { ...state, childVisible: true, childComponent: action.component, childSetWidth: action.setWidth, childSetTitle: action.setTitle }
        case DISPLAY_MODAL_INFO_WITH_COMPONENT:
            return { ...state, visibleModalInfo: true, componentModalInfo: action.componentModalInfo, setWidthInfo: action.setWidthInfo }
        case HANDLE_CLICK_OK_MODAL:
            return { ...state, handleOk: action.handleOk }
        case HANDLE_CHILD_CLICK_OK_MODAL:
            return { ...state, childHandleOk: action.childHandleOk }
        default:
            return { ...state }
    }
}
