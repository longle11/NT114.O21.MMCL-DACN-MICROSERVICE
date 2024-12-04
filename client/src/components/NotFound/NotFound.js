import React from 'react'
import { NavLink } from 'react-router-dom'
import './NotFound.css'
export default function NotFound() {
    return (
        <>
            <div>
                <h1>404 Error Page #2</h1>
                <p className="zoom-area"><b>CSS</b> animations to make a cool 404 page. </p>
                <section className="error-container">
                    <span className="four"><span className="screen-reader-text">4</span></span>
                    <span className="zero"><span className="screen-reader-text">0</span></span>
                    <span className="four"><span className="screen-reader-text">4</span></span>
                </section>
                <div className="link-container">
                    <NavLink to="/login" className="more-link">Back to the main page</NavLink>
                </div>
            </div>

        </>
    )
}
