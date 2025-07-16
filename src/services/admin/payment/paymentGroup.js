const { PaymentGroup, PaymentPlan } = require("../../../models");
const { Op } = require("sequelize");

// ✅ Create a group
exports.createPaymentGroup = async ({ name, description }) => {
  try {
    const group = await PaymentGroup.create({
      name,
      description,
      createdAt: new Date(), // Optional if timestamps: true in model
    });
    return {
      status: true,
      data: group,
      message: "Payment group created successfully.",
    };
  } catch (error) {
    return {
      status: false,
      message: `Unable to create payment group. ${error.message}`,
    };
  }
};

// ✅ Get all groups
exports.getAllPaymentGroups = async () => {
  try {
    const groups = await PaymentGroup.findAll({
      include: [
        {
          model: PaymentPlan,
          as: "paymentPlans",
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return {
      status: true,
      data: groups,
      message: `${groups.length} payment group(s) found.`,
    };
  } catch (error) {
    return {
      status: false,
      message: `Failed to fetch payment groups. ${error.message}`,
    };
  }
};

// ✅ Get a group by ID
exports.getPaymentGroupById = async (id) => {
  try {
    const group = await PaymentGroup.findByPk(id, {
      include: [
        {
          model: PaymentPlan,
          as: "paymentPlans",
        },
      ],
    });

    if (!group) {
      return {
        status: false,
        message: "No payment group found with the provided ID.",
      };
    }

    return {
      status: true,
      data: group,
      message: "Payment group retrieved successfully.",
    };
  } catch (error) {
    return {
      status: false,
      message: `Error retrieving payment group. ${error.message}`,
    };
  }
};

// ✅ Update a group
exports.updatePaymentGroup = async (id, { name, description }) => {
  try {
    const group = await PaymentGroup.findByPk(id);

    if (!group) {
      return {
        status: false,
        message: "Cannot update. Payment group not found.",
      };
    }

    await group.update({ name, description });

    return {
      status: true,
      data: group,
      message: "Payment group updated successfully.",
    };
  } catch (error) {
    return {
      status: false,
      message: `Failed to update group. ${error.message}`,
    };
  }
};

// ✅ Delete a group
exports.deletePaymentGroup = async (id) => {
  try {
    const group = await PaymentGroup.findByPk(id);

    if (!group) {
      return {
        status: false,
        message: "Cannot delete. Payment group not found.",
      };
    }

    await group.destroy();

    return {
      status: true,
      message: "Payment group deleted successfully.",
    };
  } catch (error) {
    return {
      status: false,
      message: `Failed to delete group. ${error.message}`,
    };
  }
};
