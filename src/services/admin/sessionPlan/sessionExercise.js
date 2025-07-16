const { SessionExercise } = require("../../../models");
const { Op } = require("sequelize");

// ✅ Create
exports.createSessionExercise = async (data) => {
  try {
    const exercise = await SessionExercise.create(data);
    return { status: true, data: exercise.get({ plain: true }) };
  } catch (error) {
    console.error("❌ Error creating exercise:", error);
    return { status: false, message: error.message };
  }
};

exports.getAllSessionExercises = async () => {
  try {
    const exercise = await SessionExercise.findAll({ order: [["id", "ASC"]] });
    return { status: true, data: exercise };
  } catch (error) {
    console.error("❌ Error fetching exercises:", error);
    return { status: false, message: error.message };
  }
};

// ✅ Get by ID
exports.getSessionExerciseById = async (id) => {
  try {
    const exercise = await SessionExercise.findByPk(id);
    if (!exercise) {
      return { status: false, message: "Exercise not found" };
    }
    return { status: true, data: exercise };
  } catch (error) {
    console.error("❌ Error fetching exercise by ID:", error);
    return { status: false, message: error.message };
  }
};

// ✅ Update
exports.updateSessionExercise = async (id, data) => {
  try {
    const exercise = await SessionExercise.findByPk(id);
    if (!exercise) {
      return { status: false, message: "Exercise not found" };
    }
    await exercise.update(data);
    return { status: true, data: exercise };
  } catch (error) {
    console.error("❌ Error updating exercise:", error);
    return { status: false, message: error.message };
  }
};

// ✅ Delete
exports.deleteSessionExercise = async (id) => {
  try {
    const exercise = await SessionExercise.findByPk(id);
    if (!exercise) {
      return { status: false, message: "Exercise not found" };
    }
    await exercise.destroy();
    return { status: true, message: "Exercise deleted successfully" };
  } catch (error) {
    console.error("❌ Error deleting exercise:", error);
    return { status: false, message: error.message };
  }
};
