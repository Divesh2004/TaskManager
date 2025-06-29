const SharedTask = require("../models/sharedtask");
const Task = require("../models/Task");
const User = require("../models/user");
const jwt = require("jsonwebtoken");

const getUserIdFromToken = (req) => {
  const token = req.cookies.token;
  if (!token) throw new Error("Unauthorized");
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  return decoded.id;
};

// Share a task
exports.shareTask = async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);
    const { taskId, email, permission } = req.body;

    const targetUser = await User.findOne({ email });
    if (!targetUser) return res.status(404).json({ error: "User not found" });

    const exists = await SharedTask.findOne({
      taskId,
      sharedWith: targetUser._id
    });
    if (exists) return res.status(400).json({ error: "Already shared" });

    const shared = await SharedTask.create({
      taskId,
      ownerId: userId,
      sharedWith: targetUser._id,
      permission
    });

    req.io.emit("task-updated", shared); // notify in real-time
    res.status(201).json(shared);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get shared tasks for current user
exports.getSharedTasks = async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);
    const sharedTasks = await SharedTask.find({ sharedWith: userId })
      .populate("taskId")
      .populate("ownerId", "name email");

    const tasks = sharedTasks.map((entry) => ({
      ...entry.taskId._doc,
      permission: entry.permission,
      sharedBy: entry.ownerId.name,
      sharedTaskId: entry._id,
      individualDone: entry.completed
    }));

    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Mark this user's shared task as done
exports.markSharedTaskDone = async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);
    const { id } = req.params;

    const updated = await SharedTask.findOneAndUpdate(
      { _id: id, sharedWith: userId },
      { completed: true },
      { new: true }
    );

    const taskId = updated.taskId;
    const allShared = await SharedTask.find({ taskId });
    const allSharedDone = allShared.every(s => s.completed === true);

    const task = await Task.findById(taskId);
    const ownerDone = task.status === "Completed";

    if (allSharedDone && ownerDone !== true) {
      task.status = "Completed";
      await task.save();
    }

    req.io.emit("task-updated", task);
    res.json({ message: "Marked done", task });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
