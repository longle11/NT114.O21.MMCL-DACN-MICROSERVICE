import { withFormik } from 'formik';
import React from 'react'
import { connect } from 'react-redux';
import * as Yup from "yup";
import { signUpUserAction } from '../../redux/actions/UserAction';
import { NavLink } from 'react-router-dom';

function SignUp(props) {
    const {
        handleChange,
        handleSubmit,
        errors
    } = props;

    return (
        <div className='container'>
            <form onSubmit={handleSubmit}>
                <div className='from-group'>
                    <label>Username</label>
                    <input className='form-control' placeholder='Input Username' onChange={handleChange} name="username" />
                    <span className='text-danger'>{errors.username}</span>
                </div>
                <div className='from-group'>
                    <label>Email</label>
                    <input className='form-control' placeholder='Input Email' onChange={handleChange} name="email" />
                    <span className='text-danger'>{errors.email}</span>
                </div>
                <div className='from-group'>
                    <label>Password</label>
                    <input className='form-control' type='password' placeholder='Input Password' onChange={handleChange} name="password" />
                    <span className='text-danger'>{errors.password}</span>
                </div>
                <div className='from-group'>
                    <label>Confirm Password</label>
                    <input className='form-control' type='password' placeholder='Confirm Pasword' onChange={handleChange} name="confirmpassword" />
                    <span className='text-danger'>{errors.confirmpassword}</span>
                </div>
                <button type="submit" className="btn btn-primary mt-3" style={{ width: '50%' }}>Submit</button>
            </form>

            <NavLink to="/login">Login</NavLink>
        </div>
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


export default connect()(handleSignUpForm)