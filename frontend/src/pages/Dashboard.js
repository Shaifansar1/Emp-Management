import React, { useEffect, useState, useContext } from "react";
import api, { setAuthToken } from "../api";
import { AuthContext } from "../contexts/AuthContext";
import io from "socket.io-client";
import TaskModal from "../components/TaskModal";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./dashboard.css";

const socket = io("http://localhost:4000");

export default function Dashboard() {
  const { user, logout } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState({ status: "", assignee: "" });
  const [showModal, setShowModal] = useState(false);
  console.log("Current user:", user);

  // Merge tasks safely to prevent duplicates
  const mergeTasks = (newTasks) => {
    setTasks((prev) => {
      const map = {};
      [...newTasks, ...prev].forEach((t) => (map[t._id] = t));
      return Object.values(map);
    });
  };

  // Setup socket listeners once
  useEffect(() => {
    socket.connect();

    const handleTaskCreated = (t) => mergeTasks([t]);
    const handleTaskUpdated = (t) =>
      setTasks((prev) => prev.map((p) => (p._id === t._id ? t : p)));
    const handleTaskDeleted = ({ id }) =>
      setTasks((prev) => prev.filter((p) => p._id !== id));

    socket.on("task_created", handleTaskCreated);
    socket.on("task_updated", handleTaskUpdated);
    socket.on("task_deleted", handleTaskDeleted);

    return () => {
      socket.off("task_created", handleTaskCreated);
      socket.off("task_updated", handleTaskUpdated);
      socket.off("task_deleted", handleTaskDeleted);
    };
  }, []);

  // Set auth token & welcome toast
  useEffect(() => {
    if (user) {
      toast.success(`Welcome ${user.role}!`, {
        position: "top-right",
        autoClose: 3000,
      });
    }
    setAuthToken(user?.token || null);
  }, [user]);

  // Fetch tasks from backend
  const fetchTasks = async () => {
    const q = new URLSearchParams();
    if (filter.status) q.set("status", filter.status);
    if (filter.assignee) q.set("assignee", filter.assignee);
    try {
      const res = await api.get("/tasks?" + q.toString());
      setTasks(res.data); // replace with fresh data
    } catch (err) {
      console.error("Fetch tasks failed:", err);
    }
  };

  // Fetch users
  const fetchUsers = async () => {
    try {
      const res = await api.get("/users");
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch tasks and users when filter changes
  useEffect(() => {
    fetchTasks();
    fetchUsers();
  }, [filter]);

  const updateTask = async (id, payload) => {
    try {
      const res = await api.put(`/tasks/${id}`, payload);
      setTasks((prev) => prev.map((t) => (t._id === id ? res.data : t)));
    } catch (err) {
      console.error("Update failed:", err.response?.data || err.message);
      alert(err.response?.data?.error || "Failed to update task");
    }
  };

  const deleteTask = async (id) => {
    try {
      await api.delete(`/tasks/${id}`);
      setTasks((prev) => prev.filter((t) => t._id !== id)); // remove immediately
    } catch (err) {
      console.error("Delete failed:", err.response?.data || err.message);
    }
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      logout();
      toast.info("You have been logged out!");
    }
  };

  const statusColumns = ["TODO", "IN_PROGRESS", "DONE"];

  return (
    <div className="dashboard-container">
      <ToastContainer />
      <header className="dashboard-header">
        <h2>Tasks</h2>
        <div>
          <span style={{ margin: "10px" }}>{`${user?.role}`}</span>
          {["SUPER_USER", "ADMIN"].includes(user?.role) && (
            <button onClick={() => setShowModal(true)}>New Task</button>
          )}
          <button onClick={handleLogout}>Logout</button>
        </div>
      </header>

      <div className="dashboard-filters">
        <select
          value={filter.status}
          onChange={(e) => setFilter({ ...filter, status: e.target.value })}
        >
          <option value="">All Status</option>
          <option value="TODO">TODO</option>
          <option value="IN_PROGRESS">IN_PROGRESS</option>
          <option value="DONE">DONE</option>
        </select>

        <select
          value={filter.assignee}
          onChange={(e) => setFilter({ ...filter, assignee: e.target.value })}
        >
          <option value="">All Assignees</option>
          {users.map((u) => (
            <option key={u._id} value={u._id}>
              {u.name}
            </option>
          ))}
        </select>
      </div>

      <div className="tasks-columns">
        {statusColumns.map((col) => (
          <div key={col} className="task-column">
            <h3>{col}</h3>
            {tasks
              .filter((t) => t.status === col)
              .map((t) => (
                <div key={t._id} className="task-card">
                  <strong>{t.title}</strong>
                  <p>{t.description}</p>
                  <div>
                    <select
                      value={t.status}
                      onChange={(e) =>
                        updateTask(t._id, { status: e.target.value })
                      }
                    >
                      <option value="TODO">TODO</option>
                      <option value="IN_PROGRESS">IN_PROGRESS</option>
                      <option value="DONE">DONE</option>
                    </select>

                    <select
                      value={t.assigneeId?._id || ""}
                      onChange={(e) =>
                        updateTask(t._id, {
                          assigneeId: e.target.value || null,
                        })
                      }
                    >
                      <option value="">Unassigned</option>
                      {users.map((u) => (
                        <option key={u._id} value={u._id}>
                          {u.name}
                        </option>
                      ))}
                    </select>

                    <button onClick={() => deleteTask(t._id)}>Delete</button>
                  </div>
                </div>
              ))}
          </div>
        ))}
      </div>

      {showModal && (
        <TaskModal
          onClose={() => {
            setShowModal(false);
            fetchTasks();
          }}
          users={users}
        />
      )}
    </div>
  );
}
