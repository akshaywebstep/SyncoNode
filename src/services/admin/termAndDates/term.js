const { Term, TermGroup, SessionPlanGroup } = require("../../../models");

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
          attributes: ["id", "name"], // Only name & ID needed from TermGroup
        },
        {
          model: SessionPlanGroup,
          as: "sessionPlanGroup",
          attributes: [
            "id",
            "level",
            "groupName",
            "videoUrl",
            "bannerUrl",
            "player",
            "skillOfTheDay",
            "description",
            "createdAt",
            "updatedAt",
          ],
        },
      ],
    });

    return { status: true, data: terms };
  } catch (error) {
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
            "level",
            "groupName",
            "videoUrl",
            "bannerUrl",
            "player",
            "skillOfTheDay",
            "description",
            "createdAt",
            "updatedAt",
          ],
        },
      ],
    });

    if (!term) {
      return { status: false, message: "Term not found." };
    }

    return { status: true, data: term };
  } catch (error) {
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
