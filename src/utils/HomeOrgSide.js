import React from "react";
import classes from "./Home.module.css";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { userActions } from "../redux/store";

export default function HomeOrgSide(props) {
  const dispatch = useDispatch();

  return (
    <div className={classes.mainPage}>
      <div className={classes.options}>
        <div className={classes.optionsSection}>
          <div className={classes.optionslinks}>
            <i className="fa-solid fa-calendar"></i>
            <Link className={classes.optionslink} to="/organizer/">
              My Events
            </Link>
          </div>
          <div className={classes.optionslinks}>
            <i className="fa-solid fa-calendar-plus"></i>
            <Link className={classes.optionslink} to="/organizer/create-events">
              Create Event
            </Link>
          </div>
          <div className={classes.optionslinks}>
            <i className="fa-solid fa-chart-bar"></i>
            <Link className={classes.optionslink} to="/organizer/analytics">
              Analytics
            </Link>
          </div>
          <div className={classes.optionslinks}>
            <i class="fa-solid fa-bell"></i>
            <Link className={classes.optionslink} to="/organizer/notifications">
              Notifications
            </Link>
          </div>
          <div className={classes.optionslinks}>
            <i className="fa-solid fa-user"></i>
            <Link className={classes.optionslink} to="/organizer/profile">
              My Profile
            </Link>
          </div>
          <div className={classes.optionslinks}>
            <i className="fa-solid fa-sign-out-alt"></i>
            <Link
              className={classes.optionslink}
              to="/"
              onClick={() => {
                localStorage.removeItem("user");
                toast("Logged Out");
                dispatch(userActions.LoggedOut());
              }}
            >
              Logout
            </Link>
          </div>
        </div>
      </div>
      <div className={classes.posts}>{props.children}</div>
    </div>
  );
}
