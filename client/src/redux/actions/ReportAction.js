import { GET_BURNDOWNCHART_INFO } from "../constants/constant"
import Axios from "axios"
import domainName from "../../util/Config"
export const getBurndownChartInfo = (project_id, sprint_id) => {
    return async dispatch => {
        try {
            const res = await Axios.get(`${domainName}/api/report/getburndown/${project_id}/${sprint_id}`)
            if (res.status) {
                dispatch({
                    type: GET_BURNDOWNCHART_INFO,
                    info: res.data.data
                })
            }
        } catch (error) {

        }
    }
}