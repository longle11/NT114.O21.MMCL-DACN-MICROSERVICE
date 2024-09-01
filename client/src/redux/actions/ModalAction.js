import { CLOSE_MODAL, DISPLAY_MODAL_WITH_COMPONENT, HANDLE_CLICK_OK_MODAL, OPEN_MODAL } from "../constants/constant"

export const openModal = (status) => {
    return dispatch => {
        if (status) {
            dispatch({
                type: OPEN_MODAL
            })
        } else {
            dispatch({
                type: CLOSE_MODAL
            })
        }
    }
}
export const displayComponentInModal = (component) => {
    return dispatch => {
        dispatch({
            type: DISPLAY_MODAL_WITH_COMPONENT,
            component: component
        })
    }
}

export const handleClickOk = (callbackOk) => {
    return dispatch => {
        dispatch({
            type: HANDLE_CLICK_OK_MODAL,
            handleOk: callbackOk
        })
    }
}