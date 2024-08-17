import Axios from "axios";
import { GET_CATEGORY_API, GET_EPICS } from "../constants/constant";
import domainName from '../../util/Config'
import { showNotificationWithIcon } from "../../util/NotificationUtil";
export const getListCategories = () => {
    return async dispatch => {
        try {
            const res = await Axios.get(`${domainName}/api/category/list`)
            if (res.status) {
                dispatch({
                    type: GET_CATEGORY_API,
                    data: res.data.data
                })
            }
        } catch (error) {

        }
    }
}

export const createEpic = (props) => {
    return async dispatch => {
        try {
            const res = await Axios.post(`${domainName}/api/category/epic-create`, props)
            if (res.status === 201) {
                const res = await Axios.get(`${domainName}/api/category/epic-list/${props.project_id}`)
                console.log("danh sach epic lay ra duoc la ", res);
                if (res.status === 200) {
                    dispatch({
                        type: GET_EPICS,
                        epicList: res.data.data
                    })
                }
                showNotificationWithIcon("success", "Notification", "Successfully created a new epic")
            }
        } catch (error) {
            showNotificationWithIcon("error", "Notification", "Failed to create a new epic")
        }
    }
}

export const getEpicList = (project_id) => {
    return async dispatch => {
        try {
            const res = await Axios.get(`${domainName}/api/category/epic-list/${project_id}`)

            if (res.status === 200) {
                dispatch({
                    type: GET_EPICS,
                    epicList: res.data.data
                })
            }
        } catch (error) {

        }
    }
}

export const updateEpic = (epic_id, props, project_id) => {
    return async dispatch => {
        try {
            const res = await Axios.put(`${domainName}/api/category/update/${epic_id}`, { props })
            if (res.status === 200) {
                const res = await Axios.get(`${domainName}/api/category/epic-list/${project_id}`)
                if (res.status === 200) {
                    dispatch({
                        type: GET_EPICS,
                        epicList: res.data.data
                    })
                    showNotificationWithIcon("success", "Notification", "Successfully updated a new epic")
                }
            }
        } catch (error) {

        }
    }
}