const { Admin, AdminRole, Country, State, City } = require("../../models");
const { Op } = require("sequelize");

// Create admin
exports.createAdmin = async (data) => {
  try {
    const admin = await Admin.create(data);

    return {
      status: true,
      message: "Admin created successfully.",
      data: admin,
    };
  } catch (error) {
    console.error("❌ Sequelize Error in createAdmin:", error);

    return {
      status: false,
      message:
        error?.parent?.sqlMessage ||
        error?.message ||
        "Failed to create admin.",
    };
  }
};

// Find admin by email
exports.findAdminByEmail = async (email) => {
  try {
    const admin = await Admin.findOne({
      where: { email },
      include: [
        {
          model: AdminRole,
          as: "role",
          attributes: ["id", "role"],
        },
      ],
    });

    if (!admin) {
      return {
        status: false,
        message: "Admin not found with this email.",
      };
    }

    return {
      status: true,
      message: "Admin found.",
      data: admin,
    };
  } catch (error) {
    console.error("❌ Sequelize Error in findAdminByEmail:", error);

    return {
      status: false,
      message:
        error?.parent?.sqlMessage ||
        error?.message ||
        "Error occurred while finding admin.",
    };
  }
};

// Get admin by ID
exports.getAdminById = async (id) => {
  try {
    const admin = await Admin.findOne({
      where: { id },
      attributes: { exclude: ["password", "resetOtp", "resetOtpExpiry"] },
      include: [
        {
          model: AdminRole,
          as: "role",
          attributes: ["id", "role"],
        },
        {
          model: Country,
          as: "country",
          attributes: ["id", "name"],
        },
        /*
            {
                model: State,
                as: 'state',
                attributes: ['id', 'name'],
            },
            {
                model: City,
                as: 'city',
                attributes: ['id', 'name'],
            },
        */
      ],
    });

    if (!admin) {
      return {
        status: false,
        message: "Admin not found by ID.",
      };
    }

    return {
      status: true,
      message: "Admin found.",
      data: admin,
    };
  } catch (error) {
    console.error("❌ Sequelize Error in getAdminById:", error);

    return {
      status: false,
      message:
        error?.parent?.sqlMessage ||
        error?.message ||
        "Error occurred while fetching admin.",
    };
  }
};

// Update admin fields by ID
exports.updateAdmin = async (adminId, updateData) => {
  try {
    const result = await Admin.update(updateData, {
      where: { id: adminId },
    });

    if (result[0] === 0) {
      return {
        status: false,
        message: "No admin updated. ID may be incorrect.",
      };
    }

    return {
      status: true,
      message: "Admin updated successfully.",
    };
  } catch (error) {
    console.error("❌ Sequelize Error in updateAdmin:", error);

    return {
      status: false,
      message:
        error?.parent?.sqlMessage ||
        error?.message ||
        "Failed to update admin.",
    };
  }
};

// Get all admins
exports.getAllAdmins = async () => {
  try {
    const admins = await Admin.findAll({
      attributes: { exclude: ["password", "resetOtp", "resetOtpExpiry"] },
      include: [
        {
          model: AdminRole,
          as: "role",
          attributes: ["id", "role"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return {
      status: true,
      message: `Fetched ${admins.length} admin(s) successfully.`,
      data: admins,
    };
  } catch (error) {
    console.error("❌ Sequelize Error in getAllAdmins:", error);

    return {
      status: false,
      message:
        error?.parent?.sqlMessage ||
        error?.message ||
        "Failed to fetch admins.",
    };
  }
};

// Update password by admin ID
exports.updatePasswordById = async (id, newPassword) => {
  try {
    const result = await Admin.update(
      { password: newPassword },
      { where: { id } }
    );

    if (result[0] === 0) {
      return {
        status: false,
        message: "No admin updated. ID may be incorrect.",
      };
    }

    return {
      status: true,
      message: "Password updated successfully.",
    };
  } catch (error) {
    console.error("❌ Sequelize Error in updatePasswordById:", error);

    return {
      status: false,
      message:
        error?.parent?.sqlMessage ||
        error?.message ||
        "Error updating password.",
    };
  }
};

// Save OTP to admin
exports.saveOtpToAdmin = async (adminId, otp, expiry) => {
  try {
    const result = await Admin.update(
      {
        resetOtp: otp,
        resetOtpExpiry: expiry,
      },
      {
        where: { id: adminId },
      }
    );

    if (result[0] === 0) {
      return {
        status: false,
        message: "Failed to save OTP. Admin not found.",
      };
    }

    return {
      status: true,
      message: "OTP saved successfully.",
    };
  } catch (error) {
    console.error("❌ Sequelize Error in saveOtpToAdmin:", error);

    return {
      status: false,
      message:
        error?.parent?.sqlMessage || error?.message || "Error saving OTP.",
    };
  }
};

// Find admin by email and valid OTP
exports.findAdminByEmailAndValidOtp = async (email, otp) => {
  try {
    const admin = await Admin.findOne({
      where: {
        email,
        resetOtp: otp,
        resetOtpExpiry: {
          [Op.gt]: new Date(),
        },
      },
    });

    if (!admin) {
      return {
        status: false,
        message: "Invalid or expired OTP.",
      };
    }

    return {
      status: true,
      message: "Valid OTP found.",
      data: admin,
    };
  } catch (error) {
    console.error("❌ Sequelize Error in findAdminByEmailAndValidOtp:", error);

    return {
      status: false,
      message:
        error?.parent?.sqlMessage || error?.message || "Error validating OTP.",
    };
  }
};

// Update password and clear OTP fields
exports.updatePasswordAndClearOtp = async (adminId, hashedPassword) => {
  try {
    const result = await Admin.update(
      {
        password: hashedPassword,
        resetOtp: null,
        resetOtpExpiry: null,
      },
      {
        where: { id: adminId },
      }
    );

    if (result[0] === 0) {
      return {
        status: false,
        message: "Failed to update password. Admin not found.",
      };
    }

    return {
      status: true,
      message: "Password updated and OTP cleared.",
    };
  } catch (error) {
    console.error("❌ Sequelize Error in updatePasswordAndClearOtp:", error);

    return {
      status: false,
      message:
        error?.parent?.sqlMessage ||
        error?.message ||
        "Error updating password and clearing OTP.",
    };
  }
};

// Delete admin by ID
exports.deleteAdmin = async (id) => {
  try {
    const result = await Admin.destroy({
      where: { id },
    });

    if (result === 0) {
      return {
        status: false,
        message: "No admin deleted. ID may be incorrect.",
      };
    }

    return {
      status: true,
      message: "Admin deleted successfully.",
    };
  } catch (error) {
    console.error("❌ Sequelize Error in deleteAdmin:", error);

    return {
      status: false,
      message:
        error?.parent?.sqlMessage ||
        error?.message ||
        "Failed to delete admin.",
    };
  }
};
