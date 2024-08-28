import Axios from "axios"
import { DISPLAY_LOADING, GET_USER_BY_KEYWORD_API, HIDE_LOADING, SHOW_MODAL_INPUT_TOKEN, USER_LOGGED_IN } from "../constants/constant"
import { ListProjectAction } from "./ListProjectAction"
import { showNotificationWithIcon } from "../../util/NotificationUtil"
import domainName from '../../util/Config'
import { renderIssueInfoMenuDashboard } from "../../util/SubFunctionsInRedux"
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

export const updateUserInfo = (user_id, props) => {
    return async dispatch => {
        try {
            //tien hanh cap nhat thong tin cho user
            const getUserUpdated = await Axios.post(`${domainName}/api/users/update/${user_id}`, props)

            dispatch({
                type: USER_LOGGED_IN,
                userInfo: getUserUpdated.data.data
            })
        } catch (error) {

        }
    }
}

export const signUpUserAction = (props) => {
    return async dispatch => {
        try {
            dispatch({
                type: DISPLAY_LOADING
            })
            const newUser = {
                username: props.username,
                email: props.email,
                password: props.password
            }
            const res = await Axios.post(`${domainName}/api/users/signup`, newUser)
            if (res.status === 200) {
                showNotificationWithIcon("success", "Notification", res.data.message)
                await dispatch({
                    type: SHOW_MODAL_INPUT_TOKEN,
                    status: true,
                    temporaryUserRegistrationId: res.data.data
                })
                dispatch({
                    type: HIDE_LOADING
                })
            }
        } catch (errors) {
            if (errors?.response.status === 400) {
                showNotificationWithIcon("error", "Notification", errors?.response.data.message)
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
        dispatch({
            type: DISPLAY_LOADING
        })
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
        dispatch({
            type: HIDE_LOADING
        })
    }
}

export const userLoginAction = (email, password) => {
    return async (dispatch) => {
        try {
            let loggedIn = false
            const res = await Axios.post(`${domainName}/api/users/login`, {
                email,
                password
            })
            if (res.status === 200) {
                showNotificationWithIcon("success", "Loggin", res.data.message)
                loggedIn = true
            }

            if (loggedIn) {
                const res = await Axios.get(`${domainName}/api/users/currentuser`)

                if (res.data.currentUser) {
                    const getAllIssues = await Axios.get(`${domainName}/api/issue/issues/all`)
                    if (getAllIssues.status === 200) {
                        res.data.currentUser.working_issues = renderIssueInfoMenuDashboard(getAllIssues, res.data.currentUser.working_issues)
                        res.data.currentUser.viewed_issues = renderIssueInfoMenuDashboard(getAllIssues, res.data.currentUser.viewed_issues)

                        dispatch({
                            type: USER_LOGGED_IN,
                            userInfo: res.data.currentUser
                        })
                    }
                }
            }
        } catch (error) {
            if (error.response.status === 401) {
                showNotificationWithIcon("error", "Loggin", error.response.data.message)
            } else if (error.response.status === 400) {
                showNotificationWithIcon("error", "Loggin", error.response.data.message)
                dispatch({
                    type: SHOW_MODAL_INPUT_TOKEN,
                    status: true,
                    temporaryUserRegistrationId: error.response.data.userId
                })
            }
        }
    }
}
export const userLoggedInAction = () => {
    return async dispatch => {
        try {
            dispatch({
                type: DISPLAY_LOADING
            })
            const res = await Axios.get(`${domainName}/api/users/currentuser`)
            if (!res.data.currentUser) {
                dispatch({
                    type: USER_LOGGED_IN,
                    userInfo: null
                })
            } else {
                const getAllIssues = await Axios.get(`${domainName}/api/issue/issues/all`)
                if (getAllIssues.status === 200) {
                    res.data.currentUser.working_issues = renderIssueInfoMenuDashboard(getAllIssues, res.data.currentUser.working_issues)
                    res.data.currentUser.viewed_issues = renderIssueInfoMenuDashboard(getAllIssues, res.data.currentUser.viewed_issues)

                    dispatch({
                        type: USER_LOGGED_IN,
                        userInfo: res.data.currentUser
                    })
                }
            }

            dispatch({
                type: HIDE_LOADING
            })
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
            const res = await Axios.post(`${domainName}/api/users/token/${params.userId}`, { id: params.token })
            if (res.status === 201) {
                showNotificationWithIcon('success', 'Register', res.data.message)

                dispatch({
                    type: SHOW_MODAL_INPUT_TOKEN,
                    status: false,
                    temporaryUserRegistrationId: null
                })
            }
        } catch (error) {
            if (error?.response?.status === 400) {
                showNotificationWithIcon('error', 'Register', error?.response?.data.message)
                dispatch({
                    type: SHOW_MODAL_INPUT_TOKEN,
                    status: true
                })
            }
        }
    }
}

export const getTokenAction = (userId) => {
    return async dispatch => {
        try {
            const res = await Axios.get(`${domainName}/api/users/token/${userId}`)
            if (res.status === 200) {
                showNotificationWithIcon('success', 'Notification', res.data.message)
            }
        } catch (error) {
            if (error?.response.status === 400) {
                showNotificationWithIcon('error', 'Notification', error.response.data.message)
            }
        }
    }
}