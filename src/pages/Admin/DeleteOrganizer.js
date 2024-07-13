import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_ROUTE } from "../../env";
import { toast } from "react-toastify";
import HomeAdminSide from "../../utils/HomeAdminSide";
import Spinner from "../../utils/Spinner";

export default function DeleteOrganizer() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  useEffect(() => {
    fetchUsers();
  }, [refresh]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_ROUTE}/user/profile`, {
        headers: {
          Authorization: `Bearer ${
            JSON.parse(localStorage.getItem("user")).token
          }`,
        },
      });
      const organizers = response.data.filter(
        (user) => user.role === "organizer"
      );
      setUsers(organizers);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Error fetching users");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId) => {
    try {
      setLoading(true);
      await axios.delete(`${API_ROUTE}/user/profile/${userId}`, {
        headers: {
          Authorization: `Bearer ${
            JSON.parse(localStorage.getItem("user")).token
          }`,
        },
      });
      setRefresh(!refresh);
      toast.success("Organizer deleted successfully");
    } catch (error) {
      console.error("Error deleting organizer:", error);
      toast.error("Error deleting organizer");
    } finally {
      setLoading(false);
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = users.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <HomeAdminSide>
      <div className="container mt-4 ">
        <h1 className="text-secondary">Delete Organizer</h1>
        {loading ? (
          <Spinner />
        ) : (
          <div>
            {users.length === 0 ? (
              <p className="text-center">No organizers found</p>
            ) : (
              <div>
                <ul className="list-group ">
                  {currentUsers.map((user) => (
                    <li key={user._id} className="list-group-item border my-2">
                      <h4>
                        {user.firstName} {user.lastName} ({user.email})
                      </h4>
                      <button
                        onClick={() => handleDelete(user._id)}
                        className="btn btn-outline-danger"
                      >
                        Delete
                      </button>
                    </li>
                  ))}
                </ul>
                {users.length > itemsPerPage && (
                  <ul className="pagination justify-content-center mt-3">
                    {Array.from({ length: Math.ceil(users.length / itemsPerPage) }, (_, i) => (
                      <li key={i + 1} className={`page-item ${currentPage === i + 1 ? "active" : ""}`}>
                        <button onClick={() => paginate(i + 1)} className="page-link text-danger">
                          {i + 1}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </HomeAdminSide>
  );
}
