const {
  Venue,
  Term,
  TermGroup,
  SessionPlanGroup,
  SessionExercise,
} = require("../../../models");

const { Op } = require("sequelize");

// 🔹 Create
exports.createVenue = async (data) => {
  try {
    const venue = await Venue.create(data);
    return { status: true, data: venue };
  } catch (error) {
    return { status: false, message: error.message };
  }
};

// 🔹 Get All
exports.getAllVenues = async () => {
  try {
    const venues = await Venue.findAll({
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: Term,
          as: "term",
          attributes: [
            "id",
            "termName",
            "startDate",
            "endDate",
            "exclusionDates",
            "totalSessions",
          ],
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
              ],
            },
          ],
        },
      ],
    });

    // ✅ Loop through venues → term → sessionPlanGroup
    for (const venue of venues) {
      const term = venue.term;
      const spg = term?.sessionPlanGroup;

      if (spg && spg.levels) {
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

        // ✅ Fetch exercises
        let exercises = [];
        if (uniqueIds.length > 0) {
          exercises = await SessionExercise.findAll({
            where: { id: uniqueIds },
            attributes: ["id", "title", "description", "duration"],
          });
        }

        // ✅ Replace levels with parsed JSON + attach exercises
        spg.dataValues.levels = parsedLevels;
        spg.dataValues.exercises = exercises;
      }
    }

    return { status: true, data: venues };
  } catch (error) {
    console.error("❌ getAllVenues Error:", error.message);
    return { status: false, message: error.message };
  }
};

// 🔹 Get By ID

exports.getVenueById = async (id) => {
  try {
    const venue = await Venue.findByPk(id, {
      include: [
        {
          model: Term,
          as: "term",
          attributes: [
            "id",
            "termName",
            "startDate",
            "endDate",
            "exclusionDates",
            "totalSessions",
          ],
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
              ],
            },
          ],
        },
      ],
    });

    if (!venue) {
      return { status: false, message: "Venue not found." };
    }

    const term = venue.term;
    const spg = term?.sessionPlanGroup;

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

    return { status: true, data: venue };
  } catch (error) {
    console.error("❌ getVenueById Error:", error.message);
    return { status: false, message: error.message };
  }
};

// 🔹 Update
exports.updateVenue = async (id, data) => {
  try {
    const venue = await Venue.findByPk(id);
    if (!venue) {
      return { status: false, message: "Venue not found." };
    }

    await venue.update(data);

    const updatedVenue = await Venue.findByPk(id, {
      include: [
        {
          model: Term,
          as: "term",
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
              ],
            },
          ],
        },
      ],
    });

    return {
      status: true,
      data: updatedVenue,
      message: "Venue updated successfully.",
    };
  } catch (error) {
    return { status: false, message: "Update failed. " + error.message };
  }
};

// 🔹 Delete
exports.deleteVenue = async (id) => {
  try {
    const deleted = await Venue.destroy({ where: { id } });
    return { status: deleted === 1 };
  } catch (error) {
    return { status: false, message: error.message };
  }
};
