import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_ROUTE } from "../../env";
import { toast } from "react-toastify";
import Spinner from "../../utils/Spinner";

export default function EditEventModal({ eventId }) {
  const [error, setError] = useState(null);
  const [event, setEvent] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [venue, setVenue] = useState("");
  const [ticketTypes, setTicketTypes] = useState([
    { type: "", price: "", quantity: "" },
  ]);
  const [discountCodes, setDiscountCodes] = useState([
    { code: "", discountPercentage: "", expiryDate: "" },
  ]);
  const [loading, setLoading] = useState(false);
  const data = localStorage.getItem("user");

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${API_ROUTE}/user/events/${eventId}`,
          {
            headers: {
              Authorization: `Bearer ${JSON.parse(data).token}`,
            },
          }
        );
        const eventData = response.data;
        setEvent(eventData);
        setTitle(eventData.title);
        setDescription(eventData.description);
        setDate(eventData.date.split("T")[0]);
        setTime(eventData.time);
        setVenue(eventData.venue);
        setTicketTypes(eventData.ticketTypes);
        setDiscountCodes(eventData.discountCodes || []);
      } catch (error) {
        console.error("Error fetching event:", error);
        toast.error("Error fetching event");
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId, data]);

  const getCurrentDate = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const handleTicketChange = (index, field, value) => {
    const newTicketTypes = [...ticketTypes];
    newTicketTypes[index][field] = value;
    setTicketTypes(newTicketTypes);
  };

  const addTicketType = () => {
    setTicketTypes([...ticketTypes, { type: "", price: "", quantity: "" }]);
  };

  const handleTicketRemove = (index) => {
    const newTicketTypes = [...ticketTypes];
    newTicketTypes.splice(index, 1);
    setTicketTypes(newTicketTypes);
  };

  const handleDiscountChange = (index, field, value) => {
    const newDiscountCodes = [...discountCodes];
    newDiscountCodes[index][field] = value;
    setDiscountCodes(newDiscountCodes);
  };

  const addDiscountCode = () => {
    setDiscountCodes([
      ...discountCodes,
      { code: "", discountPercentage: "", expiryDate: "" },
    ]);
  };

  const handleDiscountRemove = (index) => {
    const newDiscountCodes = [...discountCodes];
    newDiscountCodes.splice(index, 1);
    setDiscountCodes(newDiscountCodes);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !title ||
      !description ||
      !date ||
      !time ||
      !venue ||
      !ticketTypes.every(
        (ticket) => ticket.type && ticket.price && ticket.quantity
      ) ||
      !discountCodes.every(
        (discount) =>
          discount.code && discount.discountPercentage && discount.expiryDate
      )
    ) {
      toast.error("Please fill in all required fields.");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("date", date);
    formData.append("time", time);
    formData.append("venue", venue);
    formData.append("ticketTypes", JSON.stringify(ticketTypes));
    formData.append("discountCodes", JSON.stringify(discountCodes));
    formData.append("organizer", JSON.parse(data)._id);
    if (document.getElementById("inputGroupFile02").files[0]) {
      formData.append(
        "image",
        document.getElementById("inputGroupFile02").files[0]
      );
    }

    try {
      setLoading(true);
      const response = await axios.put(
        `${API_ROUTE}/user/events/${eventId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${JSON.parse(data).token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      toast.success("Event updated successfully");
    } catch (error) {
      console.error("Error updating event:", error);
      toast.error("Error updating event");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="container mt-5">
      <h1 className="text-center text-secondary mb-4">Edit Event</h1>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group mb-3">
          <label htmlFor="title">Event Title:</label>
          <input
            type="text"
            id="title"
            className="form-control"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div className="form-group mb-3">
          <label htmlFor="description">Event Description:</label>
          <textarea
            id="description"
            className="form-control"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>
        <div className="form-group mb-3">
          <label htmlFor="date">Event Date:</label>
          <input
            type="date"
            id="date"
            className="form-control"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            min={getCurrentDate()}
            required
          />
        </div>
        <div className="form-group mb-3">
          <label htmlFor="time">Event Time:</label>
          <input
            type="time"
            id="time"
            className="form-control"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            required
          />
        </div>
        <div className="form-group mb-3">
          <label htmlFor="venue">Event Venue:</label>
          <input
            type="text"
            id="venue"
            className="form-control"
            value={venue}
            onChange={(e) => setVenue(e.target.value)}
            required
          />
        </div>
        <div className="input-group mb-3">
          <input type="file" className="form-control" id="inputGroupFile02" />
          <label className="input-group-text" htmlFor="inputGroupFile02">
            Upload Event Image
          </label>
        </div>
        <div className="mt-4">
          <h2 className="text-secondary">Ticket Types</h2>
          {ticketTypes.map((ticket, index) => (
            <div key={index} className="border p-3 mb-3 rounded">
              <div className="form-group mb-2">
                <label htmlFor={`ticketType-${index}`}>Type:</label>
                <input
                  type="text"
                  id={`ticketType-${index}`}
                  className="form-control"
                  value={ticket.type}
                  onChange={(e) =>
                    handleTicketChange(index, "type", e.target.value)
                  }
                  required
                />
              </div>
              <div className="form-group mb-2">
                <label htmlFor={`ticketPrice-${index}`}>Price:</label>
                <input
                  type="number"
                  id={`ticketPrice-${index}`}
                  className="form-control"
                  value={ticket.price}
                  onChange={(e) =>
                    handleTicketChange(index, "price", e.target.value)
                  }
                  required
                />
              </div>
              <div className="form-group mb-2">
                <label htmlFor={`ticketQuantity-${index}`}>Quantity:</label>
                <input
                  type="number"
                  id={`ticketQuantity-${index}`}
                  className="form-control"
                  value={ticket.quantity}
                  onChange={(e) =>
                    handleTicketChange(index, "quantity", e.target.value)
                  }
                  required
                />
              </div>
              {index > 0 && (
                <button
                  type="button"
                  className="btn btn-outline-danger my-2"
                  onClick={() => handleTicketRemove(index)}
                >
                  Remove Ticket Type
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            className="btn btn-outline-primary mb-4"
            onClick={addTicketType}
          >
            Add Ticket Type
          </button>
        </div>
        <div className="mt-4">
          <h2 className="text-danger">Discount Codes</h2>
          {discountCodes.map((discount, index) => (
            <div key={index} className="border p-3 mb-3 rounded">
              <div className="form-group mb-2">
                <label htmlFor={`discountCode-${index}`}>Code:</label>
                <input
                  type="text"
                  id={`discountCode-${index}`}
                  className="form-control"
                  value={discount.code}
                  onChange={(e) =>
                    handleDiscountChange(index, "code", e.target.value)
                  }
                  required
                />
              </div>
              <div className="form-group mb-2">
                <label htmlFor={`discountPercentage-${index}`}>
                  Discount Percentage:
                </label>
                <input
                  type="number"
                  id={`discountPercentage-${index}`}
                  className="form-control"
                  value={discount.discountPercentage}
                  onChange={(e) =>
                    handleDiscountChange(
                      index,
                      "discountPercentage",
                      e.target.value
                    )
                  }
                  required
                  min={0}
                  max={100}
                />
              </div>
              <div className="form-group mb-2">
                <label htmlFor={`discountExpiryDate-${index}`}>
                  Discount Expiry Date:
                </label>
                <input
                  type="date"
                  id={`discountExpiryDate-${index}`}
                  className="form-control"
                  value={discount.expiryDate.split("T")[0]}
                  onChange={(e) =>
                    handleDiscountChange(index, "expiryDate", e.target.value)
                  }
                  min={getCurrentDate()}
                  required
                />
              </div>
              {index > 0 && (
                <button
                  type="button"
                  className="btn btn-outline-danger my-2"
                  onClick={() => handleDiscountRemove(index)}
                >
                  Remove Discount Code
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            className="btn btn-outline-primary"
            onClick={addDiscountCode}
          >
            Add Discount Code
          </button>
        </div>
        <button type="submit" className="btn btn-danger mt-4">
          Update Event
        </button>
      </form>
    </div>
  );
}
