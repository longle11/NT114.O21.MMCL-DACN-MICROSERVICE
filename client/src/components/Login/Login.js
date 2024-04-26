import React from 'react'
import { withFormik } from 'formik'
import * as Yup from "yup";
import { connect, useSelector } from 'react-redux'
import { NavLink, Navigate } from 'react-router-dom';
import { userLoginAction } from '../../redux/actions/UserAction';
import './Login.css'
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
                    <section className="background-radial-gradient overflow-hidden" style={{ height: '100vh' }}>
                        <div className="container px-4 py-5 px-md-5 text-center text-lg-start my-5">

                            <div className="row gx-lg-5 align-items-center mb-5">
                                <div className="col-lg-6 mb-5 mb-lg-0" style={{ zIndex: 10 }}>
                                    <h1 className="my-5 display-5 fw-bold ls-tight" style={{ color: 'hsl(218, 81%, 95%)' }}>
                                        The best offer <br />
                                        <span style={{ color: 'hsl(218, 81%, 75%)' }}>for your business</span>
                                    </h1>
                                    <p className="mb-4 opacity-70" style={{ color: 'hsl(218, 81%, 85%)' }}>
                                        Lorem ipsum dolor, sit amet consectetur adipisicing elit.
                                        Temporibus, expedita iusto veniam atque, magni tempora mollitia
                                        dolorum consequatur nulla, neque debitis eos reprehenderit quasi
                                        ab ipsum nisi dolorem modi. Quos?
                                    </p>
                                </div>
                                <div className="col-lg-6 mb-5 mb-lg-0 position-relative">
                                    <div id="radius-shape-1" className="position-absolute rounded-circle shadow-5-strong" />
                                    <div id="radius-shape-2" className="position-absolute shadow-5-strong" />
                                    <div className="card bg-glass">
                                        <div className="card-body px-4 py-5 px-md-5">
                                            <div>
                                                <h1 style={{fontWeight: 'bold', marginBottom: '20px', color: "blueviolet"}}>SIGN IN</h1>
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
                                                <button type="submit" data-mdb-button-init data-mdb-ripple-init className="btn btn-primary btn-block mb-4">
                                                    Sign In
                                                </button>
                                            </form>
                                            <NavLink to='/signup'>Create an account</NavLink>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
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