import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route
} from "react-router-dom";

import loadingIcon from '../../images/loading-2.gif';
import './app.scss';
import { useAuth0 } from '../../lib/auth';
import { PrivateRoute } from "../../components/privateroute/privateroute-container";
import {
  Registration,
  Home,
  Login,
  AuditTasks,
  CustomTasks,
  PromotionTasks,
  AuditSchedule,
  AuditSchedules,
  Task,
  CreateCustomTask,
  CreatePromotionTask,
  ReportSelectPre,
  ReportSelect,
  Report,
  CreateAuditSchedule,
  Settings
} from '../../routes';

const App: React.FC = () => {
  const {
    isInitializing
  } = useAuth0();
  if (isInitializing) {
    return (
      <div className="app app--loading">
        <img src={loadingIcon} alt="" />
      </div>
    )
  }
  return (
    <div className="app">
      <Router>
        <Switch>
          <Route path="/" exact component={Login} />
          <PrivateRoute path="/registration" title="Registration" component={Registration} />
          <PrivateRoute path="/home" title="Home" component={Home} />
          <PrivateRoute path="/audittasks" title="All audit tasks" isBack={true} backLink="/auditschedules" component={AuditTasks} />
          <PrivateRoute path="/auditschedules" title="All audit schedules" isBack={true} backLink="/home" component={AuditSchedules} />
          <PrivateRoute path="/customtasks" title="Custom tasks" isBack={true} backLink="/home" component={CustomTasks} />
          <PrivateRoute path="/promotiontasks" title="Promotion tasks" isBack={true} backLink="/home" component={PromotionTasks} />
          <PrivateRoute path="/createauditschedule" title="Create an audit schedule" isBack={true} backLink="/auditschedules" component={CreateAuditSchedule} />
          <PrivateRoute path="/auditschedule/:id" title="Audit schedule" isBack={true} backLink="/auditschedules" component={AuditSchedule} />
          <PrivateRoute path="/audittask/:id" title="Audit task" isBack={true} backLink="/audittasks" component={Task} />
          <PrivateRoute path="/customtask/:id" title="Custom task" isBack={true} backLink="/customtasks" component={Task} />
          <PrivateRoute path="/promotiontask/:id" title="Promotion task" isBack={true} backLink="/promotiontasks" component={Task} />
          <PrivateRoute path="/createcustomtask" title="Create a custom task" isBack={true} backLink="/customtasks" component={CreateCustomTask} />
          <PrivateRoute path="/createpromotiontask" title="Create a promotion task" isBack={true} backLink="/promotiontasks" component={CreatePromotionTask} />
          <PrivateRoute path="/reportselectpre" title="Report" isBack={true} backLink="/home" component={ReportSelectPre} />
          <PrivateRoute path="/reportselect" title="Report" isBack={true} backLink="/reportselectpre" component={ReportSelect} />
          <PrivateRoute path="/report/:type?/:filter?" title="Report" isBack={true} backLink="/reportselectpre" component={Report} />
          <PrivateRoute path="/settings" title="Settings" component={Settings} isBack={true} backLink="/home" />
        </Switch>
      </Router>
    </div>
  );
}

export default App;
