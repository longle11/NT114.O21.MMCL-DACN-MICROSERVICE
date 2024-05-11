import { withFormik } from 'formik';
import React from 'react'
import { connect } from 'react-redux';
import * as Yup from "yup";
import { signUpUserAction } from '../../redux/actions/UserAction';
import { NavLink } from 'react-router-dom';
import PropTypes from 'prop-types';

function SignUp(props) {
    const {
        handleChange,
        handleSubmit,
        errors
    } = props;

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
                                            <input onChange={handleChange} type="text" id="username" className="form-control form-control-lg" placeholder='Input your username'/>
                                            <span className='text-danger'>{errors.username}</span>
                                        </div>
                                        <div data-mdb-input-init className="form-outline mb-3">
                                            <label className="form-label" htmlFor="email">Email</label>
                                            <input onChange={handleChange} type="email" id="email" className="form-control form-control-lg" placeholder='Input your email'/>
                                            <span className='text-danger'>{errors.email}</span>
                                        </div>
                                        <div data-mdb-input-init className="form-outline mb-3">
                                            <label className="form-label" htmlFor="password">Password</label>
                                            <input onChange={handleChange} type="password" id="password" className="form-control form-control-lg"  placeholder='Input your password'/>
                                            <span className='text-danger'>{errors.password}</span>
                                        </div>
                                        <div data-mdb-input-init className="form-outline mb-4">
                                            <label className="form-label" htmlFor="confirmpassword">Confirm your password</label>
                                            <input onChange={handleChange} type="password" id="confirmpassword" className="form-control form-control-lg" placeholder='Confirm your password'/>
                                            <span className='text-danger'>{errors.confirmpassword}</span>
                                        </div>
                                        <div className="d-flex justify-content-center">
                                            <button type="submit" data-mdb-button-init data-mdb-ripple-init className="btn btn-success btn-block btn-lg gradient-custom-4 text-body text-light">Register</button>
                                        </div>
                                        <p className="text-center text-muted mt-3 mb-0">Have already an account? <NavLink to="/login" className="fw-bold text-body"><u className='text-primary'>Login here</u></NavLink></p>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
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