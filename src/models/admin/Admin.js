const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/db");

const Admin = sequelize.define(
  "Admin",
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    profile: { type: DataTypes.STRING, allowNull: true },
    firstName: { type: DataTypes.STRING(100), allowNull: false },
    lastName: { type: DataTypes.STRING(100), allowNull: true },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    password: { type: DataTypes.STRING(255), allowNull: false },
    passwordHint: { type: DataTypes.STRING, allowNull: true },
    position: { type: DataTypes.STRING, allowNull: true },
    phoneNumber: { type: DataTypes.STRING, allowNull: true },
    roleId: {
      type: DataTypes.INTEGER.UNSIGNED,
      references: { model: "admin_roles", key: "id" },
    },
    countryId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      references: { model: "countries", key: "id" },
      field: "country_id",
    },
    stateId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      references: { model: "states", key: "id" },
      field: "state_id",
    },
    cityId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      references: { model: "cities", key: "id" },
      field: "city_id",
    },
    city: { type: DataTypes.STRING(100), allowNull: true },
    resetOtp: { type: DataTypes.STRING(10), allowNull: true },
    resetOtpExpiry: { type: DataTypes.DATE, allowNull: true },
    status: {
      type: DataTypes.ENUM("active", "inactive", "suspend"),
      defaultValue: "active",
    },
  },
  {
    tableName: "admins",
    timestamps: true,
  }
);

Admin.associate = (models) => {
  Admin.belongsTo(models.AdminRole, { foreignKey: "roleId", as: "role" });
  Admin.hasMany(models.AdminHasPermission, {
    foreignKey: "adminId",
    as: "permissions",
  });

  Admin.hasMany(models.ActivityLog, {
    foreignKey: "adminId",
    as: "activityLogs",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });

  Admin.hasMany(models.CustomNotification, {
    foreignKey: "adminId",
    as: "customNotifications",
    onDelete: "CASCADE",
  });
  Admin.hasMany(models.CustomNotificationRead, {
    foreignKey: "adminId",
    as: "customNotificationReads",
    onDelete: "SET NULL",
  });

  // ✅ Location associations
  Admin.belongsTo(models.Country, {
    foreignKey: "countryId",
    as: "country",
  });

  Admin.belongsTo(models.State, {
    foreignKey: "stateId",
    as: "state",
  });

  Admin.belongsTo(models.City, {
    foreignKey: "cityId",
    as: "cityDetails",
  });

  Admin.hasMany(models.DiscountUsage, {
    foreignKey: "adminId",
    as: "discountUsages",
    onDelete: "CASCADE",
  });

  // Notifications sent by admin
  Admin.hasMany(models.Notification, {
    foreignKey: "adminId",
    as: "notifications",
    onDelete: "CASCADE",
  });

  // Notifications read by admin
  Admin.hasMany(models.NotificationRead, {
    foreignKey: "adminId",
    as: "notificationReads",
    onDelete: "SET NULL",
  });
};

module.exports = Admin;
