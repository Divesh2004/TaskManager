const mongoose = require("mongoose");

const sharedTaskSchema = new mongoose.Schema({
  taskId: { type: mongoose.Schema.Types.ObjectId, ref: "Task", required: true },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  sharedWith: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  permission: { type: String, enum: ["read", "edit"], default: "read" },
  completed: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model("SharedTask", sharedTaskSchema);
