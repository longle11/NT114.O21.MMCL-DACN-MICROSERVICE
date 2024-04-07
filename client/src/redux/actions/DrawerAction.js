import { CLOSE_DRAWER, GET_CATEGORY_TO_EDIT_DRAWER, OPEN_DRAWER, OPEN_FORM_EDIT_DRAWER, SUBMIT_FORM_EDIT_DRAWER } from "../constants/constant"

export const drawerAction = (status) => {
    return dispatch => {
        if(status) {
            dispatch({
                type: CLOSE_DRAWER
            })
        }else {
            dispatch({
                type: OPEN_DRAWER
            })
        }
    }
}
export const drawer_edit_form_action = (component) => {
    return dispatch => {
        dispatch({
            type: OPEN_FORM_EDIT_DRAWER,
            component: component
        })
    }
}

export const submit_edit_form_action = (callbackSubmit) => {
    return dispatch => {
        dispatch({
            type: SUBMIT_FORM_EDIT_DRAWER,
            submit: callbackSubmit
        })
    }
}

export const get_category_action = (props) => {
    return dispatch => {
        dispatch({
            type: GET_CATEGORY_TO_EDIT_DRAWER,
            props: props
        })
    }
}