import React, { useEffect } from "react";
import "./App.css";
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import NotFound from "./pages/NotFound";
import ScrollToTop from "./utils/ScrollToTop";
import MyEvents from "./pages/Attendee/MyEvents";
import ExploreEvents from "./pages/Attendee/ExploreEvents";
import MyProfile from "./pages/Attendee/MyProfile";
import MyProfileOrg from "./pages/Organizer/MyProfileOrg";
import AttendeeDashboard from "./pages/Attendee/AttendeeDashboard";
import CreateEvent from "./pages/Organizer/CreateEvent";
import { Route, Routes, Navigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { userActions } from "./redux/store";
import MyEventsOrg from "./pages/Organizer/MyEventsOrg";
import Notifications from "./pages/Organizer/Notifications";
import DeleteUser from "./pages/Admin/DeleteUser";
import DeleteOrganizer from "./pages/Admin/DeleteOrganizer";
import Analytics from "./pages/Organizer/Analytics";
import AllEventsDetails from "./pages/Admin/AllEventsDetails";
import ProfileAdmin from "./pages/Admin/ProfileAdmin";

function App() {
  const isAuthenticated = useSelector((state) => state.isAuthenticated);
  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const location = useLocation();
  useEffect(() => {
    const storedAuthState = JSON.parse(localStorage.getItem("user"));
    if (storedAuthState) {
      dispatch(userActions.LoggedIn(storedAuthState));
    } else {
      dispatch(userActions.LoggedOut());
    }
  }, [isAuthenticated]);

  function AttendeeRoutes() {
    return (
      <Routes>
        <Route path="/" element={<AttendeeDashboard />} />
        <Route path="/my-events" element={<MyEvents />} />
        <Route path="/explore-events" element={<ExploreEvents />} />
        <Route path="/profile" element={<MyProfile />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    );
  }

  function OrganizerRoutes() {
    return (
      <Routes>
        <Route path="/" element={<MyEventsOrg />} />
        <Route path="/create-events" element={<CreateEvent />} />
        <Route path="/analytics" element={<Analytics/>} />
        <Route path="/profile" element={<MyProfileOrg />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    );
  }

  function AdminRoutes() {
    return (
      <Routes>
        <Route path="/" element={<DeleteUser />} />
        <Route path="/delete-organizer" element={<DeleteOrganizer />} />
        <Route path="/profile" element={<ProfileAdmin />} />
        <Route path="/analytics" element={<AllEventsDetails />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    );
  }

  return (
    <div className="App">
      {!(location.pathname === "/" || location.pathname === "/sign-up") && <NavBar/> }
      <ScrollToTop />
      <Routes>
        {isAuthenticated ? (
          <>
            {user.role === "attendee" ? (
              <Route path="/attendee/*" element={<AttendeeRoutes />} />
            ) : user.role === "organizer" ? (
              <Route path="/organizer/*" element={<OrganizerRoutes />} />
            ) : user.role === "admin" ? (
              <Route path="/admin/*" element={<AdminRoutes />} />
            ) : (
              <Route path="/" element={<NotFound />} />
            )}
            <Route
              path="/"
              element={<Navigate to={`/${user.role}`} replace />}
            />
            <Route
              path="/sign-up"
              element={<Navigate to={`/${user.role}`} replace />}
            />
          </>
        ) : (
          <>
            <Route path="/" element={<Login />} />
            <Route path="/sign-up" element={<Signup />} />
          </>
        )}
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
    </div>
  );
}

export default App;
