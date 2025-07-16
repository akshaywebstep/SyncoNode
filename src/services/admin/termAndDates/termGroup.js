// const TermGroup = require("../../../models");
const { TermGroup } = require("../../../models"); // ✅ Correct model

exports.createGroup = async ({ name }) => {
  try {
    const group = await TermGroup.create({ name });
    return { status: true, data: group, message: "Term group created." };
  } catch (error) {
    return { status: false, message: "Create group failed. " + error.message };
  }
};

exports.getAllGroups = async () => {
  try {
    const groups = await TermGroup.findAll({ order: [["createdAt", "DESC"]] });
    return { status: true, data: groups };
  } catch (error) {
    return { status: false, message: "Fetch groups failed. " + error.message };
  }
};

exports.getGroupById = async (id) => {
  try {
    const group = await TermGroup.findByPk(id);
    if (!group) return { status: false, message: "Group not found." };
    return { status: true, data: group };
  } catch (error) {
    return { status: false, message: "Get group failed. " + error.message };
  }
};

exports.updateGroup = async (id, { name }) => {
  try {
    const group = await TermGroup.findByPk(id);
    if (!group) return { status: false, message: "Group not found." };

    await group.update({ name });
    return { status: true, data: group, message: "Group updated." };
  } catch (error) {
    return { status: false, message: "Update group failed. " + error.message };
  }
};

exports.deleteGroup = async (id) => {
  try {
    const group = await TermGroup.findByPk(id);
    if (!group) return { status: false, message: "Group not found." };

    await group.destroy();
    return { status: true, message: "Group deleted." };
  } catch (error) {
    return { status: false, message: "Delete group failed. " + error.message };
  }
};
