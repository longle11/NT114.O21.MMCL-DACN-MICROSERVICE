import Axios from "axios"
import { GET_LIST_PROJECT_API, GET_PROJECT_API } from "../constants/constant"
import { delay } from "../../util/Delay"

export const ListProjectAction = () => {
    return async dispatch => {
        try {
            const res = await Axios.get("https://jira.dev/api/projectmanagement/list")
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
            console.log("đã vào trong nay, ", `https://jira.dev/api/projectmanagement/${id.toString()}?keyword=${keyword}`);
            const res = await Axios.get(`https://jira.dev/api/projectmanagement/${id.toString()}?keyword=${keyword}`)
            console.log(res);
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