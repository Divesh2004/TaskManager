const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  description: String,
  dueDate: Date,
  status: { type: String, enum: ["In Progress", "Completed", "Overdue"], default: "In Progress" },
  priority: { type: String, enum: ["Low", "Medium", "High"], default: "Medium" },
  labels: [String],
  subtasks: [
    {
      title: String,
      completed: { type: Boolean, default: false },
    }
  ],
}, { timestamps: true });

module.exports = mongoose.model("Task", taskSchema);
