import React from "react";
import classes from "./Home.module.css";
import { Link } from "react-router-dom";
import { userActions } from "../redux/store";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";

export default function Home(props) {
  const dispatch = useDispatch();
  return (
    <div className={classes.mainPage}>
      <div className={classes.options}>
        <div className={classes.optionsSection}>
          <div className={classes.optionslinks}>
            <i className="fa-solid fa-house"></i>
            <Link className={classes.optionslink} to="/attendee">
              Dashboard
            </Link>
          </div>
          <div className={classes.optionslinks}>
            <i className="fa-solid fa-calendar"></i>
            <Link className={classes.optionslink} to="/attendee/my-events">
              My Events
            </Link>
          </div>
          <div className={classes.optionslinks}>
            <i className="fa-solid fa-search"></i>
            <Link className={classes.optionslink} to="/attendee/explore-events">
              Explore Events
            </Link>
          </div>

          <div className={classes.optionslinks}>
            <i className="fa-solid fa-user"></i>
            <Link className={classes.optionslink} to="/attendee/profile">
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
