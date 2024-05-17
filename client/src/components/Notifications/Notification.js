import React from 'react'
import { NavLink } from 'react-router-dom'

export default function Notification() {
    return (
        <div className="list-group" style={{overflow: "hidden"}}>
            <NavLink to="#" className="list-group-item list-group-item-action active mb-2" style={{backgroundColor: "#17a2b8"}}>
                <div className="d-flex w-100 justify-content-between">
                    <p className="mb-1">Notification</p>
                    <small>3 days ago</small>
                </div>
                <p className="mb-1">Text tin nhan thoi ne</p>
                <button className='btn btn-transparent text-dark p-0 font-weight-bold'>Mask as read</button>
            </NavLink>
            <NavLink to="#" className="list-group-item list-group-item-action mb-2" style={{backgroundColor: "#17a2b8"}}>
                <div className="d-flex w-100 justify-content-between">
                    <p className="mb-1">Notification</p>
                    <small className="text-muted">3 days ago</small>
                </div>
                <p className="mb-1">Text tin nhan thoi ne</p>
                <button className='btn btn-transparent text-dark p-0 font-weight-bold'>Mask as read</button>
            </NavLink>
            <NavLink to="#" className="list-group-item list-group-item-action mb-2" style={{backgroundColor: "#17a2b8"}}>
                <div className="d-flex w-100 justify-content-between">
                    <p className="mb-1">Notification</p>
                    <small className="text-muted">3 days ago</small>
                </div>
                <p className="mb-1">Text tin nhan thoi ne</p>
                <button className='btn btn-transparent text-dark p-0 font-weight-bold'>Mask as read</button>
            </NavLink>
        </div>

    )
}
