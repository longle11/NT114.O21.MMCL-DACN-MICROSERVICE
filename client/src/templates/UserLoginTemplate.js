import { useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { userLoggedInAction } from '../redux/actions/UserAction';
import Login from '../components/Login/Login';
import PropTypes from 'prop-types';

export const UserLoginTemplate = ({ Component }) => {
    const dispatch = useDispatch()
    useEffect(() => {
        dispatch(userLoggedInAction())
        // eslint-disable-next-line
    }, [])
    return <Login />
}
UserLoginTemplate.propTypes = {
    Component: PropTypes.elementType.isRequired
};