import React, { useRef } from "react";
import { jsPDF } from "jspdf";
import styles from "./MyTicket.module.css";
import html2canvas from "html2canvas";
import { toast } from "react-toastify";

const MyTicket = ({ event }) => {
  const ticketRef = useRef(null);

  const handleDownload = () => {
    const input = ticketRef.current;

    if (!input) {
      toast.error("Ticket content not found.");
      return;
    }

    html2canvas(input, { scale: 2 })
      .then((canvas) => {
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF({
          orientation: "landscape",
          unit: "px",
          format: [canvas.width, canvas.height],
        });
        pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
        pdf.save(`${event.title}_Ticket.pdf`);
      })
      .catch((error) => {
        console.error("Error generating PDF: ", error);
        toast.error("Oops! Something went wrong while generating the PDF.");
      });
  };

  return (
    <div>
      <div ref={ticketRef} className={styles.ticketContainer}>
        <h2 className={styles.title}>Ticket for {event.title}</h2>
        <div className={styles.details}>
          <p>
            <span className={styles.label}>Event ID:</span> {event._id}
          </p>
          <p>
            <span className={styles.label}>Date:</span> {event.date.split("T")[0]}
          </p>
          <p>
            <span className={styles.label}>Time:</span> {event.time}
          </p>
          <p>
            <span className={styles.label}>Venue:</span> {event.venue}
          </p>
        </div>
      </div>
      <button onClick={handleDownload} className={styles.downloadButton}>
        Download Ticket as PDF
      </button>
    </div>
  );
};

export default MyTicket;
