import { CLOSE_MODAL, CLOSE_MODAL_INFO, DISPLAY_MODAL_INFO_WITH_COMPONENT, DISPLAY_MODAL_WITH_COMPONENT, HANDLE_CLICK_OK_MODAL, OPEN_MODAL, OPEN_MODAL_INFO } from "../constants/constant"

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
export const openModalInfo = (status) => {
    return dispatch => {
        if (status) {
            dispatch({
                type: OPEN_MODAL_INFO
            })
        } else {
            dispatch({
                type: CLOSE_MODAL_INFO
            })
        }
    }
}

export const displayComponentInModal = (component, setWidth, setTitle) => {
    return dispatch => {
        dispatch({
            type: DISPLAY_MODAL_WITH_COMPONENT,
            component: component,
            setWidth: setWidth,
            setTitle: setTitle
        })
    }
}

export const displayComponentInModalInfo = (component, setWidthInfo) => {
    return dispatch => {
        dispatch({
            type: DISPLAY_MODAL_INFO_WITH_COMPONENT,
            componentModalInfo: component,
            setWidthInfo: setWidthInfo
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