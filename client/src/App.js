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
import React from 'react';

import Release from './components/Development/Releases/Release-Dashboard/Release';
import Epic from './components/Development/Epic/Epic-Dashboard/Epic';

import IssuesList from './components/WD-Board/Issues-List/IssuesList';
import EpicDetail from './components/Development/Epic/Epic-Detail/EpicDetail';
import ReleaseDetail from './components/Development/Releases/Release-Detail/ReleaseDetail';

import IssueDetail from './components/WD-Board/Issue-Detail/Issue-Detail';
import WorkflowList from './components/WD-Board/Workflow/Workflow-List/WorkflowList';
import WorkflowEdit from './components/WD-Board/Workflow/Workflow-Edit/WorkflowEdit';
import AddUser from './components/Project-Setiing/Add-User/AddUser';
import YourWork from './components/Your-Work/YourWork';
import IssuePermissions from './components/Project-Setiing/Issue-Permissions/IssuePermissions';
import Calendar from './components/WD-Board/Calendar/Calendar';
import Notification from './components/Project-Setiing/Notifications/Notification';
import IssueSetting from './components/Project-Setiing/Issue-Setting/IssueSetting';
import BurndownChart from './components/WD-Board/Report/BurndownChart/BurndownChart';
import ReportTemplate from './components/WD-Board/Report/Report-Template/ReportTemplate';
import MainProjectTemplate from './components/Project-Template/Main-Project-Template/MainProjectTemplate';
import KanbanTemplate from './components/Project-Template/Kanban-Template/KanbanTemplate';
import ScrumTemplate from './components/Project-Template/Scrum-Template/ScrumTemplate';
import ImportDataProject from './components/Project-Template/Import-Data-Project/ImportDataMainTemplate/ImportDataProject';
import KanbanDashboard from './components/Kanban-Dashboard/KanbanDashboard';
import ComponentList from './components/Development/Component/Component-Dashboard/ComponentList';
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
          <Route path='/projectDetail/:id/kanban-board' element={<MainPageTemplate Component={KanbanDashboard} />} />

          <Route path='/projectDetail/:id/backlog' element={<MainPageTemplate Component={Backlog} />} />
          <Route path='/projectDetail/:id/active-sprints' element={<MainPageTemplate Component={SignUp} />} />
          <Route path='/projectDetail/:id/reports/burndownchart/:sprintId' element={<MainPageTemplate Component={BurndownChart} />} />
          <Route path='/projectDetail/:id/reports' element={<MainPageTemplate Component={ReportTemplate} />} />

          <Route path='/create-project/software-project/templates' element={<MainPageTemplate Component={MainProjectTemplate} />} />
          <Route path='/create-project/software-project/templates/imports' element={<MainPageTemplate Component={ImportDataProject} />} />
          <Route path='/create-project/software-project/templates/kaban-template' element={<MainPageTemplate Component={KanbanTemplate} />} />
          <Route path='/create-project/software-project/templates/scrum-template' element={<MainPageTemplate Component={ScrumTemplate} />} />
          <Route path='/create-project/:template_id' element={<MainPageTemplate Component={Create} />} />


          <Route path='/projectDetail/:id/releases' element={<MainPageTemplate Component={Release} />} />
          <Route path='/projectDetail/:id/epics' element={<MainPageTemplate Component={Epic} />} />
          <Route path='/projectDetail/:id/components' element={<MainPageTemplate Component={ComponentList} />} />


          <Route path='/projectDetail/:id/epics/epic-detail/:epicId' element={<MainPageTemplate Component={EpicDetail} />} />
          <Route path='/projectDetail/:id/versions/version-detail/:versionId' element={<MainPageTemplate Component={ReleaseDetail} />} />
          {/* <Route path='/projectDetail/:id/components/components-detail/:componentId' element={<MainPageTemplate Component={ReleaseDetail} />} /> */}
          <Route path='/projectDetail/:id/issues' element={<MainPageTemplate Component={Create} />} />
          <Route path='/projectDetail/:id/list' element={<MainPageTemplate Component={IssuesList} />} />
          <Route path='/projectDetail/:id/calendar' element={<MainPageTemplate Component={Calendar} />} />

          <Route path='/projectDetail/:id/workflows/create-workflow' Component={WorkflowEdit} />
          <Route path='/projectDetail/:id/workflows' element={<MainPageTemplate Component={WorkflowList} />} />
          <Route path='/projectDetail/:id/workflows/edit/:workflowId' Component={WorkflowEdit} />
          <Route path='/projectDetail/:id/issues/issue-detail?/:issueId' element={<MainPageTemplate Component={IssueDetail} />} />
          <Route path='/projectDetail/:id/settings/access' element={<MainPageTemplate Component={AddUser} />} />
          <Route path='/projectDetail/:id/settings/issues' element={<MainPageTemplate Component={IssueSetting} />} />
          <Route path='/projectDetail/:id/settings/notifications' element={<MainPageTemplate Component={Notification} />} />
          <Route path='/projectDetail/:id/settings/issue-permissions?/:issueId' element={<MainPageTemplate Component={IssuePermissions} />} />
          <Route path='/your-work' element={<MainPageTemplate Component={YourWork} />} />

          <Route path='/components' element={<MainPageTemplate Component={Create} />} />

          <Route path='/login' element={<UserLoginTemplate Component={Login} />} />
          <Route path='/signup' Component={SignUp} />
          <Route path='/profile/:id' Component={ProfileUser} />
          <Route path='/' element={<MainPageTemplate Component={ProjectManager} />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
