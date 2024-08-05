import Axios from "axios"
import { GET_USER_BY_KEYWORD_API, SHOW_MODAL_INPUT_TOKEN, USER_LOGGED_IN } from "../constants/constant"
import { ListProjectAction } from "./ListProjectAction"
import { showNotificationWithIcon } from "../../util/NotificationUtil"
import domainName from '../../util/Config'
export const getUserKeyword = (keyword) => {
    return async dispatch => {
        try {
            const res = await Axios.get(`${domainName}/api/projectmanagement/listuser?keyword=${keyword}`)
            dispatch({
                type: GET_USER_BY_KEYWORD_API,
                list: res.data.data
            })
        } catch (error) {

        }
    }
}

export const insertUserIntoProject = (props) => {
    return async dispatch => {
        try {
            const res = await Axios.post(`${domainName}/api/projectmanagement/insert`, { props })
            dispatch(ListProjectAction(res.data.data))
            showNotificationWithIcon('success', 'Insert user', 'Successfully inserted in this project')
        } catch (error) {
            showNotificationWithIcon('error', 'Insert user', 'User already in this project')
        }
    }
}

export const signUpUserAction = (props) => {
    return async dispatch => {
        try {
            const newUser = {
                username: props.username,
                email: props.email,
                password: props.password
            }
            const res = await Axios.post(`${domainName}/api/users/signup`, newUser)
            console.log("ket qua lay ra tu login ", res);
            if (res.status === 200) {
                showNotificationWithIcon("success", "", res.data.messgage)
                await dispatch({
                    type: SHOW_MODAL_INPUT_TOKEN,
                    status: true,
                    temporaryUserRegistrationId: res.data.data
                })
            }
        } catch (errors) {
            if (errors?.response.status === 400) {
                showNotificationWithIcon("error", "", errors?.response.data.message)
                await dispatch({
                    type: SHOW_MODAL_INPUT_TOKEN,
                    status: false,
                    temporaryUserRegistrationId: null
                })
            }
        }
    }
}

export const loginWithGoogleAction = (props) => {
    return async dispatch => {
        const newUser = {
            username: props.username,
            email: props.email,
            password: null
        }
        try {
            await Axios.post(`${domainName}/api/users/signup`, newUser)
        } catch (err) {
            if (err.response.status === 400) {
                let loggedIn = false
                await Axios.post(`${domainName}/api/users/login`, {
                    email: newUser.email,
                    password: null
                })
                    .then(res => {
                        showNotificationWithIcon("success", "Đăng nhập", "Đăng nhập thành công")
                        loggedIn = true
                    })
                    .catch(err => {
                        showNotificationWithIcon("error", "Đăng nhập", "Đăng nhập thất bại")
                    })
                if (loggedIn) {
                    const res = await Axios.get(`${domainName}/api/users/currentuser`)

                    if (res.data.currentUser) {
                        dispatch({
                            type: USER_LOGGED_IN,
                            userInfo: res.data.currentUser
                        })
                    }
                }
            }
        }
    }
}

export const userLoginAction = (email, password) => {

    return async (dispatch) => {
        try {
            let loggedIn = false
            await Axios.post(`${domainName}/api/users/login`, {
                email,
                password
            })
                .then(res => {
                    showNotificationWithIcon("success", "Đăng nhập", "Đăng nhập thành công")
                    loggedIn = true
                })
                .catch(err => {
                    showNotificationWithIcon("error", "Đăng nhập", "Đăng nhập thất bại")
                })

            if (loggedIn) {
                const res = await Axios.get(`${domainName}/api/users/currentuser`)

                if (res.data.currentUser) {
                    dispatch({
                        type: USER_LOGGED_IN,
                        userInfo: res.data.currentUser
                    })
                }
            }
        } catch (errors) {

        }
    }
}
export const userLoggedInAction = () => {
    return async dispatch => {
        try {
            const res = await Axios.get(`${domainName}/api/users/currentuser`)
            if (!res.data.currentUser) {
                dispatch({
                    type: USER_LOGGED_IN,
                    userInfo: null
                })
            } else {
                dispatch({
                    type: USER_LOGGED_IN,
                    userInfo: res.data.currentUser
                })
            }
        } catch (error) {
            console.log(error);
        }
    }
}

export const userLoggedoutAction = () => {
    return async dispatch => {
        await Axios.post(`${domainName}/api/users/logout`)
            .then(res => {
                showNotificationWithIcon('success', 'Logout', 'You are logged out')
                dispatch({
                    type: USER_LOGGED_IN,
                    status: false
                })
            })
            .catch(err => {
                console.log("Something went wrong");
            })
    }
}

export const verifyTokenAction = (params) => {
    return async dispatch => {
        try {
            const res = await Axios.post(`${domainName}/api/users/token/${params.token}`, {id: params.userId})
            if(res.status === 201) {
                showNotificationWithIcon('success', 'Register', res.data.message)

                dispatch({
                    type: SHOW_MODAL_INPUT_TOKEN,
                    status: false
                })
            }
        } catch (error) {
            if(error?.response?.status === 400) {
                showNotificationWithIcon('error', 'Register', error?.response?.data.message)
            }
        }
    }
}