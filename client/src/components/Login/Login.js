import React from 'react'
import { withFormik } from 'formik'
import * as Yup from "yup";
import { connect, useSelector } from 'react-redux'
import { NavLink, Navigate } from 'react-router-dom';
import { userLoginAction } from '../../redux/actions/UserAction';
function Login(props) {
    const {
        errors,
        handleChange,
        handleSubmit,
    } = props;
    var status = useSelector(state => state.user.status)
    return (
        <>
            {
                !status ? (
                    <div>
                        <form className='w-100 container' onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label htmlFor="email">Email</label>
                                <input onChange={handleChange} type="text" className="form-control" id="email" name='email' />
                                <span className='text-danger'>{errors.email}</span>
                            </div>
                            <div className="form-group">
                                <label htmlFor="password">Password</label>
                                <input onChange={handleChange} type="password" className="form-control" id="password" name='password' />
                                <span className='text-danger'>{errors.password}</span>
                            </div>
                            <button type="submit" className="btn btn-primary" style={{ width: '50%' }}>Submit</button>
                        </form>
                        <NavLink to='/signup'>Create an account</NavLink>
                    </div>

                ) : <Navigate to="/" />
            }
        </>
    )
}

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