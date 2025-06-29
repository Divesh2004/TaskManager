import React from "react";

const TaskItem = ({ task, onDelete, onUpdate, onEdit,onShare }) => {
  const handleStatusToggle = async () => {
    const newStatus = task.status === "Completed" ? "In Progress" : "Completed";
    const res = await fetch(`http://localhost:5000/api/tasks/${task._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ ...task, status: newStatus }),
    });
    const updatedTask = await res.json();
    onUpdate(updatedTask);
  };

  const handleDelete = async () => {
    await fetch(`http://localhost:5000/api/tasks/${task._id}`, {
      method: "DELETE",
      credentials: "include",
    });
    onDelete(task._id);
  };

  return (
    <div className="task-item">
      <h4>{task.title}</h4>
      <p>{task.description}</p>
      <p><strong>Due:</strong> {task.dueDate?.substring(0, 10)}</p>
      <p><strong>Priority:</strong> {task.priority}</p>
      <p>
        <strong>Status:</strong>
        <input
          type="checkbox"
          checked={task.status === "Completed"}
          onChange={handleStatusToggle}
          style={{ marginLeft: "10px", transform: "scale(1.2)" }}
        />{" "}
        {task.status}
      </p>
      <button onClick={() => onEdit(task)} style={{ backgroundColor: "#555" }}>Edit</button>
      <button onClick={handleDelete}>Delete</button>
      <button onClick={() => onShare(task)} style={{ backgroundColor: "#6b46c1" }}>
  Share
</button>

    </div>
  );
};

export default TaskItem;
