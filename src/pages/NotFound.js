import React from "react";
import classes from "./NotFound.module.css";

export default function NotFound() {
  return (
    <div className={classes.error}>
      <h1>PAGE NOT FOUND</h1>
      <h1>ERROR 404</h1>
    </div>
  );
}
