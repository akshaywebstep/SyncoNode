const { DataTypes } = require("sequelize");
const { sequelize } = require("../../../config/db");

const Term = sequelize.define(
  "Term",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    termName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    startDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    endDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    exclusionDates: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    totalSessions: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    // 🔗 Link to session_plan_groups
    sessionPlanGroupId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "session_plan_groups",
        key: "id",
      },
    },

    // 🔗 Link to term_groups
    termGroupId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "term_groups",
        key: "id",
      },
    },
  },
  {
    tableName: "terms",
    timestamps: true,
  }
);

module.exports = Term;
