import Axios from "axios";
import { GET_CATEGORY_API, GET_EPICS } from "../constants/constant";
import domainName from '../../util/Config'
import { showNotificationWithIcon } from "../../util/NotificationUtil";
export const getListCategories = () => {
    return async dispatch => {
        try {
            const res = await Axios.get(`${domainName}/api/category/list`)
            if(res.status) {
                dispatch({
                    type: GET_CATEGORY_API,
                    data: res.data.data
                })
            } 
        }catch(error) {
            
        }
    }
}

export const createEpic = (props) => {
    return async dispatch => {
        try {
            const res = await Axios.post(`${domainName}/api/category/epic-create`, props)
            console.log("khoi tao epic thanh cong ", res);
            
            if(res.status === 201) {
                getEpicList(props.project_id)
                console.log("chay trong nay ne");
                showNotificationWithIcon("success", "", "Successfully create new epic")
            }
        }catch(error) {
            
        }
    }
}

export const getEpicList = (project_id) => {
    return async dispatch => {
        try {
            const res = await Axios.get(`${domainName}/api/category/epic-list/${project_id}`)
            if(res.status === 200) {
                console.log("lay du lieu thanh cong", res);
                dispatch({
                    type: GET_EPICS,
                    epicList: res.data.data
                })
            }
        }catch(error) {
            
        }
    }
}