import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./dashboard.css"; // reuse same styles

export default function Home() {
  const [dummyTasks] = useState([
    {
      _id: "1",
      title: "Setup Project",
      description: "Initialize repo & setup dependencies",
      status: "TODO",
    },
    {
      _id: "2",
      title: "Design UI",
      description: "Create wireframes & mockups",
      status: "IN_PROGRESS",
    },
    {
      _id: "3",
      title: "Deploy App",
      description: "Deploy app to cloud hosting",
      status: "DONE",
    },
  ]);

  const statusColumns = ["TODO", "IN_PROGRESS", "DONE"];

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h2>Welcome to Task Manager</h2>
        <div>
          <Link to="/login">
            <button>Login</button>
          </Link>
          <Link to="/register">
            <button>Register</button>
          </Link>
        </div>
      </header>

      <div className="dashboard-filters">
        <select disabled>
          <option>All Status</option>
        </select>
        <select disabled>
          <option>All Assignees</option>
        </select>
      </div>

      <div className="tasks-columns">
        {statusColumns.map((col) => (
          <div key={col} className="task-column">
            <h3>{col}</h3>
            {dummyTasks
              .filter((t) => t.status === col)
              .map((t) => (
                <div key={t._id} className="task-card">
                  <strong>{t.title}</strong>
                  <p>{t.description}</p>
                  <div>
                    <select value={t.status} disabled>
                      <option value="TODO">TODO</option>
                      <option value="IN_PROGRESS">IN_PROGRESS</option>
                      <option value="DONE">DONE</option>
                    </select>
                    <select disabled>
                      <option>Unassigned</option>
                    </select>
                    <button disabled>Delete</button>
                  </div>
                </div>
              ))}
          </div>
        ))}
      </div>
    </div>
  );
}
