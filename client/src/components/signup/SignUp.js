import { withFormik } from 'formik';
import React, { useEffect, useRef, useState } from 'react'
import { connect, useSelector } from 'react-redux';
import * as Yup from "yup";
import { signUpUserAction, verifyTokenAction } from '../../redux/actions/UserAction';
import { NavLink } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Modal } from 'antd';
import { SHOW_MODAL_INPUT_TOKEN } from '../../redux/constants/constant';

function SignUp(props) {
    const {
        handleChange,
        handleSubmit,
        errors
    } = props;
    const showModalInputToken = useSelector(state => state.user.showModalInputToken)
    const temporaryUserRegistrationId = useSelector(state => state.user.temporaryUserRegistrationId)
    const timeToResetToken = 10
    const [inputValue, setInputValue] = useState('');
    const handleInputChange = (event) => {
        setInputValue(event.target.value);
    };


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
        <section className="vh-100 bg-image" style={{ backgroundImage: 'url("https://mdbcdn.b-cdn.net/img/Photos/new-templates/search-box/img4.webp")' }}>
            <div className="mask d-flex align-items-center h-100 gradient-custom-3">
                <div className="container h-100">
                    <div className="row d-flex justify-content-center align-items-center h-100">
                        <div className="col-12 col-md-9 col-lg-7 col-xl-6">
                            <div className="card" style={{ borderRadius: 15 }}>
                                <div className="card-body p-5">
                                    <h2 className="text-uppercase text-center mb- text-primary">Create an account</h2>
                                    <form onSubmit={handleSubmit}>
                                        <div data-mdb-input-init className="form-outline mb-3">
                                            <label className="form-label" htmlFor="username">Username</label>
                                            <input onChange={handleChange} type="text" id="username" className="form-control form-control-lg" placeholder='Input your username' />
                                            <span className='text-danger'>{errors.username}</span>
                                        </div>
                                        <div data-mdb-input-init className="form-outline mb-3">
                                            <label className="form-label" htmlFor="email">Email</label>
                                            <input onChange={handleChange} type="email" id="email" className="form-control form-control-lg" placeholder='Input your email' />
                                            <span className='text-danger'>{errors.email}</span>
                                        </div>
                                        <div data-mdb-input-init className="form-outline mb-3">
                                            <label className="form-label" htmlFor="password">Password</label>
                                            <input onChange={handleChange} type="password" id="password" className="form-control form-control-lg" placeholder='Input your password' />
                                            <span className='text-danger'>{errors.password}</span>
                                        </div>
                                        <div data-mdb-input-init className="form-outline mb-4">
                                            <label className="form-label" htmlFor="confirmpassword">Confirm your password</label>
                                            <input onChange={handleChange} type="password" id="confirmpassword" className="form-control form-control-lg" placeholder='Confirm your password' />
                                            <span className='text-danger'>{errors.confirmpassword}</span>
                                        </div>
                                        <div className="d-flex justify-content-center">
                                            <button type="submit" className="btn btn-success btn-block btn-lg gradient-custom-4 text-body text-light">Register</button>
                                        </div>
                                        <p className="text-center text-muted mt-3 mb-0">Have already an account? <NavLink to="/login" className="fw-bold text-body"><u className='text-primary'>Login here</u></NavLink></p>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Modal title="Verify Token" open={showModalInputToken} onOk={() => {
                if (inputValue.trim() === "") {
                    alert("Ma token khong duoc bo trong")
                } else {
                    if (temporaryUserRegistrationId !== null) {
                        props.dispatch(verifyTokenAction({ userId: temporaryUserRegistrationId, token: inputValue }))
                    }
                }
            }} onCancel={() => {
                props.dispatch({
                    type: SHOW_MODAL_INPUT_TOKEN,
                    status: false
                })
            }}>
                <div className="form-group">
                    <label htmlFor="token">Input your token</label>
                    <input value={inputValue} onChange={handleInputChange} type="text" className="form-control" id="token" placeholder="Input token" />
                    <div className='d-flex mt-2'>
                        <p className='m-0'>Time remaining: <span style={{ color: 'red' }}>{countdown}</span></p>
                        <NavLink className="ml-2" to="#" style={{ visibility: isRunning ? 'hidden' : 'visible' }} onClick={() => {
                            setCountdown(timeToResetToken)
                        }}>Lay lai ma</NavLink>
                    </div>
                </div>
            </Modal>
        </section>

    )
}
const handleSignUpForm = withFormik({
    mapPropsToValues: () => ({ username: '', email: '', password: '', confirmpassword: '' }),
    validationSchema: Yup.object({
        username: Yup.string()
            .trim()
            .required("Username is required")
            .min(5, "Username is minimum 5 characters")
            .max(25, "Username is maximum 25 characters")
            .matches(/^[a-zA-Z0-9\s]*$/, 'Username can\'t contain special characters'),
        email: Yup.string()
            .trim()
            .required("Email is required")
            .email('Email is invalid'),
        password: Yup.string()
            .trim()
            .required("Password is required")
            .min('6', 'Password is minimum 6 characters')
            .max('20', 'Password is maximum 20 characters')
            .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]+$/, 'Must be contain at least one lower and upper case, one number'),
        confirmpassword: Yup.string()
            .trim()
            .required("Confirm password is required")
            .oneOf([Yup.ref('password'), null], "Confirm password is invalid")
    }),
    handleSubmit: (values, { props, setSubmitting }) => {
        props.dispatch(signUpUserAction(values))
    },
    displayName: 'SignUpForm',
})(SignUp);
SignUp.propTypes = {
    handleSubmit: PropTypes.func.isRequired,
    handleChange: PropTypes.func.isRequired,
    errors: PropTypes.shape({
        username: PropTypes.string,
        email: PropTypes.string,
        password: PropTypes.string,
        confirmpassword: PropTypes.string,
    }),
};

export default connect()(handleSignUpForm)