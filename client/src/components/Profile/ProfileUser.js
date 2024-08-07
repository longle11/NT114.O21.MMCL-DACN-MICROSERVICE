import React from 'react'

export default function ProfileUser() {
    return (
        <div>
            <h5>Your Profile</h5>
            <p>Manage your personal information, and control which information other people see and apps may access.</p>

            <h6>About you</h6>
            <ul className="card d-flex flex-column" style={{ width: '50rem', padding: '10px 20px' }}>
                <li className='d-flex justify-content-end'>
                    <span>Who can see this?</span>
                </li>
                <li className='d-flex justify-content-between mr-4 ml-4'>
                    <div className='d-flex flex-column'>
                        <h6>Full name</h6>
                        <span>Long Le</span>
                    </div>
                    <div className='d-flex align-items-center'>
                        <i className="fa fa-globe" aria-hidden="true"></i>
                        <span className='ml-2'>Anyone</span>
                    </div>
                </li>
                <li className='d-flex justify-content-between mr-4 ml-4'>
                    <div className='d-flex flex-column'>
                        <h6>Job title</h6>
                        <span>Long Le</span>
                    </div>
                    <div className='d-flex align-items-center'>
                        <i className="fa fa-globe" aria-hidden="true"></i>
                        <span className='ml-2'>Anyone</span>
                    </div>
                </li>
                <li className='d-flex justify-content-between mr-4 ml-4'>
                    <div className='d-flex flex-column'>
                        <h6>Department</h6>
                        <span>Long Le</span>
                    </div>
                    <div className='d-flex align-items-center'>
                        <i className="fa fa-globe" aria-hidden="true"></i>
                        <span className='ml-2'>Anyone</span>
                    </div>
                </li>
                <li className='d-flex justify-content-between mr-4 ml-4'>
                    <div className='d-flex flex-column'>
                        <h6>Organization</h6>
                        <span>Long Le</span>
                    </div>
                    <div className='d-flex align-items-center'>
                        <i className="fa fa-globe" aria-hidden="true"></i>
                        <span className='ml-2'>Anyone</span>
                    </div>
                </li>
                <li className='d-flex justify-content-between mr-4 ml-4'>
                    <div className='d-flex flex-column'>
                        <h6>Based in</h6>
                        <span>Long Le</span>
                    </div>
                    <div className='d-flex align-items-center'>
                        <i className="fa fa-globe" aria-hidden="true"></i>
                        <span className='ml-2'>Anyone</span>
                    </div>
                </li>
            </ul>
            <ul className="card d-flex flex-column" style={{ width: '50rem', padding: '10px 20px' }}>
                <li className='d-flex justify-content-end'>
                    <span>Who can see this?</span>
                </li>
                <li className='d-flex justify-content-between mr-4 ml-4'>
                    <div className='d-flex flex-column'>
                        <h6>Email address</h6>
                        <span>ltphilong2001@gmail.com</span>
                    </div>
                    <div className='d-flex align-items-center'>
                        <i className="fa fa-globe" aria-hidden="true"></i>
                        <span className='ml-2'>Anyone</span>
                    </div>
                </li>
            </ul>
        </div>
    )
}
