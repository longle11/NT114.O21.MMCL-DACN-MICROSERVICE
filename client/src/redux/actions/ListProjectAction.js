import Axios from "axios"
import { GET_LIST_PROJECT_API, GET_PROCESSES_PROJECT, GET_PROJECT_API, GET_SPRINT_PROJECT } from "../constants/constant"
import domainName from '../../util/Config'
export const ListProjectAction = () => {
    return async dispatch => {
        try {
            const res = await Axios.get(`${domainName}/api/projectmanagement/list`)
            dispatch({
                type: GET_LIST_PROJECT_API,
                data: res.data.data
            })
        } catch (errors) {
            console.log("something went wrong", errors);
        }
    }
}

export const GetProjectAction = (id, keyword) => {
    return async dispatch => {
        try {
            const res = await Axios.get(`${domainName}/api/projectmanagement/${id.toString()}?keyword=${keyword}`)
            dispatch({
                type: GET_PROJECT_API,
                data: res.data.data
            })
        } catch (errors) {

        }
    }
}

export const GetProcessListAction = (project_id) => {
    return async dispatch => {
        try {
            const res = await Axios.get(`${domainName}/api/issueprocess/${project_id}`)
            
            dispatch({
                type: GET_PROCESSES_PROJECT,
                processList: res.data.data
            })
        } catch (errors) {

        }
    }
}
export const GetSprintListAction = (project_id) => {
    return async dispatch => {
        try {
            const res = await Axios.get(`${domainName}/api/sprint/${project_id}`)
            
            dispatch({
                type: GET_SPRINT_PROJECT,
                sprintList: res.data.data
            })
        } catch (errors) {

        }
    }
}