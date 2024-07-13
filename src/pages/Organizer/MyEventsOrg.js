import React, { useState, useEffect } from "react";
import axios from "axios";
import Modal from "react-modal";
import { API_ROUTE } from "../../env";
import HomeOrgSide from "../../utils/HomeOrgSide";
import EditEventModal from "./EditEventModal";
import Spinner from "../../utils/Spinner";
import { toast } from "react-toastify";

const modalStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
    maxWidth: "80%", // Adjusted width for responsiveness
    maxHeight: "80%", // Adjusted height for responsiveness
    overflow: "auto", // Enable scrolling when modal content exceeds dimensions
    border: "2px solid #ccc",
    boxShadow: "5px 5px 20px rgba(0,0,0,0.2)",
  },
};

const MyEventsOrg = () => {
  const [events, setEvents] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [eventId, setEventId] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const userData = JSON.parse(localStorage.getItem("user"));

      if (!userData || !userData.token) {
        throw new Error("User not authenticated");
      }

      const response = await axios.get(`${API_ROUTE}/user/events`, {
        headers: {
          Authorization: `Bearer ${userData.token}`,
        },
      });

      const userId = userData._id;
      const userCreatedEvents = response.data.filter(
        (event) => event.organizer === userId
      );

      setEvents(userCreatedEvents);
    } catch (error) {
      console.error("Error fetching events:", error);
      toast.error("Error fetching events");
    } finally {
      setLoading(false);
    }
  };

  const cancelEvent = async (eventId) => {
    try {
      setLoading(true);
      const data = localStorage.getItem("user");
      await axios.delete(`${API_ROUTE}/user/events/${eventId}`, {
        headers: {
          Authorization: `Bearer ${JSON.parse(data).token}`,
        },
      });
      setEvents(events.filter((event) => event._id !== eventId));
      toast.success("Event canceled successfully");
    } catch (error) {
      console.error("Error canceling event:", error);
      toast.error("Error canceling event");
    } finally {
      setLoading(false);
    }
  };

  const editEvent = (eventId) => {
    setEventId(eventId);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    fetchData();
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentEvents = events.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <HomeOrgSide>
      <div className="container mt-4">
        <h1 className="text-secondary text-center">My Events</h1>
        {loading ? (
          <Spinner />
        ) : events.length === 0 ? (
          <h1 className="text-center text-danger mt-5">No Events Yet</h1>
        ) : (
          <ul className="list-group">
            {currentEvents.map((event) => (
              <li key={event._id} className="list-group-item border-light shadow-sm my-2">
                <div className="row align-items-start">
                  <div className="col-md-8">
                    <h2 className="text-secondary">{event.title}</h2>
                    <p>{event.description}</p>
                    <p>Date: {event.date.split("T")[0]}</p>
                    <p>Time: {event.time}</p>
                    <p>Venue: {event.venue}</p>
                    <div className="d-flex">
                      <button
                        onClick={() => cancelEvent(event._id)}
                        className="btn btn-outline-danger me-2"
                      >
                        Delete Event
                      </button>
                      <button
                        onClick={() => editEvent(event._id)}
                        className="btn btn-outline-primary"
                      >
                        Edit Event
                      </button>
                    </div>
                  </div>
                  {event.image && (
                    <div className="col-md-4">
                      <img
                        src={`${API_ROUTE}/api/uploads/${event.image}`}
                        alt="Event"
                        className="img-fluid mb-3 my-4"
                        style={{ height: "200px", objectFit: "cover" ,width: "400px"}}
                      />
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
        {events.length > itemsPerPage && (
          <nav>
            <ul className="pagination justify-content-center mt-3">
              {Array.from(
                { length: Math.ceil(events.length / itemsPerPage) },
                (_, i) => (
                  <li
                    key={i + 1}
                    className={`page-item ${
                      currentPage === i + 1 ? "active" : ""
                    }`}
                  >
                    <button
                      onClick={() => paginate(i + 1)}
                      className="page-link"
                    >
                      {i + 1}
                    </button>
                  </li>
                )
              )}
            </ul>
          </nav>
        )}
      </div>
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        style={modalStyles}
        contentLabel="Edit Event Modal"
      >
        <EditEventModal eventId={eventId} />
        <button
          onClick={closeModal}
          className="btn btn-outline-danger mt-3"
        >
          Close
        </button>
      </Modal>
    </HomeOrgSide>
  );
};

export default MyEventsOrg;
