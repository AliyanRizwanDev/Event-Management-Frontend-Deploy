import React from "react";
import classes from "./Footer.module.css";
import Logo from "../assets/logo.png";

export default function Footer() {
  return (
    <div className={classes.view}>
      <div className={classes.footer}>
        <div className={classes.footerImg}>
          <img src={Logo} alt="logo" />
        </div>
        <div className={classes.copyright}>
          <p>© 2024 Connectify. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
