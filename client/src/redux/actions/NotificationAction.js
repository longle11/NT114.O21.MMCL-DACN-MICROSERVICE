import Axios from "axios"
import domainName from "../../util/Config"
import { GET_NOTIFICATION_LIST } from "../constants/constant"

export const createNotificationAction = (props) => {
    return async dispatch => {
        try {
            const res = await Axios.post(`${domainName}/api/notification/create`, props)
            if (res.status === 201) {
                
            }
        }catch(error) {
            console.log("error createNotificationAction", error);
        }
    }
}

export const getNotificationByUserIdAction = (userId) => {
    return async dispatch => {
        try {
            const res = await Axios.get(`${domainName}/api/notification/notification-list/${userId}`)
            if (res.status === 200) {
                
                dispatch({
                    type: GET_NOTIFICATION_LIST,
                    notificationList: res.data.data
                })
            }
        }catch(error) {
            console.log("error getNotificationByUserIdAction", error);
        }
    }
}

export const updateNotificationByUserIdAction = (notification_id, props, navigate, url_link) => {
    return async dispatch => {
        try {
            const res = await Axios.put(`${domainName}/api/notification/update/${notification_id}`, props)
            if (res.status === 200) {
                if(navigate !== null) {
                    navigate(url_link)
                    window.location.reload()
                }
            }
        }catch(error) {
            console.log("error updateNotificationByUserIdAction", error);
        }
    }
}