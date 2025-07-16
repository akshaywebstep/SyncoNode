const {
  Term,
  TermGroup,
  SessionPlanGroup,
  SessionExercise,
} = require("../../../models");

// ✅ CREATE TERM
exports.createTerm = async (data) => {
  try {
    const term = await Term.create(data);
    return { status: true, data: term, message: "Term created." };
  } catch (error) {
    return { status: false, message: "Create term failed. " + error.message };
  }
};

// ✅ GET ALL TERMS with associated TermGroup and SessionPlanGroup
exports.getAllTerms = async () => {
  try {
    const terms = await Term.findAll({
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: TermGroup,
          as: "termGroup",
          attributes: ["id", "name"], // Only name & ID needed
        },
        {
          model: SessionPlanGroup,
          as: "sessionPlanGroup",
          attributes: [
            "id",
            "levels",
            "groupName",
            "videoUrl",
            "bannerUrl",
            "createdAt",
            "updatedAt",
          ],
        },
      ],
    });

    // ✅ Loop through all terms and parse SessionPlanGroup levels
    for (const term of terms) {
      const spg = term.sessionPlanGroup;

      if (spg && spg.levels) {
        // ✅ Parse levels JSON safely
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

        // ✅ Collect all exercise IDs
        const allIds = [];
        Object.values(parsedLevels).forEach((levelArray) => {
          levelArray.forEach((item) => {
            if (Array.isArray(item.sessionExerciseId)) {
              allIds.push(...item.sessionExerciseId);
            }
          });
        });

        const uniqueIds = [...new Set(allIds)];

        // ✅ Fetch exercise details
        let exercises = [];
        if (uniqueIds.length > 0) {
          exercises = await SessionExercise.findAll({
            where: { id: uniqueIds },
            attributes: ["id", "title", "description", "duration"],
          });
        }

        // ✅ Replace raw levels + attach exercises
        spg.dataValues.levels = parsedLevels;
        spg.dataValues.exercises = exercises;
      }
    }

    return { status: true, data: terms };
  } catch (error) {
    console.error("❌ getAllTerms Error:", error.message);
    return { status: false, message: "Fetch terms failed. " + error.message };
  }
};

// ✅ GET TERM BY ID with associations
exports.getTermById = async (id) => {
  try {
    const term = await Term.findByPk(id, {
      include: [
        {
          model: TermGroup,
          as: "termGroup",
          attributes: ["id", "name"],
        },
        {
          model: SessionPlanGroup,
          as: "sessionPlanGroup",
          attributes: [
            "id",
            "groupName",
            "levels",
            "videoUrl",
            "bannerUrl",
            "createdAt",
            "updatedAt",
          ],
        },
      ],
    });

    if (!term) {
      return { status: false, message: "Term not found." };
    }

    const spg = term.sessionPlanGroup;

    if (spg && spg.levels) {
      let parsedLevels;
      try {
        parsedLevels =
          typeof spg.levels === "string" ? JSON.parse(spg.levels) : spg.levels;
      } catch (err) {
        console.warn(`⚠️ Could not parse levels for SPG ID ${spg.id}`);
        parsedLevels = {};
      }

      const allIds = [];
      Object.values(parsedLevels).forEach((levelArray) => {
        levelArray.forEach((item) => {
          if (Array.isArray(item.sessionExerciseId)) {
            allIds.push(...item.sessionExerciseId);
          }
        });
      });

      const uniqueIds = [...new Set(allIds)];

      let exercises = [];
      if (uniqueIds.length > 0) {
        exercises = await SessionExercise.findAll({
          where: { id: uniqueIds },
          attributes: ["id", "title", "description", "duration"],
        });
      }

      spg.dataValues.levels = parsedLevels;
      spg.dataValues.exercises = exercises;
    }

    return { status: true, data: term };
  } catch (error) {
    console.error("❌ getTermById Error:", error.message);
    return { status: false, message: "Get term failed. " + error.message };
  }
};

// ✅ UPDATE TERM
exports.updateTerm = async (id, data) => {
  try {
    const term = await Term.findByPk(id);
    if (!term) return { status: false, message: "Term not found." };

    await term.update(data);
    return { status: true, data: term, message: "Term updated." };
  } catch (error) {
    return { status: false, message: "Update term failed. " + error.message };
  }
};

// ✅ DELETE TERM
exports.deleteTerm = async (id) => {
  try {
    const term = await Term.findByPk(id);
    if (!term) return { status: false, message: "Term not found." };

    await term.destroy();
    return { status: true, message: "Term deleted." };
  } catch (error) {
    return { status: false, message: "Delete term failed. " + error.message };
  }
};
