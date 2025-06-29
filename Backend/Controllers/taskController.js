const Task = require("../models/Task");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

const getUserIdFromToken = async (req) => {
  const token = req.cookies.token;
  if (!token) throw new Error("Unauthorized");
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  return decoded.id;
};

// CREATE a task
exports.createTask = async (req, res) => {
  try {
    const userId = await getUserIdFromToken(req);
    const task = new Task({ ...req.body, userId });
    await task.save();
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.getTasks = async (req, res) => {
  try {
    const userId = await getUserIdFromToken(req);

    const {
      status,
      priority,
      due,
      sortBy = "createdAt",
      page = 1,
      limit = 5,
    } = req.query;

    const filter = { userId };

    // Apply filters
    if (status && status !== "All") filter.status = status;
    if (priority && priority !== "All") filter.priority = priority;

    if (due === "today") {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      const end = new Date();
      end.setHours(23, 59, 59, 999);
      filter.dueDate = { $gte: start, $lte: end };
    } else if (due === "overdue") {
      filter.dueDate = { $lt: new Date() };
      filter.status = { $ne: "Completed" };
    }

    // 👉 Find all user's tasks first to update overdue ones
    const allUserTasks = await Task.find({ userId });
    const now = new Date();
    for (let task of allUserTasks) {
      if (
        task.status !== "Completed" &&
        task.dueDate &&
        new Date(task.dueDate) < now &&
        task.status !== "Overdue"
      ) {
        task.status = "Overdue";
        await task.save();
      }
    }

    // After marking, run the actual filtered query
    const total = await Task.countDocuments(filter);
    const tasks = await Task.find(filter)
      .sort({ [sortBy]: 1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ tasks, total });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// UPDATE a task
exports.updateTask = async (req, res) => {
  try {
    const userId = await getUserIdFromToken(req);
    const updated = await Task.findOneAndUpdate(
      { _id: req.params.id, userId },
      req.body,
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE a task
exports.deleteTask = async (req, res) => {
  try {
    const userId = await getUserIdFromToken(req);
    await Task.findOneAndDelete({ _id: req.params.id, userId });
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
