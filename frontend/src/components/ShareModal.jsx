import React, { useState } from "react";

const ShareModal = ({ task, onClose }) => {
  const [email, setEmail] = useState("");
  const [permission, setPermission] = useState("read");
  const [message, setMessage] = useState("");

  const handleShare = async () => {
    const res = await fetch("http://localhost:5000/api/shared/share", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ taskId: task._id, email, permission }),
    });

    const data = await res.json();
    if (res.ok) {
      setMessage("Task shared successfully!");
      setTimeout(onClose, 1500);
    } else {
      setMessage(data.error || "Failed to share");
    }
  };

  return (
    <div style={{
      position: "fixed", top: "20%", left: "50%", transform: "translateX(-50%)",
      background: "white", padding: "2rem", borderRadius: "10px", boxShadow: "0 0 10px rgba(0,0,0,0.2)"
    }}>
      <h3>Share Task: {task.title}</h3>
      <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <select value={permission} onChange={(e) => setPermission(e.target.value)}>
        <option value="read">Read Only</option>
        <option value="edit">Edit Access</option>
      </select>
      <button onClick={handleShare}>Share</button>
      <button onClick={onClose} style={{ marginLeft: "1rem" }}>Cancel</button>
      {message && <p>{message}</p>}
    </div>
  );
};

export default ShareModal;
