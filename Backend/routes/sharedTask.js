const express = require("express");
const router = express.Router();
const {
  shareTask,
  getSharedTasks,
  markSharedTaskDone
} = require("../Controllers/sharedTaskController");

router.post("/share", shareTask);
router.get("/shared-with-me", getSharedTasks);
router.patch("/mark-complete/:id", markSharedTaskDone);

module.exports = router;
