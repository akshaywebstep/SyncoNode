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
                { model: TermGroup, as: "termGroup" }, // ✅ Term → TermGroup
                {
                  model: SessionPlanGroup,
                  as: "sessionPlanGroup", // ✅ Term → SessionPlanGroup
                  include: [
                    {
                      model: SessionExercise, // ✅ SessionPlanGroup → SessionExercise
                      as: "exercise",
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    });

    return { status: true, data: classes };
  } catch (error) {
    console.error("❌ getAllClasses Error:", error.message);
    return { status: false, message: error.message };
  }
};

// ✅ Get single class by ID with FULL venue/term/sessionPlanGroup/exercise details
exports.getClassByIdWithFullDetails = async (classId) => {
  try {
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
                { model: TermGroup, as: "termGroup" }, // ✅ termGroup nested
                {
                  model: SessionPlanGroup,
                  as: "sessionPlanGroup",
                  include: [
                    {
                      model: SessionExercise, // ✅ nested exercise details
                      as: "exercise",
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    });

    if (!cls) {
      return { status: false, message: "Class not found" };
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
