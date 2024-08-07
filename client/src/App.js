import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { UserLoginTemplate } from './templates/UserLoginTemplate';
import Login from './components/Login/Login';
import MainPageTemplate from './templates/MainPageTemplate';
import Dashboard from './components/Dashboard/Dashboard';
import Create from './components/Create-Project/Create';
import ProjectManager from './components/Project-Manager/ProjectManager';
import SignUp from './components/signup/SignUp';
import Loading from './components/Loading/Loading';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { userLoggedInAction } from './redux/actions/UserAction'
import NotFound from './components/NotFound/NotFound';
import ProfileUser from './components/Profile/ProfileUser';
function App() {
  const dispatch = useDispatch()
  useEffect(() => {
    dispatch(userLoggedInAction())
  }, [])
  return (
    <>
      <BrowserRouter> 
        <Loading />
        <Routes>
          <Route path='/manager' element={<MainPageTemplate Component={ProjectManager} />} />
          <Route path='/projectDetail/:id' element={<MainPageTemplate Component={Dashboard} />} />
          <Route path='/' element={<MainPageTemplate Component={ProjectManager} />} />
          <Route path='/create' element={<MainPageTemplate Component={Create} />} />
          <Route path='/login' element={<UserLoginTemplate Component={Login} />} />
          <Route path='/signup' Component={SignUp} />
          <Route path='/profile/:id' Component={ProfileUser} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
