import { CLOSE_DRAWER, OPEN_DRAWER, OPEN_FORM_EDIT_DRAWER, SUBMIT_FORM_EDIT_DRAWER } from "../constants/constant"
/* eslint-disable import/no-anonymous-default-export */

const initialState = {
    visible: false,
    component: <p>hello world</p>,
    textButton: "Submit",
    width: 720,
    padding: '0',
    submit: (props) => {
        alert("hello world")
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
        default:
            return state
    }
}
