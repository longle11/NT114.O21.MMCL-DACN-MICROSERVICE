import Axios from "axios";
import { GET_CATEGORY_API } from "../constants/constant";
import domainName from '../../util/Config'
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
        }catch(errors) {
            
        }
    }
}


