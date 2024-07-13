import React from "react";
import classes from "./NavBar.module.css";
import Logo from "../assets/logo.png";
export default function NavBar() {
  return (
    <div className={classes.navBar}>
      <div className={classes.LogoImg}>
        <img src={Logo} alt="logo" />
      </div>
    </div>
  );
}
