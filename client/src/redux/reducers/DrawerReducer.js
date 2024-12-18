import { CLOSE_DRAWER, OPEN_DRAWER, OPEN_FORM_EDIT_DRAWER, SUBMIT_FORM_EDIT_DRAWER, UPDATE_TEMP_FILE_DATA } from "../constants/constant"
/* eslint-disable import/no-anonymous-default-export */
import React from 'react';
const initialState = {
    visible: false,
    component: <p>Drawer test something</p>,
    textButton: "Submit",
    tempFileData: [],
    width: 720,
    padding: '0',
    submit: (props) => {
        alert("test")
    }
}

export default (state = initialState, action) => {
    switch (action.type) {
        case OPEN_DRAWER:
            return { ...state, visible: true }
        case CLOSE_DRAWER:
            return { ...state, visible: false }
        case OPEN_FORM_EDIT_DRAWER:
            return { ...state, visible: true, component: action.component, textButton: action.textButton, width: action.width, padding: action.padding }
        case SUBMIT_FORM_EDIT_DRAWER:
            return { ...state, submit: action.submit }
        case UPDATE_TEMP_FILE_DATA:
            return { ...state, tempFileData: action.tempFileData }
        default:
            return state
    }
}
