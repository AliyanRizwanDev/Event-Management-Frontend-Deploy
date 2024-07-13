import React, { useState } from "react";
import classes from "./Signup.module.css";
import Logo from "../assets/logo.png";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { API_ROUTE } from "../env";
import Spinner from "../utils/Spinner";

export default function Signup() {
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("attendee");
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [confirmPasswordError, setConfirmPasswordError] = useState(false);
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isEmailValid = emailRegex.test(email.toLowerCase());
    const isPasswordValid = password.length >= 6;
    const isConfirmPasswordValid = password === confirmPassword;

    setEmailError(!isEmailValid);
    setPasswordError(!isPasswordValid);
    setConfirmPasswordError(!isConfirmPasswordValid);

    if (isEmailValid && isPasswordValid && isConfirmPasswordValid) {
      setLoading(true);
      const data = {
        firstName: firstname,
        lastName: lastname,
        email,
        password,
        role,
      };

      try {
        await axios.post(`${API_ROUTE}/user/signup`, data);
        setApiError("");
        toast.success("Account Created");
        nav(`/`);
      } catch (error) {
        setApiError(error.response?.data?.error || "An error occurred");
        toast.error(error.response?.data?.error || "An error occurred");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className={classes.loginPage}>
      <div className={classes.leftDesign}>
        <img src={Logo} alt="" className={classes.loginImg} />
        <h4>Bridging Moments, Building Memories.</h4>
      </div>
      <div className={classes.Login}>
        <form className={classes.LoginForm} onSubmit={handleSubmit}>
          <h1>Sign Up</h1>
          <label htmlFor="firstname">First Name</label>
          <input
            type="text"
            id="firstname"
            value={firstname}
            onChange={(event) => setFirstname(event.target.value)}
          />
          <label htmlFor="lastname">Last Name</label>
          <input
            type="text"
            id="lastname"
            value={lastname}
            onChange={(event) => setLastname(event.target.value)}
          />
          <label htmlFor="email">E-mail</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          {emailError && (
            <p className={classes.errorMessage}>Email is not valid</p>
          )}
          <label htmlFor="password">Password (must be strong)</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          {passwordError && (
            <p className={classes.errorMessage}>
              Password must be at least 6 characters long
            </p>
          )}
          <label htmlFor="confirmpassword">Confirm Password</label>
          <input
            type="password"
            id="confirmpassword"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
          />
          {confirmPasswordError && (
            <p className={classes.errorMessage}>Passwords do not match</p>
          )}
          <label htmlFor="role">Role</label>
          <select
            id="role"
            value={role}
            onChange={(event) => setRole(event.target.value)}
          >
            <option value="attendee">Attendee</option>
            <option value="organizer">Organizer</option>
          </select>
          {apiError && <p className={classes.errorMessage}>{apiError}</p>}
          <button style={{ padding: "0px" }} type="submit" disabled={loading}>
            {loading ? <Spinner /> : "Sign Up"}
          </button>
          <p>
            Already have an account?
            <Link to={"/"}>
              <span>Log In</span>
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
