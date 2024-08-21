import Axios from "axios";
import { GET_VERSION, GET_CATEGORY_API, GET_EPICS, GET_EPICS_BY_ID, GET_VERSION_BY_ID } from "../constants/constant";
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
export const createVersion = (props) => {
    return async dispatch => {
        try {
            const res = await Axios.post(`${domainName}/api/category/version-create`, props)
            if (res.status === 201) {
                const res = await Axios.get(`${domainName}/api/category/version-list/${props.project_id}`)
                if (res.status === 200) {
                    dispatch({
                        type: GET_VERSION,
                        versionList: res.data.data
                    })
                }
                showNotificationWithIcon("success", "Notification", "Successfully created a new version")
            }
        } catch (error) {
            showNotificationWithIcon("error", "Notification", "Failed to create a new version")
        }
    }
}

export const getVersionList = (project_id) => {
    return async dispatch => {
        try {
            const res = await Axios.get(`${domainName}/api/category/version-list/${project_id}`)
            console.log('res versionlist ', res);
            
            if (res.status === 200) {
                dispatch({
                    type: GET_VERSION,
                    versionList: res.data.data
                })
                showNotificationWithIcon("success", "Notification", res.data.message)
            }
        } catch (error) {
            showNotificationWithIcon("error", "Notification", "Failed to get version")
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

export const getEpicById = (epic_id) => {
    return async dispatch => {
        try {
            const res = await Axios.get(`${domainName}/api/category/epic/${epic_id}`)

            if (res.status === 200) {
                dispatch({
                    type: GET_EPICS_BY_ID,
                    epicInfo: res.data.data
                })
            }
        } catch (error) {

        }
    }
}

export const getVersionById = (version_id) => {
    return async dispatch => {
        try {
            const res = await Axios.get(`${domainName}/api/category/version/${version_id}`)

            if (res.status === 200) {
                dispatch({
                    type: GET_VERSION_BY_ID,
                    versionInfo: res.data.data
                })
            }
        } catch (error) {

        }
    }
}

export const updateEpic = (epic_id, props, project_id) => {
    return async dispatch => {
        try {
            const res = await Axios.put(`${domainName}/api/category/update/${epic_id}`, props)
            console.log("update Epic ", res);

            if (res.status === 200) {
                const res = await Axios.get(`${domainName}/api/category/epic-list/${project_id}`)
                if (res.status === 200) {
                    dispatch({
                        type: GET_EPICS,
                        epicList: res.data.data
                    })
                    showNotificationWithIcon("success", "Notification", res.data.message)
                }
            }
        } catch (error) {
            console.log("updateEpic error", error);
        }
    }
}

export const updateVersion = (version_id, props, project_id) => {
    return async dispatch => {
        try {
            const res = await Axios.put(`${domainName}/api/category/version-update/${version_id}`, props)
            console.log("update version ", res);

            if (res.status === 200) {
                const res = await Axios.get(`${domainName}/api/category/version-list/${project_id}`)
                if (res.status === 200) {
                    dispatch({
                        type: GET_VERSION,
                        versionList: res.data.data
                    })
                    showNotificationWithIcon("success", res.data.message)
                }
            }
        } catch (error) {
            console.log("updateEpic error", error);
        }
    }
}