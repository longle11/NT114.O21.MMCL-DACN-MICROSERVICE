import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { UserLoginTemplate } from './templates/UserLoginTemplate';
import Login from './components/Login/Login';
import MainPageTemplate from './templates/MainPageTemplate';
import Dashboard from './components/Dashboard/Dashboard';
import Create from './components/Create-Project/Create';
import ProjectManager from './components/Project-Manager/ProjectManager';
import SignUp from './components/signup/SignUp';
import Loading from './components/Loading/Loading';


function App() {
  return (
    <>
      <Loading />
      <BrowserRouter>
        <Routes>
          <Route path='/manager' element={<MainPageTemplate Component={ProjectManager} />} />
          <Route path='/projectDetail/:id' element={<MainPageTemplate Component={Dashboard} />} />
          <Route path='/' element={<MainPageTemplate Component={ProjectManager} />} />
          <Route path='/create' element={<MainPageTemplate Component={Create} />} />
          <Route path='/login' element={<UserLoginTemplate Component={Login} />} />
          <Route path='/signup' Component={SignUp} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
