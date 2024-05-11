import { useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { userLoggedInAction } from '../redux/actions/UserAction';
import Login from '../components/Login/Login';
import PropTypes from 'prop-types';
UserLoginTemplate.propTypes = {
    Component: PropTypes.elementType.isRequired
};
export const UserLoginTemplate = ({ Component }) => {
    const dispatch = useDispatch()
    useEffect(() => {
        dispatch(userLoggedInAction())
    }, [])
    return <Login />
} 