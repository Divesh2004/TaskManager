import React, { useState, useEffect } from "react";

const TaskForm = ({ onAdd, onUpdate, selectedTask, clearSelection }) => {
  const [task, setTask] = useState({
    title: "",
    description: "",
    dueDate: "",
    priority: "Low",
    status: "In Progress",
  });

  useEffect(() => {
    if (selectedTask) {
      setTask({
        title: selectedTask.title,
        description: selectedTask.description,
        dueDate: selectedTask.dueDate?.substring(0, 10),
        priority: selectedTask.priority,
        status: selectedTask.status,
      });
    }
  }, [selectedTask]);

  const handleChange = (e) => {
    setTask({ ...task, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (selectedTask) {
      // UPDATE
      const res = await fetch(`http://localhost:5000/api/tasks/${selectedTask._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(task),
      });
      const updated = await res.json();
      onUpdate(updated);
      clearSelection();
    } else {
      // CREATE
      const res = await fetch("http://localhost:5000/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(task),
      });
      const newTask = await res.json();
      onAdd(newTask);
    }

    // Reset form
    setTask({
      title: "",
      description: "",
      dueDate: "",
      priority: "Low",
      status: "In Progress",
    });
  };

  return (
    <form onSubmit={handleSubmit} className="task-form">
      <input
        name="title"
        value={task.title}
        onChange={handleChange}
        placeholder="Title"
        required
      />
      <textarea
        name="description"
        value={task.description}
        onChange={handleChange}
        placeholder="Description"
      />
      <input
        name="dueDate"
        type="date"
        value={task.dueDate}
        onChange={handleChange}
      />
      <label>Priority</label>
      <select name="priority" value={task.priority} onChange={handleChange}>
        <option value="Low">Low</option>
        <option value="Medium">Medium</option>
        <option value="High">High</option>
      </select>

      <label>Status</label>
      <select name="status" value={task.status} onChange={handleChange}>
        <option value="In Progress">In Progress</option>
        <option value="Completed">Completed</option>
      </select>

      <button type="submit">
        {selectedTask ? "Update Task" : "Add Task"}
      </button>

      {selectedTask && (
        <button type="button" onClick={clearSelection} style={{ backgroundColor: "gray" }}>
          Cancel Edit
        </button>
      )}
    </form>
  );
};

export default TaskForm;
