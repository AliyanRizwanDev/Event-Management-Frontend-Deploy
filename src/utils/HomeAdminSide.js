import React from "react";
import classes from "./Home.module.css";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { userActions } from "../redux/store";

export default function HomeAdminSide(props) {
  const dispatch = useDispatch();

  return (
    <div className={classes.mainPage}>
      <div className={classes.options}>
        <div className={classes.optionsSection}>
          <div className={classes.optionslinks}>
            <i className="fa-solid fa-user-slash"></i>
            <Link className={classes.optionslink} to="/admin/">
              Delete User
            </Link>
          </div>
          <div className={classes.optionslinks}>
            <i className="fa-solid fa-user-slash"></i>
            <Link className={classes.optionslink} to="/admin/delete-organizer">
              Delete Organizer
            </Link>
          </div>
          <div className={classes.optionslinks}>
            <i className="fa-solid fa-user"></i>
            <Link className={classes.optionslink} to="/admin/profile">
              My Profile
            </Link>
          </div>
          <div className={classes.optionslinks}>
            <i className="fa-solid fa-chart-bar"></i>
            <Link className={classes.optionslink} to="/admin/analytics">
              Analytics
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
