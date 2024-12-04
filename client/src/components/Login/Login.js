import React, { useEffect, useState } from 'react'
import { withFormik } from 'formik'
import * as Yup from "yup";
import { connect, useDispatch, useSelector } from 'react-redux'
import { NavLink, Navigate } from 'react-router-dom';
import { getTokenAction, loginWithGoogleAction, userLoginAction, verifyTokenAction } from '../../redux/actions/UserAction';
import './Login.css'
import PropTypes from 'prop-types';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";
import { Modal, Popconfirm } from 'antd';
import { SHOW_MODAL_INPUT_TOKEN } from '../../redux/constants/constant';
import { timeToResetToken } from '../../util/Delay';
import domainName from '../../util/Config';
function Login(props) {
    const {
        errors,
        handleChange,
        handleSubmit,
    } = props;
    const status = useSelector(state => state.user.status)
    const showModalInputToken = useSelector(state => state.user.showModalInputToken)
    const temporaryUserRegistrationId = useSelector(state => state.user.temporaryUserRegistrationId)
    const dispatch = useDispatch()
    const [inputValue, setInputValue] = useState('');
    const [popUpOpen, setPopUpOpen] = useState(false)
    const handleInputChange = (event) => {
        setInputValue(event.target.value);
    };


    //countdown time to send token
    // Sử dụng hook useState để tạo trạng thái countdown, khởi tạo là một số nguyên dương
    const [countdown, setCountdown] = useState(timeToResetToken);
    // Sử dụng hook useState để tạo trạng thái isRunning, khởi tạo là false
    const [isRunning, setIsRunning] = useState(false);
    // Hàm xử lý sự kiện khi nhấn nút "Start"
    const handleStart = () => {
        // Bắt đầu đếm ngược chỉ khi không đang trong quá trình đếm ngược
        if (!isRunning) {
            setIsRunning(true);
            setCountdown(timeToResetToken); // Đặt lại thời gian đếm ngược về giá trị ban đầu
        }
    };
    // Hàm xử lý sự kiện khi đếm ngược hoàn thành
    const handleCompletion = () => {
        setIsRunning(false);
    };
    useEffect(() => {
        if (showModalInputToken === true) {
            let timer;
            if (isRunning) {
                // Sử dụng setInterval để giảm thời gian đếm ngược mỗi giây
                timer = setInterval(() => {
                    setCountdown((prevCountdown) => prevCountdown - 1);
                }, 1000);
            }

            // Kiểm tra và xử lý khi đếm ngược đến 0
            if (countdown === 0) {
                handleCompletion();
                clearInterval(timer); // Dừng đếm ngược
            } else {
                handleStart()
            }

            // Sử dụng hook useEffect để xử lý khi component unmount
            return () => clearInterval(timer);
        }
    }, [isRunning, countdown, showModalInputToken])


    return (
        <>
            {
                !status ? (
                    <section className="background-radial-gradient overflow-hidden" style={{ height: '100vh' }}>
                        <div className="container px-4 py-5 px-md-5 text-center text-lg-start my-5">
                            <div className="row gx-lg-5 align-items-center mb-5">
                                <div className="col-lg-6 mb-5 mb-lg-0" style={{ zIndex: 10 }}>
                                    <h1 className="my-5 display-5 fw-bold ls-tight" style={{ color: 'hsl(218, 81%, 95%)' }}>
                                        The best offer <br />
                                        <span style={{ color: 'hsl(218, 81%, 75%)' }}>for your business</span>
                                    </h1>
                                    <p className="mb-4 opacity-70" style={{ color: 'hsl(218, 81%, 85%)' }}>
                                        Jira is a proprietary product developed by Atlassian that allows bug tracking, issue tracking and agile project management. Jira is used by a large number of clients and users globally for project, time, requirements, task, bug, change, code, test, release, sprint management
                                    </p>
                                </div>
                                <div className="col-lg-6 mb-5 mb-lg-0 position-relative">
                                    <div id="radius-shape-1" className="position-absolute rounded-circle shadow-5-strong" />
                                    <div id="radius-shape-2" className="position-absolute shadow-5-strong" />
                                    <div className="card bg-glass">
                                        <div className="card-body px-4 py-5 px-md-5">
                                            <div>
                                                <h1 style={{ fontWeight: 'bold', marginBottom: '20px', color: "blueviolet" }}>SIGN IN</h1>
                                            </div>
                                            <form onSubmit={handleSubmit}>
                                                <div data-mdb-input-init className="form-outline mb-4" style={{ width: '100%', textAlign: 'left' }}>
                                                    <label className="form-label" htmlFor="email">Email address</label>
                                                    <input onChange={handleChange} type="email" id="email" className="form-control" placeholder='Input your email' />
                                                    <span className='text-danger'>{errors.email}</span>
                                                </div>
                                                {/* Password input */}
                                                <div data-mdb-input-init className="form-outline mb-4" style={{ width: '100%', textAlign: 'left' }}>
                                                    <label className="form-label" htmlFor="password">Password</label>
                                                    <input onChange={handleChange} type="password" id="password" className="form-control" placeholder='Input your password' />
                                                    <span className='text-danger'>{errors.password}</span>
                                                </div>
                                                {/* Submit button */}
                                                <button type="submit" style={{ marginBottom: '10px' }} className="btn btn-primary btn-block mb-4">
                                                    Sign In
                                                </button>
                                                <GoogleLogin
                                                    text="continue_with"
                                                    width="100%"
                                                    locale="en"
                                                    containerProps={{
                                                        style: {
                                                            width: "100% !important",
                                                        },
                                                    }}
                                                    onSuccess={credentialResponse => {
                                                        const decryptData = jwtDecode(credentialResponse.credential);
                                                        const newUser = {
                                                            username: decryptData.name,
                                                            email: decryptData.email,
                                                            password: null
                                                        }
                                                        dispatch(loginWithGoogleAction(newUser))
                                                    }}
                                                    onError={() => {
                                                        console.log('Login Failed');
                                                    }}
                                                />
                                            </form>
                                            <NavLink to='/signup'>Create an account</NavLink>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <Popconfirm
                            title="Cancel Verification"
                            description="Are you sure to cancel this verification?"
                            okText="Yes"
                            placement="topRight"
                            onCancel={() => {
                                setPopUpOpen(false)
                            }}
                            onConfirm={() => {
                                props.dispatch({
                                    type: SHOW_MODAL_INPUT_TOKEN,
                                    status: false,
                                    temporaryUserRegistrationId: null
                                })
                                setPopUpOpen(false)
                            }}
                            cancelText="No"
                            open={popUpOpen}
                        />
                        <Modal title="Verify Token" open={showModalInputToken} onOk={() => {
                            if (inputValue.trim() === "") {
                                alert("Token is not empty")
                            } else {
                                if (temporaryUserRegistrationId !== null) {
                                    props.dispatch(verifyTokenAction({ userId: temporaryUserRegistrationId, token: inputValue }))
                                }
                            }
                        }} onCancel={() => {
                            setPopUpOpen(true)
                        }}>
                            <div className="form-group">
                                <label htmlFor="token">Input your token</label>
                                <input value={inputValue} onChange={handleInputChange} type="text" className="form-control" id="token" placeholder="Input token" />
                                <div className='d-flex mt-2'>
                                    <p className='m-0'>Time remaining: <span style={{ color: 'red' }}>{countdown}</span></p>
                                    <NavLink className="ml-2" to="#" style={{ visibility: isRunning ? 'hidden' : 'visible' }} onClick={() => {
                                        setCountdown(timeToResetToken)
                                        props.dispatch(getTokenAction(temporaryUserRegistrationId))
                                    }}>Get token</NavLink>
                                </div>
                            </div>
                        </Modal>
                    </section>
                ) : <Navigate to="/" />
            }
        </>
    )
}
Login.propTypes = {
    handleSubmit: PropTypes.func.isRequired,
    handleChange: PropTypes.func.isRequired,
    errors: PropTypes.shape({
        email: PropTypes.string,
        password: PropTypes.string
    }),
};
const LoginWithFormik = withFormik({
    mapPropsToValues: () => ({ email: '', password: '' }),

    validationSchema: Yup.object({
        email: Yup.string()
            .trim()
            .required("Email is required!")
            .email("Email is invalid"),
        password: Yup.string()
            .required("Password is required!")
            .min(6, "Password is mimimum 6 characters")
            .max(15, "Password is maximum 6 characters"),
    }),

    handleSubmit: (values, { props }) => {
        props.dispatch(userLoginAction(values.email, values.password))
    },

})(Login);


export default connect()(LoginWithFormik);