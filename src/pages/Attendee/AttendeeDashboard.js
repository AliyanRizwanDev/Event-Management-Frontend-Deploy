import React, { useEffect, useState } from "react";
import axios from "axios";
import Home from "../../utils/Home";
import { API_ROUTE } from "../../env";
import { toast } from "react-toastify";
import Spinner from "../../utils/Spinner";

const AttendeeDashboard = () => {
  const data = JSON.parse(localStorage.getItem("user"));

  const [notifications, setNotifications] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [users, setUsers] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [loadingNotifications, setLoadingNotifications] = useState(true);

  useEffect(() => {
    const fetchUsersAndEvents = async () => {
      try {
        const [eventsResponse, usersResponse, notificationsResponse] =
          await Promise.all([
            axios.get(`${API_ROUTE}/user/events`, {
              headers: {
                Authorization: `Bearer ${data.token}`,
              },
            }),
            axios.get(`${API_ROUTE}/user/profile/`, {
              headers: {
                Authorization: `Bearer ${data.token}`,
              },
            }),
            axios.get(`${API_ROUTE}/user/notifications`, {
              headers: {
                Authorization: `Bearer ${data.token}`,
              },
            }),
          ]);

        setUpcomingEvents(eventsResponse.data);
        setUsers(usersResponse.data);
        setNotifications(notificationsResponse.data);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load data");
      } finally {
        setLoadingEvents(false);
        setLoadingNotifications(false);
      }
    };

    fetchUsersAndEvents();
  }, [data.token]);

  const filteredEvents = upcomingEvents.filter((event) => {
    return users.some((user) => user._id === event.organizer);
  });

  const filteredNotifications = notifications.filter((notif) => {
    return users.some((user) => user._id === notif.userId);
  });

  return (
    <Home>
      <div className="container mt-4">
        <h1 className="text-center text-secondary mb-5">Dashboard</h1>

        <div className="row">
          <div className="col-md-6">
            <div className="card mb-4">
              <div className="card-header">
                <h2 className="card-title">Upcoming Events</h2>
              </div>
              <div className="card-body">
                {loadingEvents ? (
                  <Spinner />
                ) : filteredEvents.length > 0 ? (
                  <ul className="list-group list-group-flush">
                    {filteredEvents.slice(0, 5).map((event) => (
                      <li key={event._id} className="list-group-item">
                        {event.title} -{" "}
                        {new Date(event.date).toLocaleDateString()}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No events</p>
                )}
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="card mb-4">
              <div className="card-header">
                <h2 className="card-title">Notifications</h2>
              </div>
              <div className="card-body">
                {loadingNotifications ? (
                  <Spinner />
                ) : filteredNotifications.length > 0 ? (
                  <ul className="list-group list-group-flush">
                    {filteredNotifications.slice(0, 5).map((notif) => (
                      <li key={notif._id} className="list-group-item">
                        {notif.message}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No notifications</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Home>
  );
};

export default AttendeeDashboard;
