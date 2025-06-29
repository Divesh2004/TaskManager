// ✅ Updated Dashboard.jsx with real-time sync and logout
import React, { useEffect, useState } from "react";
import TaskForm from "../components/TaskForm";
import TaskItem from "../components/TaskItem";
import ShareModal from "../components/ShareModal";
import socket from "../socket";

function Dashboard() {
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [shareModalTask, setShareModalTask] = useState(null);

  const [filters, setFilters] = useState({
    status: "All",
    priority: "All",
    due: "All",
    sortBy: "createdAt",
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchUser = async () => {
    const res = await fetch("http://localhost:5000/api/profile", {
      method: "GET",
      credentials: "include",
    });
    const data = await res.json();
    if (data.user) {
      setUser(data.user);
    } else {
      alert("Not authenticated");
      window.location.href = "/login";
    }
  };

  const fetchTasks = async () => {
    const query = new URLSearchParams({
      ...filters,
      page,
      limit: 5,
    });

    const res = await fetch(`http://localhost:5000/api/tasks?${query.toString()}`, {
      credentials: "include",
    });

    const data = await res.json();
    setTasks(data.tasks);
    setTotalPages(Math.ceil(data.total / 5));
  };

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [filters, page]);

  useEffect(() => {
    socket.on("connect", () => {
      console.log("✅ Socket connected:", socket.id);
    });

    socket.on("task-updated", (task) => {
      console.log("📢 Task updated:", task);
      fetchTasks();
    });

    return () => {
      socket.off("task-updated");
    };
  }, []);

  const handleAdd = (newTask) => setTasks((prev) => [...prev, newTask]);

  const handleUpdate = (updatedTask) => {
    setTasks((prev) =>
      prev.map((t) => (t._id === updatedTask._id ? updatedTask : t))
    );
  };

  const handleShare = (task) => {
    setShareModalTask(task);
  };

  const handleDelete = (id) =>
    setTasks((prev) => prev.filter((t) => t._id !== id));

  const handleEdit = (task) => setSelectedTask(task);

  const clearSelection = () => setSelectedTask(null);

  const handleLogout = async () => {
    await fetch("http://localhost:5000/api/logout", {
      method: "POST",
      credentials: "include",
    });
    window.location.href = "/";
  };

  return (
    <div className="dashboard-container">
      <h1>Welcome to Dashboard</h1>
      {user ? (
        <div>
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <img src={user.avatar} alt="avatar" width={100} />
        </div>
      ) : (
        <p>Loading user...</p>
      )}

      <hr />

      <a href="/shared">
        <button style={{ backgroundColor: "#4A90E2" }}>View Shared With Me</button>
      </a>

      <button onClick={handleLogout} style={{ backgroundColor: "#999", marginTop: "10px" }}>
        Logout
      </button>

      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", margin: "1rem 0" }}>
        <select onChange={(e) => setFilters(f => ({ ...f, status: e.target.value }))}>
          <option value="All">All Status</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>

        <select onChange={(e) => setFilters(f => ({ ...f, priority: e.target.value }))}>
          <option value="All">All Priority</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>

        <select onChange={(e) => setFilters(f => ({ ...f, due: e.target.value }))}>
          <option value="All">All Due</option>
          <option value="today">Due Today</option>
          <option value="overdue">Overdue</option>
        </select>

        <select onChange={(e) => setFilters(f => ({ ...f, sortBy: e.target.value }))}>
          <option value="createdAt">Sort by Creation</option>
          <option value="dueDate">Sort by Due Date</option>
        </select>

        <button onClick={() => setPage(1)}>Apply Filters</button>
      </div>

      <h2>{selectedTask ? "Edit Task" : "Create Task"}</h2>
      <TaskForm
        onAdd={handleAdd}
        onUpdate={handleUpdate}
        selectedTask={selectedTask}
        clearSelection={clearSelection}
      />

      <h2>Your Tasks</h2>
      {tasks.length === 0 ? (
        <p>No tasks yet.</p>
      ) : (
        tasks.map((task) => (
          <TaskItem
            key={task._id}
            task={task}
            onDelete={handleDelete}
            onUpdate={handleUpdate}
            onEdit={handleEdit}
            onShare={handleShare}
          />
        ))
      )}

      <div style={{ marginTop: "1rem" }}>
        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}>Prev</button>
        <span style={{ margin: "0 10px" }}>Page {page} of {totalPages}</span>
        <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>Next</button>
      </div>

      {shareModalTask && (
        <ShareModal
          task={shareModalTask}
          onClose={() => setShareModalTask(null)}
        />
      )}
    </div>
  );
}

export default Dashboard;
