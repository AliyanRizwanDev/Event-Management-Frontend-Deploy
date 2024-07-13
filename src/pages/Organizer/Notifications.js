
import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_ROUTE } from "../../env";
import { toast } from "react-toastify";
import HomeOrgSide from "../../utils/HomeOrgSide";
import Spinner from "../../utils/Spinner";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const [newNotification, setNewNotification] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  const data = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    fetchData();
  }, [refresh]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_ROUTE}/user/notifications/${data._id}`,
        {
          headers: {
            Authorization: `Bearer ${data.token}`,
          },
        }
      );
      setNotifications(response.data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      toast.error("Error fetching notifications");
    } finally {
      setLoading(false);
    }
  };

  const cancelNotification = async (id) => {
    try {
      setLoading(true);
      await axios.delete(`${API_ROUTE}/user/notifications/cancel/${id}`, {
        headers: {
          Authorization: `Bearer ${data.token}`,
        },
      });
      setRefresh(!refresh);
      toast.success("Notification deleted successfully");
    } catch (error) {
      console.error("Error deleting notification:", error);
      toast.error("Error deleting notification");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await axios.post(
        `${API_ROUTE}/user/notifications`,
        {
          userId: data._id,
          message: newNotification,
          email: data.email,
        },
        {
          headers: {
            Authorization: `Bearer ${data.token}`,
          },
        }
      );
      setNewNotification("");
      toast.success("Notification created successfully");
      setRefresh(!refresh);
    } catch (error) {
      console.error("Error creating notification:", error);
      toast.error("Error creating notification");
    } finally {
      setLoading(false);
    }
  };
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentNotifications = notifications.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <HomeOrgSide>
      <div className="container">
        <h1 className="text-secondary">Notifications</h1>
        <form onSubmit={handleSubmit}>
          <label htmlFor="newNotification">New Notification:</label>
          <input
            type="text"
            id="newNotification"
            value={newNotification}
            onChange={(e) => setNewNotification(e.target.value)}
            className="form-control mb-2"
            required
          />
          <button type="submit" className="btn btn-outline-danger mb-2">
            Create Notification
          </button>
        </form>
        {loading ? (
          <Spinner />
        ) : notifications.length === 0 ? (
          <h1 className="text-center text-danger mt-5">
            No notifications found
          </h1>
        ) : (
          <>
            <ul className="list-group">
              {currentNotifications.map((notification) => (
                <li
                  key={notification._id}
                  className="list-group-item border my-1"
                >
                  <p className="text-dark">{notification.message}</p>
                  <button
                    onClick={() => cancelNotification(notification._id)}
                    className="btn btn-danger"
                  >
                    Cancel
                  </button>
                </li>
              ))}
            </ul>
            <nav className="mt-3">
              <ul className="pagination justify-content-center">
                {Array.from(
                  { length: Math.ceil(notifications.length / itemsPerPage) },
                  (_, i) => (
                    <li
                      key={i + 1}
                      className={`page-item ${
                        currentPage === i + 1 ? "active" : ""
                      }`}
                    >
                      <button
                        onClick={() => paginate(i + 1)}
                        className="page-link "
                      >
                        {i + 1}
                      </button>
                    </li>
                  )
                )}
              </ul>
            </nav>
          </>
        )}
      </div>
    </HomeOrgSide>
  );
}
