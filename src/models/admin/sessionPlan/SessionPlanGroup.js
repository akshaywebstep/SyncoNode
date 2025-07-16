const { DataTypes } = require("sequelize");
const { sequelize } = require("../../../config/db");

const SessionPlanGroup = sequelize.define(
  "SessionPlanGroup",
  {
    groupName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    bannerUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    videoUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    sessionExerciseIds: {
      type: DataTypes.JSON, // ✅ stores all exercise IDs in one array
      allowNull: true,
    },
    levels: {
      type: DataTypes.JSON, // ✅ structured JSON per level
      allowNull: true,
    },
  },
  {
    tableName: "session_plan_groups",
    timestamps: true,
  }
);

module.exports = SessionPlanGroup;
