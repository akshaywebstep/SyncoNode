const { DataTypes } = require("sequelize");
const { sequelize } = require("../../../config/db");

const ClassSchedule = sequelize.define(
  "ClassSchedule",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    className: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    capacity: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    day: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    startTime: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    endTime: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    allowFreeTrial: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    facility: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    venueId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "venues", // ✅ Table name for Venue
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
  },
  {
    tableName: "class_schedules",
    timestamps: true,
  }
);

module.exports = ClassSchedule;
