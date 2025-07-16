const {
  ClassSchedule,
  Venue,
  TermGroup,
  Term,
  SessionPlanGroup,
  SessionExercise,
} = require("../../../models");

// ✅ Create a new class
exports.createClass = async (data) => {
  try {
    const newClass = await ClassSchedule.create(data);
    return { status: true, data: newClass };
  } catch (error) {
    console.error("❌ createClass Error:", error);
    return { status: false, message: error.message };
  }
};

// ✅ Update class by ID
exports.updateClass = async (id, data) => {
  try {
    const cls = await ClassSchedule.findByPk(id);
    if (!cls) return { status: false, message: "Class not found" };

    await cls.update(data);
    return { status: true, data: cls };
  } catch (error) {
    console.error("❌ updateClass Error:", error);
    return { status: false, message: error.message };
  }
};

// ✅ Get all classes (with venue info)
exports.getAllClasses = async () => {
  try {
    // ✅ Fetch classes → venue → term → sessionPlanGroup
    const classes = await ClassSchedule.findAll({
      order: [["id", "ASC"]],
      include: [
        {
          model: Venue,
          as: "venue",
          include: [
            {
              model: Term,
              as: "term",
              include: [
                { model: TermGroup, as: "termGroup" },
                { model: SessionPlanGroup, as: "sessionPlanGroup" },
              ],
            },
          ],
        },
      ],
    });

    // ✅ Loop over each class & process SessionPlanGroup
    for (const cls of classes) {
      const spg = cls.venue?.term?.sessionPlanGroup;

      if (spg?.levels) {
        // 1️⃣ Parse levels safely
        let parsedLevels;
        try {
          parsedLevels =
            typeof spg.levels === "string"
              ? JSON.parse(spg.levels)
              : spg.levels;
        } catch (err) {
          console.warn(`⚠️ Could not parse levels for SPG ID ${spg.id}`);
          parsedLevels = {};
        }

        // 2️⃣ Collect all sessionExerciseIds
        const allIds = [];
        Object.values(parsedLevels).forEach((levelArray) => {
          levelArray.forEach((item) => {
            if (Array.isArray(item.sessionExerciseId)) {
              allIds.push(...item.sessionExerciseId);
            }
          });
        });

        const uniqueIds = [...new Set(allIds)];

        // 3️⃣ Fetch exercises if IDs exist
        let exercises = [];
        if (uniqueIds.length > 0) {
          exercises = await SessionExercise.findAll({
            where: { id: uniqueIds },
            attributes: ["id", "title", "description", "duration"], // ✅ select only needed fields
          });
        }

        // 4️⃣ Attach parsed levels + actual exercises
        spg.dataValues.levels = parsedLevels; // ✅ Replace JSON string
        spg.dataValues.exercises = exercises; // ✅ Add actual exercises
      }
    }

    return { status: true, data: classes };
  } catch (error) {
    console.error("❌ getAllClasses Error:", error.message);
    return { status: false, message: error.message };
  }
};

// ✅ Get single class by ID with FULL venue/term/sessionPlanGroup/exercise details
exports.getClassByIdWithFullDetails = async (classId) => {
  try {
    // ✅ Fetch class with venue → term → sessionPlanGroup
    const cls = await ClassSchedule.findByPk(classId, {
      include: [
        {
          model: Venue,
          as: "venue",
          include: [
            {
              model: Term,
              as: "term",
              include: [
                { model: TermGroup, as: "termGroup" },
                { model: SessionPlanGroup, as: "sessionPlanGroup" },
              ],
            },
          ],
        },
      ],
    });

    if (!cls) {
      return { status: false, message: "Class not found" };
    }

    // ✅ Extract sessionPlanGroup
    const spg = cls.venue?.term?.sessionPlanGroup;

    if (spg?.levels) {
      // 1️⃣ Parse JSON safely
      let parsedLevels;
      try {
        parsedLevels =
          typeof spg.levels === "string" ? JSON.parse(spg.levels) : spg.levels;
      } catch (err) {
        console.warn(`⚠️ Could not parse levels for SPG ID ${spg.id}`);
        parsedLevels = {};
      }

      // 2️⃣ Collect all unique sessionExerciseIds
      const allIds = [];
      Object.values(parsedLevels).forEach((levelArray) => {
        levelArray.forEach((item) => {
          if (Array.isArray(item.sessionExerciseId)) {
            allIds.push(...item.sessionExerciseId);
          }
        });
      });

      const uniqueIds = [...new Set(allIds)];

      // 3️⃣ Fetch exercise details if IDs exist
      let exercises = [];
      if (uniqueIds.length > 0) {
        exercises = await SessionExercise.findAll({
          where: { id: uniqueIds },
          attributes: ["id", "title", "description", "duration"],
        });
      }

      // 4️⃣ Attach parsed levels + exercises
      spg.dataValues.levels = parsedLevels; // ✅ Replace JSON string with parsed object
      spg.dataValues.exercises = exercises; // ✅ Add full details
    }

    return {
      status: true,
      message: "Class and full details fetched successfully.",
      data: cls,
    };
  } catch (error) {
    console.error("❌ getClassByIdWithFullDetails Error:", error.message);
    return { status: false, message: "Fetch failed: " + error.message };
  }
};

// ✅ Delete class by ID
exports.deleteClass = async (id) => {
  try {
    const deleted = await ClassSchedule.destroy({ where: { id } });
    if (!deleted) return { status: false, message: "Class not found" };
    return { status: true, message: "Class deleted successfully." };
  } catch (error) {
    console.error("❌ deleteClass Error:", error);
    return { status: false, message: error.message };
  }
};
