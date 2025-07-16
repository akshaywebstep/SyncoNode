const { sequelize } = require("../config/db");

// =================== Import All Models =================== //
const models = {
  // 🌐 Core
  Admin: require("./admin/Admin"),
  EmailConfig: require("./Email"),

  // 📋 Activity & Logs
  ActivityLog: require("./admin/ActivityLog"),

  // 👥 Admin Roles & Permission
  AdminRole: require("./admin/AdminRole"),
  AdminPermission: require("./admin/permission/AdminPermission"),
  AdminHasPermission: require("./admin/permission/AdminHasPermission"),

  // 🔔 Notifications
  Notification: require("./admin/notification/Notification"),
  NotificationRead: require("./admin/notification/NotificationRead"),
  CustomNotification: require("./admin/notification/CustomNotification"),
  CustomNotificationRead: require("./admin/notification/CustomNotificationRead"),

  // 💳 Payment System
  PaymentPlan: require("./admin/payment/PaymentPlan"),
  PaymentGroup: require("./admin/payment/PaymentGroup"),
  PaymentGroupHasPlan: require("./admin/payment/PaymentGroupHasPlan"),

  // 🎟️ Discount System
  Discount: require("./admin/discount/Discount"),
  DiscountAppliesTo: require("./admin/discount/DiscountAppliesTo"),
  DiscountUsage: require("./admin/discount/DiscountUsage"),

  // 🌍 Location System
  Country: require("./admin/location/Country"),
  State: require("./admin/location/State"),
  City: require("./admin/location/City"),

  //Session Plan
  SessionExercise: require("./admin/sessionPlan/SessionExercise"),
  SessionPlanGroup: require("./admin/sessionPlan/SessionPlanGroup"),

  //Terms and Dates
  TermGroup: require("./admin/termAndDates/TermGroup"),
  Term: require("./admin/termAndDates/Term"),

  //Venue
  Venue: require("./admin/venue/venue"),
  //Class Schedule
  ClassSchedule: require("./admin/classSchedule/ClassSchedule"),
  //cancel class session
  ClassSession: require("./admin/classSchedule/CancelClass"),
};

// =================== Apply Model-Level Associations =================== //
Object.values(models).forEach((model) => {
  if (typeof model.associate === "function") {
    model.associate(models);
  }
});

// ====================== 🔗 Manual Relationships ====================== //

const {
  Admin,
  AdminRole,
  EmailConfig,
  ActivityLog,
  Notification,
  NotificationRead,
  CustomNotification,
  CustomNotificationRead,
  Country,
  State,
  City,
  PaymentPlan,
  PaymentGroup,
  PaymentGroupHasPlan,
  Discount,
  DiscountAppliesTo,
  DiscountUsage,
  SessionExercise,
  SessionPlanGroup,
  TermGroup,
  Term,
  Venue,
  ClassSchedule,
  ClassSession,
} = models;

// link with session exercise
SessionPlanGroup.belongsTo(SessionExercise, {
  foreignKey: "sessionExerciseIds",
  as: "exercise",
});

// ========== Term ↔ TermGroup ==========
Term.belongsTo(TermGroup, {
  foreignKey: "termGroupId",
  as: "termGroup",
});
TermGroup.hasMany(Term, {
  foreignKey: "termGroupId",
  as: "terms",
});

// ========== Term ↔ SessionPlanGroup ==========
Term.belongsTo(SessionPlanGroup, {
  foreignKey: "sessionPlanGroupId",
  as: "sessionPlanGroup",
});
SessionPlanGroup.hasMany(Term, {
  foreignKey: "sessionPlanGroupId",
  as: "terms",
});

// venue
Venue.associate = (models) => {
  Venue.belongsTo(models.Term, {
    foreignKey: "termId",
    as: "term",
    onUpdate: "CASCADE",
    onDelete: "SET NULL",
  });
};

Venue.hasMany(ClassSchedule, {
  foreignKey: "venueId",
  as: "classSchedules",
});

// ✅ Define association (ClassSchedule belongsTo Venue)
ClassSchedule.belongsTo(Venue, {
  foreignKey: "venueId",
  as: "venue",
});

Venue.belongsTo(Term, { foreignKey: "termId", as: "term" });

// ✅ Association with ClassSchedule
ClassSchedule.hasMany(ClassSession, { foreignKey: "classScheduleId" });
ClassSession.belongsTo(ClassSchedule, { foreignKey: "classScheduleId" });

// ====================== 📦 Module Exports ====================== //
module.exports = {
  sequelize,
  Admin,
  AdminRole,

  ActivityLog,
  EmailConfig,

  Notification,
  NotificationRead,
  CustomNotification,
  CustomNotificationRead,

  PaymentPlan,
  PaymentGroup,
  PaymentGroupHasPlan,

  Discount,
  DiscountAppliesTo,
  DiscountUsage,

  Country,
  State,
  City,

  SessionExercise,
  SessionPlanGroup,

  TermGroup,
  Term,

  Venue,
  ClassSchedule,
  ClassSession,
};
