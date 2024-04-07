import Axios from "axios";
import { GET_CATEGORY_API } from "../constants/constant";

export const getListCategories = () => {
    return async dispatch => {
        try {
            const res = await Axios.get("https://jira.dev/api/category/list")
            if(res.status) {
                dispatch({
                    type: GET_CATEGORY_API,
                    data: res.data.data
                })
            } 
        }catch(errors) {
            console.log(`loi o ${GET_CATEGORY_API} `);
        }
    }
}


