import { CLOSE_CHILD_MODAL, CLOSE_MODAL, CLOSE_MODAL_INFO, DISPLAY_CHILD_MODAL_WITH_COMPONENT, DISPLAY_MODAL_INFO_WITH_COMPONENT, DISPLAY_MODAL_WITH_COMPONENT, HANDLE_CHILD_CLICK_OK_MODAL, HANDLE_CLICK_OK_MODAL, OPEN_CHILD_MODAL, OPEN_MODAL, OPEN_MODAL_INFO } from "../constants/constant"

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


export const openChildModal = (status) => {
    return dispatch => {
        if (status) {
            dispatch({
                type: OPEN_CHILD_MODAL
            })
        } else {
            dispatch({
                type: CLOSE_CHILD_MODAL
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
export const displayChildComponentInModal = (component, setWidth, setTitle) => {
    return dispatch => {
        dispatch({
            type: DISPLAY_CHILD_MODAL_WITH_COMPONENT,
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


export const handleChildClickOk = (callbackOk) => {
    return dispatch => {
        dispatch({
            type: HANDLE_CHILD_CLICK_OK_MODAL,
            childHandleOk: callbackOk
        })
    }
}