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
import Backlog from './components/WD-Board/Backlog/Backlog';
import Release from './components/Development/Releases/Release-Dashboard/Release';
import IssuesList from './components/WD-Board/Issues-List/IssuesList';
import Epic from './components/Development/Epic/Epic-Dashboard/Epic';
import EpicDetail from './components/Development/Epic/Epic-Detail/EpicDetail';
import ReleaseDetail from './components/Development/Releases/Release-Detail/ReleaseDetail';
import IssueDetail from './components/WD-Board/Issue-Detail/Issue-Detail';
import WorkflowList from './components/WD-Board/Workflow/Workflow-List/WorkflowList';
import WorkflowEdit from './components/WD-Board/Workflow/Workflow-Edit/WorkflowEdit';
import AddUser from './components/Project-Setiing/Add-User/AddUser';
function App() {
  const dispatch = useDispatch()
  useEffect(() => {
    dispatch(userLoggedInAction())
  }, [dispatch])
  return (
    <>
      <BrowserRouter>
        <Loading />
        <Routes>
          <Route path='/manager' element={<MainPageTemplate Component={ProjectManager} />} />
          <Route path='/projectDetail/:id/board?/:sprintId' element={<MainPageTemplate Component={Dashboard} />} />
          <Route path='/projectDetail/:id/backlog' element={<MainPageTemplate Component={Backlog} />} />
          <Route path='/projectDetail/:id/active-sprints' element={<MainPageTemplate Component={SignUp} />} />
          <Route path='/projectDetail/:id/reports' element={<MainPageTemplate Component={ProjectManager} />} />
          <Route path='/projectDetail/:id/releases' element={<MainPageTemplate Component={Release} />} />
          <Route path='/projectDetail/:id/epics' element={<MainPageTemplate Component={Epic} />} />
          <Route path='/projectDetail/:id/epics/epic-detail/:epicId' element={<MainPageTemplate Component={EpicDetail} />} />
          <Route path='/projectDetail/:id/versions/version-detail/:versionId' element={<MainPageTemplate Component={ReleaseDetail} />} />
          <Route path='/projectDetail/:id/issues' element={<MainPageTemplate Component={Create} />} />
          <Route path='/projectDetail/:id/list' element={<MainPageTemplate Component={IssuesList} />} />
          <Route path='/projectDetail/:id/workflows/create-workflow' Component={WorkflowEdit} />
          <Route path='/projectDetail/:id/workflows' element={<MainPageTemplate Component={WorkflowList} />} />
          <Route path='/projectDetail/:id/workflows/edit/:workflowId' Component={WorkflowEdit} />
          <Route path='/projectDetail/:id/issues/issue-detail?/:issueId' element={<MainPageTemplate Component={IssueDetail} />} />
          <Route path='/projectDetail/:id/settings/access' element={<MainPageTemplate Component={AddUser} />} />

          <Route path='/' element={<MainPageTemplate Component={ProjectManager} />} />
          <Route path='/create' element={<MainPageTemplate Component={Create} />} />


          <Route path='/components' element={<MainPageTemplate Component={Create} />} />

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
