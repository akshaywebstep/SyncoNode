const { DataTypes } = require("sequelize");
const { sequelize } = require("../../../config/db");

const Venue = sequelize.define(
  "Venue",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    area: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    facility: {
      type: DataTypes.ENUM("Indoor", "Outdoor"),
      allowNull: false,
    },
    parkingNote: {
      type: DataTypes.TEXT,
    },
    congestionNote: {
      type: DataTypes.TEXT,
    },
    paymentPlanId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    // 🔗 NEW: Link to the terms table
    termId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "terms", // must match the table name of Term
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    },
  },
  {
    tableName: "venues",
    timestamps: true,
  }
);

module.exports = Venue;
