const { DataTypes } = require("sequelize");
const { sequelize } = require("../../../config/db");

const SessionPlanGroup = sequelize.define(
  "SessionPlanGroup",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    level: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    groupName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    videoUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    bannerUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    player: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    skillOfTheDay: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    // ✅ New field for referencing session_exercises
    sessionExerciseId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    tableName: "session_plan_groups",
    timestamps: true,
  }
);

module.exports = SessionPlanGroup;
