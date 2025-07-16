const { DataTypes } = require("sequelize");
const { sequelize } = require("../../../config/db");

const ClassSession = sequelize.define(
  "ClassSession",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    // ✅ Link to ClassSchedule
    classScheduleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "class_schedules", // Keep reference intact
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },

    // ✅ Reason for cancelling (from dropdown)
    cancelReason: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    // ✅ Whether members get credit
    creditMembers: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    // ✅ When was this session cancelled
    cancelledAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    // ✅ JSON stores per-tab notification info:
    // members → {notify, template, subject, body, notifyBy}
    // trialists → same
    // coaches → same
    notifyGroups: {
      type: DataTypes.JSON,
      allowNull: true,
    },
  },
  {
    tableName: "class_sessions",
    timestamps: true,
  }
);

module.exports = ClassSession;
