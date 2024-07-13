import React, { useEffect, useState } from "react";
import Home from "../../utils/Home";
import axios from "axios";
import { API_ROUTE } from "../../env";
import Modal from "react-modal";
import { toast } from "react-toastify";
import Spinner from "../../utils/Spinner";
import MyTicket from "../../utils/MyTicket";
import classes from "./MyEvents.module.css";

Modal.setAppElement("#root");

const MyEvents = () => {
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [feedback, setFeedback] = useState({ rating: 1, comment: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewingTicket, setViewingTicket] = useState(false);
  const userData = JSON.parse(localStorage.getItem("user"));
  const userId = userData._id;
  useEffect(() => {
    axios
      .get(`${API_ROUTE}/user/events/`, {
        headers: {
          Authorization: `Bearer ${userData.token}`,
        },
      })
      .then((response) => {
        const filteredEvents = response.data.filter((event) =>
          event.attendees.some((attendee) => attendee === userId)
        );
        setRegisteredEvents(filteredEvents);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setError("Failed to load events");
        setLoading(false);
      });
  }, [userId, userData.token]);

  const handleFeedbackSubmit = async () => {
    try {
      await axios.post(
        `${API_ROUTE}/user/events/${selectedEvent}/feedback`,
        {
          attendee: userId,
          rating: feedback.rating,
          comment: feedback.comment,
        },
        {
          headers: {
            Authorization: `Bearer ${userData.token}`,
          },
        }
      );

      toast.success("Feedback submitted successfully");
      setSelectedEvent(null);

      setRegisteredEvents((prevEvents) =>
        prevEvents.map((event) =>
          event._id === selectedEvent
            ? { ...event, feedback: [...event.feedback, { attendee: userId }] }
            : event
        )
      );
    } catch (error) {
      toast.error("Error submitting feedback");
      console.error(error);
    }
  };

  const dateOptions = { year: "numeric", month: "long", day: "numeric" };

  const isEventExpired = (eventDate, eventTime) => {
    const [hours, minutes] = eventTime.split(":").map(Number);
    const eventDateTime = new Date(eventDate);
    eventDateTime.setHours(hours);
    eventDateTime.setMinutes(minutes);
    return eventDateTime < new Date();
  };

  const hasUserSubmittedFeedback = (event) => {
    return event.feedback.some((fb) => fb.attendee === userId);
  };

  return (
    <Home>
      <div className="container mt-4">
        <h1 className="text-center text-secondary">My Events</h1>
        {loading ? (
          <Spinner />
        ) : error ? (
          <p className="text-danger text-center">{error}</p>
        ) : registeredEvents.length > 0 ? (
          <ul className="list-group">
            {registeredEvents.map((event) => (
              <li key={event._id} className="list-group-item mb-2 border">
                <div>
                  <h2 className="text-danger">{event.title}</h2>
                  <p>
                    {new Date(event.date).toLocaleDateString(
                      "en-US",
                      dateOptions
                    )}{" "}
                    at {event.time}
                  </p>
                  <p>Venue: {event.venue}</p>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => {
                      setSelectedEvent(event);
                      setViewingTicket(true);
                    }}
                  >
                    View Ticket
                  </button>
                  {isEventExpired(event.date, event.time) && (
                    <button
                      className="btn btn-outline-danger btn-sm mx-2"
                      onClick={() => {
                        setSelectedEvent(event._id);
                        setViewingTicket(false);
                      }}
                      disabled={hasUserSubmittedFeedback(event)}
                    >
                      {hasUserSubmittedFeedback(event)
                        ? "Feedback Submitted"
                        : "Give Feedback"}
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <h1 className="text-center text-danger mt-5">No events booked!!!</h1>
        )}

        {selectedEvent && (
          <Modal
            isOpen={!!selectedEvent}
            onRequestClose={() => setSelectedEvent(null)}
            contentLabel="Modal"
            className={classes.modal}
            overlayClassName={classes.overlay}
          >
            {viewingTicket ? (
              <MyTicket event={selectedEvent} />
            ) : (
              <>
                <h2 className="text-danger">Submit Feedback</h2>
                <div className="mt-4">
                  <label className="d-block">
                    Rating:
                    <select
                      className="form-control mt-1"
                      value={feedback.rating}
                      onChange={(e) =>
                        setFeedback({ ...feedback, rating: e.target.value })
                      }
                    >
                      {[1, 2, 3, 4, 5].map((value) => (
                        <option key={value} value={value}>
                          {value}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="d-block mt-3">
                    Comment:
                    <textarea
                      className="form-control mt-1"
                      value={feedback.comment}
                      onChange={(e) =>
                        setFeedback({ ...feedback, comment: e.target.value })
                      }
                    />
                  </label>
                  <div className="mt-3">
                    <button
                      className="btn btn-danger mr-2"
                      onClick={handleFeedbackSubmit}
                    >
                      Submit
                    </button>
                    <button
                      className="btn btn-secondary mx-2"
                      onClick={() => setSelectedEvent(null)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </>
            )}
          </Modal>
        )}
      </div>
    </Home>
  );
};

export default MyEvents;
