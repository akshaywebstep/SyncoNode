const { SessionPlanGroup, SessionExercise } = require("../../../models");
const { saveFile, deleteFile } = require("../../../utils/fileHandler");
const path = require("path");

// ✅ Create
exports.createSessionPlanGroup = async (data) => {
  try {
    const { groupName, bannerUrl, videoUrl, levels } = data;

    // ✅ Extract ALL exercise IDs from levels JSON for validation
    const allExerciseIds = [];
    if (levels) {
      Object.values(levels).forEach((levelArray) => {
        levelArray.forEach((entry) => {
          allExerciseIds.push(...entry.sessionExerciseId);
        });
      });

      const uniqueIds = [...new Set(allExerciseIds)];

      if (uniqueIds.length > 0) {
        const foundExercises = await SessionExercise.findAll({
          where: { id: uniqueIds },
          attributes: ["id"],
        });

        if (foundExercises.length !== uniqueIds.length) {
          const missingIds = uniqueIds.filter(
            (id) => !foundExercises.some((e) => e.id === id)
          );
          return {
            status: false,
            message: "Some sessionExerciseIds do not exist",
            data: { missingIds },
          };
        }
      }
    }

    const newGroup = await SessionPlanGroup.create({
      groupName,
      bannerUrl: bannerUrl || null,
      videoUrl: videoUrl || null,
      levels: levels || {},
    });

    return { status: true, data: newGroup.get({ plain: true }) };
  } catch (error) {
    console.error("❌ Error creating SessionPlanGroup:", error);
    return { status: false, message: error.message };
  }
};

exports.getAllSessionPlanGroups = async () => {
  try {
    const groups = await SessionPlanGroup.findAll({ order: [["id", "ASC"]] });

    // ✅ Clean & parse levels
    const cleanGroups = groups.map((group) => {
      const plain = group.get({ plain: true });

      // Ensure levels is parsed JSON
      let parsedLevels = {};
      try {
        parsedLevels =
          typeof plain.levels === "string"
            ? JSON.parse(plain.levels)
            : plain.levels || {};
      } catch (e) {
        parsedLevels = {}; // fallback
      }

      return {
        id: plain.id,
        groupName: plain.groupName,
        bannerUrl: plain.bannerUrl,
        videoUrl: plain.videoUrl,
        levels: parsedLevels,
        createdAt: plain.createdAt,
        updatedAt: plain.updatedAt,
      };
    });

    return { status: true, data: cleanGroups };
  } catch (error) {
    console.error("❌ Error fetching SessionPlanGroups:", error);
    return { status: false, message: error.message };
  }
};

// ✅ Get by ID
exports.getSessionPlanGroupById = async (id) => {
  try {
    const group = await SessionPlanGroup.findByPk(id);
    if (!group) {
      return { status: false, message: "Session Plan Group not found" };
    }

    // ✅ Clean & parse levels
    const plain = group.get({ plain: true });
    let parsedLevels = {};
    try {
      parsedLevels =
        typeof plain.levels === "string"
          ? JSON.parse(plain.levels)
          : plain.levels || {};
    } catch (e) {
      parsedLevels = {}; // fallback if parsing fails
    }

    const cleanGroup = {
      id: plain.id,
      groupName: plain.groupName,
      bannerUrl: plain.bannerUrl,
      videoUrl: plain.videoUrl,
      levels: parsedLevels,
      createdAt: plain.createdAt,
      updatedAt: plain.updatedAt,
    };

    return { status: true, data: cleanGroup };
  } catch (error) {
    console.error("❌ Error fetching SessionPlanGroup by ID:", error);
    return { status: false, message: error.message };
  }
};

// ✅ Update
exports.updateSessionPlanGroup = async (id, data, files = {}) => {
  try {
    const group = await SessionPlanGroup.findByPk(id);
    if (!group) {
      return { status: false, message: "Session Plan Group not found" };
    }

    const { groupName, levels } = data;
    let updatedFields = {};

    // ✅ 1. Validate sessionExerciseId if levels provided
    if (levels) {
      const allExerciseIds = [];

      Object.values(levels).forEach((levelArray) => {
        levelArray.forEach((entry) => {
          if (Array.isArray(entry.sessionExerciseId)) {
            allExerciseIds.push(...entry.sessionExerciseId);
          }
        });
      });

      const uniqueIds = [...new Set(allExerciseIds)];

      if (uniqueIds.length > 0) {
        const foundExercises = await SessionExercise.findAll({
          where: { id: uniqueIds },
          attributes: ["id"],
        });

        if (foundExercises.length !== uniqueIds.length) {
          const foundIds = foundExercises.map((e) => e.id);
          const missingIds = uniqueIds.filter((id) => !foundIds.includes(id));

          return {
            status: false,
            message: "Some sessionExerciseIds do not exist",
            data: { missingIds },
          };
        }
      }

      updatedFields.levels = levels;
    }

    if (groupName) updatedFields.groupName = groupName;

    // ✅ 2. Handle banner upload
    if (files.banner?.[0]) {
      const bannerFile = files.banner[0];

      // Delete old banner if exists
      if (group.bannerUrl) {
        deleteFile(path.join(process.cwd(), group.bannerUrl));
      }

      const ext = path.extname(bannerFile.originalname).toLowerCase();
      const uniqueName = `banner_${Date.now()}${ext}`;
      const savePath = path.join(
        process.cwd(),
        "uploads",
        "session-plan-groups",
        id.toString(),
        uniqueName
      );

      await saveFile(bannerFile, savePath);
      updatedFields.bannerUrl = `uploads/session-plan-groups/${id}/${uniqueName}`;
    }

    // ✅ 3. Handle video upload
    if (files.video?.[0]) {
      const videoFile = files.video[0];

      // Delete old video if exists
      if (group.videoUrl) {
        deleteFile(path.join(process.cwd(), group.videoUrl));
      }

      const ext = path.extname(videoFile.originalname).toLowerCase();
      const uniqueName = `video_${Date.now()}${ext}`;
      const savePath = path.join(
        process.cwd(),
        "uploads",
        "session-plan-groups",
        id.toString(),
        uniqueName
      );

      await saveFile(videoFile, savePath);
      updatedFields.videoUrl = `uploads/session-plan-groups/${id}/${uniqueName}`;
    }

    // ✅ 4. Update in DB
    await group.update(updatedFields);

    return { status: true, data: group };
  } catch (error) {
    console.error("❌ Error updating SessionPlanGroup:", error);
    return { status: false, message: error.message };
  }
};

// ✅ Delete
exports.deleteSessionPlanGroup = async (id) => {
  try {
    const group = await SessionPlanGroup.findByPk(id);
    if (!group) {
      return { status: false, message: "Session Plan Group not found" };
    }
    await group.destroy();
    return { status: true, message: "Session Plan Group deleted successfully" };
  } catch (error) {
    console.error("❌ Error deleting SessionPlanGroup:", error);
    return { status: false, message: error.message };
  }
};
