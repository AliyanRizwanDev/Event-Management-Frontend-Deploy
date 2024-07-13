import React, { useEffect, useState } from "react";
import HomeOrgSide from "../../utils/HomeOrgSide";
import axios from "axios";
import { toast } from "react-toastify";
import Spinner from "../../utils/Spinner";
import { API_ROUTE } from "../../env";
import jsPDF from "jspdf";
import "jspdf-autotable";

const getAllEvents = async (token) => {
  try {
    const response = await axios.get(`${API_ROUTE}/user/events/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const userId = JSON.parse(localStorage.getItem("user"))._id;
    const userCreatedEvents = response.data.filter(
      (event) => event.organizer === userId
    );

    return userCreatedEvents;
  } catch (error) {
    console.error("Error fetching events:", error);
    throw error;
  }
};

const getAttendeeDetails = async (attendeeId, token) => {
  try {
    const response = await axios.get(
      `${API_ROUTE}/user/profile/${attendeeId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data.userProfile;
  } catch (error) {
    return null;
  }
};

const isEventClosed = (eventDate) => {
  const currentDate = new Date();
  const eventDateObj = new Date(eventDate);
  return eventDateObj < currentDate;
};

const calculateAverageRating = (feedback) => {
  if (feedback.length === 0) return 0;

  const totalRatings = feedback.reduce((sum, { rating }) => sum + rating, 0);
  return totalRatings / feedback.length;
};

const generateReport = (events, attendeesMap) => {
  const doc = new jsPDF();
  const tableColumn = ["Event Title", "Date", "Average Rating", "Tickets Sold"];
  const tableRows = [];

  events.forEach((event) => {
    const eventData = [
      event.title,
      new Date(event.date).toLocaleDateString(),
      event.avgRating.toFixed(1),
      event.ticketTypes.reduce((acc, type) => acc + (type.remaining || 0), 0),
    ];
    tableRows.push(eventData);
  });

  doc.autoTable({
    head: [tableColumn],
    body: tableRows,
  });

  events.forEach((event) => {
    doc.addPage();
    doc.text(`Event: ${event.title}`, 14, 20);
    doc.text(`Date: ${new Date(event.date).toLocaleDateString()}`, 14, 30);
    doc.text(`Average Rating: ${event.avgRating.toFixed(1)}`, 14, 40);

    const ticketColumn = ["Type", "Price", "Tickets Remaining", "Sold"];
    const ticketRows = event.ticketTypes.map((ticket) => [
      ticket.type,
      `$${ticket.price}`,
      ticket.quantity,
      ticket.remaining || 0,
    ]);
    doc.text("Ticket Sales", 14, 50);
    doc.autoTable({
      startY: 55,
      head: [ticketColumn],
      body: ticketRows,
    });

    const attendees = attendeesMap[event._id] || [];
    const attendeeColumn = ["First Name", "Last Name", "Email"];
    const attendeeRows = attendees.map((attendee) => [
      attendee.firstName,
      attendee.lastName,
      attendee.email,
    ]);
    doc.text("Attendees", 14, doc.autoTable.previous.finalY + 10);
    doc.autoTable({
      startY: doc.autoTable.previous.finalY + 15,
      head: [attendeeColumn],
      body: attendeeRows,
    });

    const feedbackColumn = ["Rating", "Comment"];
    const feedbackRows = event.feedback.map((feedback) => [
      feedback.rating,
      feedback.comment,
    ]);
    doc.text("Feedback", 14, doc.autoTable.previous.finalY + 10);
    doc.autoTable({
      startY: doc.autoTable.previous.finalY + 15,
      head: [feedbackColumn],
      body: feedbackRows,
    });
  });

  doc.save("event_analytics_report.pdf");
};

export default function Analytics() {
  const [events, setEvents] = useState([]);
  const [attendeesMap, setAttendeesMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [fix, setFix] = useState(false);

  useEffect(() => {
    const fetchEventData = async () => {
      const data = localStorage.getItem("user");
      if (!data) {
        setError("User not found. Please log in.");
        setLoading(false);
        return;
      }
      const user = JSON.parse(data);

      try {
        const eventsData = await getAllEvents(user.token);

        const attendeesMap = {};
        const eventPromises = eventsData.map(async (event) => {
          const attendees = await Promise.all(
            event.attendees.map((attendee) =>
              getAttendeeDetails(attendee, user.token)
            )
          );
          attendeesMap[event._id] = attendees.filter(
            (attendee) => attendee !== null
          );
          event.avgRating = calculateAverageRating(event.feedback);
          return event;
        });

        const resolvedEvents = await Promise.all(eventPromises);

        setEvents(resolvedEvents);
        setAttendeesMap(attendeesMap);
      } catch (error) {
        setError("Error fetching event data");
        toast.error("Error fetching event data");
        console.error("Error fetching event data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEventData();
    setFix(true);
  }, [fix]);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

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

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentEvents = events.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <HomeOrgSide>
      <div className="container mt-4">
        <h1 className="text-center text-secondary">Event Analytics</h1>
        <button
          className="btn btn-outline-danger mb-4"
          onClick={() => generateReport(events, attendeesMap)}
        >
          Download Report
        </button>
        {loading ? (
          <Spinner />
        ) : error ? (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        ) : currentEvents.length !== 0 ? (
          currentEvents.map((event) => (
            <div key={event._id} className="card mb-4 border-light shadow-sm">
              <div className="card-header bg-light text-dark">
                <h2>{event.title}</h2>
                {isEventClosed(event.date) && (
                  <span className="badge bg-secondary ms-2">Event Closed</span>
                )}
              </div>
              <div className="card-body">
                <section className="mb-3">
                  <h4 className="text-secondary">Ticket Sales</h4>
                  {event.ticketTypes.map((ticket) => (
                    <div key={ticket._id} className="mb-2">
                      <p>
                        <strong>Type:</strong> {ticket.type}
                      </p>
                      <p>
                        <strong>Price:</strong> ${ticket.price}
                      </p>
                      <p>
                        <strong>Tickets Remaining:</strong> {ticket.quantity}
                      </p>
                      <p>
                        <strong>Sold:</strong> {ticket.remaining || 0}
                      </p>
                      <hr />
                    </div>
                  ))}
                </section>

                <section className="mb-3">
                  <h4 className="text-secondary">Attendees</h4>
                  <ul className="list-group">
                    {attendeesMap[event._id] &&
                    attendeesMap[event._id].length > 0 ? (
                      attendeesMap[event._id].map((attendee) => (
                        <li
                          key={attendee._id}
                          className="list-group-item border-0"
                        >
                          {attendee.firstName} {attendee.lastName} (
                          {attendee.email})
                        </li>
                      ))
                    ) : (
                      <li className="list-group-item border-0">No attendees</li>
                    )}
                  </ul>
                </section>

                <section className="mb-3">
                  <h4 className="text-secondary">Feedback</h4>
                  {event.avgRating !== undefined ? ( 
                    <div>
                      <p>
                        <strong>Average Rating:</strong> {event.avgRating.toFixed(1)}
                      </p>
                      <ul>
                        {event.feedback.map((feedbackItem) => (
                          <li key={feedbackItem._id}>
                            <p><strong>Rating:</strong> {feedbackItem.rating}</p>
                            <p><strong>Comment:</strong> {feedbackItem.comment}</p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <p>No feedback available</p>
                  )}
                </section>
              </div>
            </div>
          ))
        ) : (
          
          <h1 className="text-center text-danger mt-5">No Events Yet</h1>

        )}
        {renderPagination()}
      </div>
    </HomeOrgSide>
  );
}
