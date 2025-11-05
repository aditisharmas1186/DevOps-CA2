import './App.css';
import {
  createHashRouter,
  RouterProvider
} from "react-router-dom";

import Homepage from './components/Homepage';
import Registration from './components/Registration';
import UserRegistration from './components/UserRegistration';
import CTRegistration from './components/CTRegistration';

import UserDashboard from './components/UserDashboard';
import AttendEvent from './components/userdashboard/AttendEvent';
import CreateEvent from './components/userdashboard/CreateEvent';
import Medication from './components/userdashboard/Medication';
import MyRequests from './components/userdashboard/MyRequests';
import HireCT from './components/userdashboard/HireCT';
import BasicDatePicker from './components/BasicDatePicker';
import BasicTimePicker from './components/BasicTimePicker';
import UserProfile from './components/userdashboard/UserProfile';

import CTProfile from './components/CTDashboard/CTProfile';
import CTRequests from './components/CTDashboard/CTRequests';
import CTDashboard from './components/CTDashboard/CTDashboard';
import CTCustomers from './components/CTDashboard/CTCustomers';
import CTReviews from './components/CTDashboard/CTReviews';

// ✅ Define all routes here
const router = createHashRouter([
  { path: "/", element: <Homepage /> },
  { path: "/register", element: <Registration /> },
  { path: "/userregister", element: <UserRegistration /> },
  { path: "/ctregister", element: <CTRegistration /> },
  { path: "/userdashboard", element: <UserDashboard /> },
  { path: "/attendevent", element: <AttendEvent /> },
  { path: "/createevent", element: <CreateEvent /> },
  { path: "/hirect", element: <HireCT /> },
  { path: "/medication", element: <Medication /> },
  { path: "/myrequests", element: <MyRequests /> },
  { path: "/userprofile", element: <UserProfile /> },
  { path: "/timepicker", element: <BasicTimePicker /> },
  { path: "/ctprofile", element: <CTProfile /> },
  { path: "/ctrequests", element: <CTRequests /> },
  { path: "/ctdashboard", element: <CTDashboard /> },
  { path: "/ctcustomers", element: <CTCustomers /> },
  { path: "/ctreviews", element: <CTReviews /> },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
