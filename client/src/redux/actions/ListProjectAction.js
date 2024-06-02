import Axios from "axios"
import { GET_LIST_PROJECT_API, GET_PROJECT_API } from "../constants/constant"
import { delay } from "../../util/Delay"
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
            await delay(1000)
            localStorage.setItem('projectid', id)
        } catch (errors) {
            localStorage.setItem('projectid', 1)
        }
    }
}