import React, { useEffect, useState } from "react";
import socket from "../socket";

function SharedTasks() {
  const [tasks, setTasks] = useState([]);

  const fetchSharedTasks = async () => {
    const res = await fetch("http://localhost:5000/api/shared/shared-with-me", {
      credentials: "include",
    });
    const data = await res.json();
    setTasks(data);
  };

  const markDone = async (sharedTaskId) => {
    await fetch(`http://localhost:5000/api/shared/mark-complete/${sharedTaskId}`, {
      method: "PATCH",
      credentials: "include",
    });
    fetchSharedTasks();
  };

  useEffect(() => {
    fetchSharedTasks();
  }, []);

  useEffect(() => {
    socket.on("task-updated", () => fetchSharedTasks());
    return () => socket.off("task-updated");
  }, []);

  return (
    <div className="dashboard-container">
      <h2>Tasks Shared With You</h2>
      {tasks.map((task) => (
        <div key={task._id} className="task-item">
          <h4>{task.title}</h4>
          <p>{task.description}</p>
          <p><strong>Due:</strong> {task.dueDate?.substring(0, 10)}</p>
          <p><strong>Permission:</strong> {task.permission}</p>
          <p><strong>Shared by:</strong> {task.sharedBy}</p>

          {task.permission === "edit" && (
            <input defaultValue={task.title} />
          )}

          <p><strong>Completed by you?</strong> {task.individualDone ? "✅ Yes" : "❌ No"}</p>

          {!task.individualDone && (
            <button onClick={() => markDone(task.sharedTaskId)}>Mark as Done</button>
          )}
        </div>
      ))}
    </div>
  );
}

export default SharedTasks;
