const express = require("express");
const Task = require("../models/Task");
const { auth, permit } = require("../middleware/auth");
const router = express.Router();

router.get("/", auth, async (req, res) => {
  const { status, assignee } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (assignee) filter.assigneeId = assignee;
  if (!["SUPER_USER", "ADMIN"].includes(req.user.role)) {
    filter.$or = [{ assigneeId: req.user._id }, { creatorId: req.user._id }];
  }
  const tasks = await Task.find(filter)
    .populate("assigneeId", "name email")
    .populate("creatorId", "name email");
  res.json(tasks);
});

router.post("/", auth, async (req, res) => {
  try {
    const { title, description, priority, assigneeId } = req.body;

    const task = await Task.create({
      title,
      description,
      priority,
      assigneeId: assigneeId || null,
      creatorId: req.user._id,
    });

    const populatedTask = await Task.findById(task._id)
      .populate("assigneeId", "name email")
      .populate("creatorId", "name email");

    req.io.emit("task_created", populatedTask);
    res.status(201).json(populatedTask);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    let { title, description, status, priority, assigneeId } = req.body;

    if (!assigneeId) assigneeId = null;

    const task = await Task.findById(id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    if (
      !["SUPER_USER", "ADMIN"].includes(req.user.role) &&
      ![task.creatorId?.toString(), task.assigneeId?.toString()].includes(
        req.user._id.toString()
      )
    ) {
      return res.status(403).json({ message: "Forbidden" });
    }

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (status !== undefined) task.status = status;
    if (priority !== undefined) task.priority = priority;
    if (assigneeId !== undefined) task.assigneeId = assigneeId;

    task.updatedAt = Date.now();
    await task.save();

    const populated = await Task.findById(task._id)
      .populate("assigneeId", "name email")
      .populate("creatorId", "name email");

    req.io.emit("task_updated", populated);
    res.json(populated);
  } catch (err) {
    console.error("Error updating task:", err);
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    if (
      !["SUPER_USER", "ADMIN"].includes(req.user.role) &&
      task.creatorId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Forbidden" });
    }
    await task.deleteOne();
    req.io.emit("task_deleted", { id: req.params.id });
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
