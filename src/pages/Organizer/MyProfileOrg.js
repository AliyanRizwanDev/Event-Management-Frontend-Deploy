import React, { useEffect, useState } from "react";
import HomeOrgSide from "../../utils/HomeOrgSide";
import axios from "axios";
import { toast } from "react-toastify";
import Spinner from "../../utils/Spinner";
import { API_ROUTE } from "../../env";

const MyProfileOrg = () => {
  const data = JSON.parse(localStorage.getItem("user"));
  const [profile, setProfile] = useState({
    firstname: "",
    lastname: "",
    email: "",
    phone: "",
    password: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`${API_ROUTE}/user/profile/${data._id}`, {
        headers: {
          Authorization: `Bearer ${data.token}`,
        },
      })
      .then((response) => {
        const { firstName, lastName, email, phone } = response.data.userProfile;
        setProfile((prevProfile) => ({
          ...prevProfile,
          firstname: firstName,
          lastname: lastName,
          email: email,
          phone: phone,
        }));
        setLoading(false);
      })
      .catch((error) => {
        setError("Error fetching profile data.");
        console.error(error);
        setLoading(false);
      });
  }, [data._id, data.token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile({
      ...profile,
      [name]: value,
    });
  };

  const handleSave = async () => {
    try {
      await axios.put(
        `${API_ROUTE}/user/profile/${data._id}`,
        {
          firstName: profile.firstname,
          lastName: profile.lastname,
          email: profile.email,
        },
        {
          headers: {
            Authorization: `Bearer ${data.token}`,
          },
        }
      );
      toast.success("Profile Updated");
    } catch (error) {
      toast.error("Error updating profile");
      console.error(error);
    }
  };

  const handlePassword = async () => {
    if (profile.newPassword !== profile.confirmPassword) {
      setPasswordError("New password and confirm password do not match.");
      return;
    }

    try {
      await axios.put(
        `${API_ROUTE}/user/profile/password/${data._id}`,
        {
          password: profile.password,
          newPassword: profile.newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${data.token}`,
          },
        }
      );
      toast.success("Password updated successfully");
      setPasswordError("");
    } catch (error) {
      setPasswordError("Error updating password.");
      console.error(error);
    }
  };

  return (
    <HomeOrgSide>
      <div className="container mt-2">
        <h1 className="text-center text-secondary">My Profile</h1>

        {loading ? (
          <Spinner />
        ) : (
          <>
            <div className="profile-section mb-4">
              <h2 className="my-3">Profile Information</h2>
              <div className=" my-2 form-group">
                <label>First Name:</label>
                <input
                  type="text"
                  name="firstname"
                  className="form-control"
                  value={profile.firstname}
                  onChange={handleChange}
                />
              </div>
              <div className="my-2 form-group">
                <label>Last Name:</label>
                <input
                  type="text"
                  name="lastname"
                  className="form-control"
                  value={profile.lastname}
                  onChange={handleChange}
                />
              </div>
              <div className="my-2 form-group">
                <label>Email:</label>
                <input
                  type="email"
                  name="email"
                  className="form-control"
                  value={profile.email}
                  onChange={handleChange}
                />
              </div>
              {error && <p className="text-danger">{error}</p>}
              <button className="btn btn-outline-danger my-3" onClick={handleSave}>
                Save Changes
              </button>
            </div>

            <div className="profile-section mb-4">
              <h2 className="my-3">Account Settings</h2>
              <div className="my-2 form-group">
                <label>Current Password:</label>
                <input
                  type="password"
                  name="password"
                  className="form-control"
                  onChange={handleChange}
                />
              </div>
              <div className="my-2 form-group">
                <label>New Password:</label>
                <input
                  type="password"
                  name="newPassword"
                  className="form-control"
                  onChange={handleChange}
                />
              </div>
              <div className="my-2 form-group">
                <label>Confirm New Password:</label>
                <input
                  type="password"
                  name="confirmPassword"
                  className="form-control"
                  onChange={handleChange}
                />
              </div>
              {passwordError && <p className="text-danger">{passwordError}</p>}
              <button className="btn btn-outline-danger my-3" onClick={handlePassword}>
                Change Password
              </button>
            </div>
          </>
        )}
      </div>
    </HomeOrgSide>
  );
};

export default MyProfileOrg;
