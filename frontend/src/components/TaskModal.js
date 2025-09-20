import React, { useState } from "react";
import api from "../api";
import "./taskModal.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function TaskModal({ onClose, users }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [assigneeId, setAssigneeId] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/tasks", {
        title,
        description,
        priority,
        assigneeId: assigneeId || null,
      });
      toast.success("Task created successfully!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  return (
    <div className="task-modal-backdrop">
      <form onSubmit={submit} className="task-modal-form">
        <h3>Create Task</h3>
        <input
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
        ></textarea>
        <select value={priority} onChange={(e) => setPriority(e.target.value)}>
          <option value="LOW">LOW</option>
          <option value="MEDIUM">MEDIUM</option>
          <option value="HIGH">HIGH</option>
        </select>
        <select
          value={assigneeId}
          onChange={(e) => setAssigneeId(e.target.value)}
        >
          <option value="">Unassigned</option>
          {users.map((u) => (
            <option key={u._id} value={u._id}>
              {u.name}
            </option>
          ))}
        </select>
        <div className="task-modal-buttons">
          <button type="submit">Create</button>
          <button type="button" onClick={onClose}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
