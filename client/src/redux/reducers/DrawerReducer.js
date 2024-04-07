import { CLOSE_DRAWER, OPEN_DRAWER, OPEN_FORM_EDIT_DRAWER, SUBMIT_FORM_EDIT_DRAWER } from "../constants/constant"
/* eslint-disable import/no-anonymous-default-export */

const initialState = {
    visible: false,
    component: <p>hello world</p>,
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
            return { ...state, visible: true, component: action.component }
        case SUBMIT_FORM_EDIT_DRAWER:
            return { ...state, submit: action.submit }
        default:
            return state
    }
}
