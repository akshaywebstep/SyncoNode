const { Venue, Term, TermGroup, SessionPlanGroup } = require("../../../models");

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
                "level",
                "videoUrl",
                "bannerUrl",
                "player",
                "skillOfTheDay",
                "description",
              ],
            },
          ],
        },
      ],
    });

    return { status: true, data: venues };
  } catch (error) {
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
                "level",
                "videoUrl",
                "bannerUrl",
                "player",
                "skillOfTheDay",
                "description",
              ],
            },
          ],
        },
      ],
    });

    if (!venue) {
      return { status: false, message: "Venue not found." };
    }

    return { status: true, data: venue };
  } catch (error) {
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
                "level",
                "videoUrl",
                "bannerUrl",
                "player",
                "skillOfTheDay",
                "description",
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
