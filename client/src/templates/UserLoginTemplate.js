import { useSelector } from 'react-redux';
import Login from '../components/Login/Login';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export const UserLoginTemplate = ({ Component }) => {
    const userInfo = useSelector(state => state.user.userInfo)
    const navigate = useNavigate()
    useEffect(() => {
        if(userInfo !== null) {
            navigate('/')
        }
    }, [userInfo, navigate])
    return <Login />
}
UserLoginTemplate.propTypes = {
    Component: PropTypes.elementType.isRequired
};