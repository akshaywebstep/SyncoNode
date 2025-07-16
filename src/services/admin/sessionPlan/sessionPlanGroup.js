const { SessionPlanGroup, SessionExercise } = require("../../../models");
const { Op } = require("sequelize");

// ✅ Create
exports.createSessionPlanGroup = async (data) => {
  try {
    const group = await SessionPlanGroup.create(data);
    return { status: true, data: group };
  } catch (error) {
    console.error("❌ Error creating group:", error);
    return { status: false, message: error.message };
  }
};

// ✅ Get All
exports.getSessionPlanGroups = async () => {
  try {
    const groups = await SessionPlanGroup.findAll({ order: [["id", "ASC"]] });
    return { status: true, data: groups };
  } catch (error) {
    console.error("❌ Error fetching groups:", error);
    return { status: false, message: error.message };
  }
};

// ✅ Get by ID
exports.getSessionPlanGroupById = async (id) => {
  try {
    const group = await SessionPlanGroup.findByPk(id);
    if (!group) {
      return { status: false, message: "Group not found" };
    }
    return { status: true, data: group };
  } catch (error) {
    console.error("❌ Error fetching group:", error);
    return { status: false, message: error.message };
  }
};

// ✅ Update
exports.updateSessionPlanGroup = async (id, data) => {
  try {
    const group = await SessionPlanGroup.findByPk(id);
    if (!group) {
      return { status: false, message: "Group not found" };
    }
    await group.update(data);
    return { status: true, data: group };
  } catch (error) {
    console.error("❌ Error updating group:", error);
    return { status: false, message: error.message };
  }
};

// ✅ Delete
exports.deleteSessionPlanGroup = async (id) => {
  try {
    const group = await SessionPlanGroup.findByPk(id);
    if (!group) {
      return { status: false, message: "Group not found" };
    }
    await group.destroy();
    return { status: true, message: "Group deleted successfully" };
  } catch (error) {
    console.error("❌ Error deleting group:", error);
    return { status: false, message: error.message };
  }
};

// ✅ Preview with Exercises (Many-to-Many Join)
exports.getSessionPlanPreviewById = async (id) => {
  try {
    const group = await SessionPlanGroup.findByPk(id, {
      include: [
        {
          model: SessionExercise,
          as: "exercises",
          through: { attributes: [] },
          attributes: ["id", "title", "duration", "description", "imageUrl"],
        },
      ],
    });

    if (!group) {
      return { status: false, message: "Session plan group not found." };
    }

    return {
      status: true,
      data: {
        group_id: group.id,
        group_name: group.groupName,
        skill_of_day: group.skillOfTheDay,
        player_name: group.player,
        description: group.description,
        level: group.level,
        video_url: group.videoUrl,
        banner_url: group.bannerUrl,
        exercises: group.exercises,
      },
    };
  } catch (error) {
    console.error("❌ Error fetching session plan preview:", error);
    return { status: false, message: error.message };
  }
};
