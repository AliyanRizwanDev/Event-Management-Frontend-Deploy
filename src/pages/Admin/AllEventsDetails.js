import React, { useEffect, useState } from "react";
import HomeOrgSide from "../../utils/HomeAdminSide";
import axios from "axios";
import { toast } from "react-toastify";
import Spinner from "../../utils/Spinner";
import { API_ROUTE } from "../../env";

const AllEventsDetails = () => {
  const [events, setEvents] = useState([]);
  const [attendeesMap, setAttendeesMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentEvents, setCurrentEvents] = useState([]);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        const data = localStorage.getItem("user");
        if (!data) {
          setError("User not found. Please log in.");
          setLoading(false);
          return;
        }
        const user = JSON.parse(data);

        const response = await axios.get(`${API_ROUTE}/user/events/`, {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });

        const eventsData = response.data;
        const attendeesMap = {};

        await Promise.all(
          eventsData.map(async (event) => {
            const attendees = await Promise.all(
              event.attendees.map(async (attendeeId) => {
                try {
                  const attendeeResponse = await axios.get(
                    `${API_ROUTE}/user/profile/${attendeeId}`,
                    {
                      headers: {
                        Authorization: `Bearer ${user.token}`,
                      },
                    }
                  );
                  return attendeeResponse.data.userProfile;
                } catch (error) {
                  console.warn(`Skipping deleted or invalid attendee ID: ${attendeeId}`);
                  return null;
                }
              })
            );
            attendeesMap[event._id] = attendees.filter(Boolean);
          })
        );

        setAttendeesMap(attendeesMap);
        setEvents(eventsData);
      } catch (error) {
        setError("Error fetching event data");
        toast.error("Error fetching event data");
        console.error("Error fetching event data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEventData();
  }, []);

  useEffect(() => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    setCurrentEvents(events.slice(indexOfFirstItem, indexOfLastItem));
  }, [currentPage, events]);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const renderPagination = () => {
    const pageNumbers = [];
    for (let i = 1; i <= Math.ceil(events.length / itemsPerPage); i++) {
      pageNumbers.push(i);
    }
    return (
      <nav>
        <ul className="pagination justify-content-center">
          {pageNumbers.map((number) => (
            <li
              key={number}
              className={`page-item ${currentPage === number ? "active" : ""}`}
            >
              <button className="page-link" onClick={() => paginate(number)}>
                {number}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    );
  };

  return (
    <HomeOrgSide>
      <div className="container mt-4">
        <h1 className="text-center text-secondary">Event Analytics</h1>
        {loading ? (
          <Spinner />
        ) : error ? (
          <h1 className="text-center text-danger mt-5">{error}</h1>

        ) : (
          currentEvents.map((event) => (
            <div key={event._id} className="card mb-4 border-light shadow-sm">
              <div className="card-header bg-light text-dark">
                <h2>{event.title}</h2>
              </div>
              <div className="card-body">
                <section className="mb-3">
                  <h3 className="text-secondary">Ticket Sales</h3>
                  {event.ticketTypes.map((ticket) => (
                    <div key={ticket._id} className="mb-2">
                      <p>
                        <strong>Type:</strong> {ticket.type}
                      </p>
                      <p>
                        <strong>Price:</strong> ${ticket.price}
                      </p>
                      <p>
                        <strong>Total:</strong> {ticket.quantity}
                      </p>
                      <p>
                        <strong>Sold:</strong> {ticket.remaining || 0}
                      </p>
                    </div>
                  ))}
                </section>

                <section className="mb-3">
                  <h3 className="text-secondary">Attendees</h3>
                  <ul className="list-group">
                    {attendeesMap[event._id] && attendeesMap[event._id].length > 0 ? (
                      attendeesMap[event._id].map((attendee) => (
                        <li key={attendee._id} className="list-group-item border">
                          {attendee.firstName} {attendee.lastName} ({attendee.email})
                        </li>
                      ))
                    ) : (
                      <li className="list-group-item">No attendees</li>
                    )}
                  </ul>
                </section>
              </div>
            </div>
          ))
        )}
        {renderPagination()}
      </div>
    </HomeOrgSide>
  );
};

export default AllEventsDetails;
