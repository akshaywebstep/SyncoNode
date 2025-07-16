const { ClassSession, ClassSchedule, Venue } = require("../../../models");

// ✅ Cancel a class session
exports.cancelSession = async (classScheduleId, cancelData) => {
  try {
    // ✅ Check if the class exists
    const classSchedule = await ClassSchedule.findByPk(classScheduleId);
    if (!classSchedule) {
      return { status: false, message: "Class not found" };
    }

    // ✅ Prepare cancellation payload
    const cancellationPayload = {
      classScheduleId,
      cancelReason: cancelData.cancelReason || null,
      creditMembers: cancelData.creditMembers || false,
      cancelledAt: new Date(),
      notifyGroups: cancelData.notifyGroups || null,
    };

    // ✅ Save into class_sessions
    const cancelledSession = await ClassSession.create(cancellationPayload);

    return {
      status: true,
      message: "Class session cancelled successfully",
      data: cancelledSession,
    };
  } catch (error) {
    console.error("❌ cancelSession Error:", error.message);
    return { status: false, message: error.message };
  }
};

// ✅ Get all cancelled sessions for a class
exports.getCancelledSessionsByClass = async (classScheduleId) => {
  try {
    const sessions = await ClassSession.findAll({
      where: { classScheduleId },
      order: [["cancelledAt", "DESC"]],
      include: [
        {
          model: ClassSchedule,
          as: "ClassSchedule",
          attributes: [
            "id",
            "className",
            "capacity",
            "day",
            "startTime",
            "endTime",
            "allowFreeTrial",
          ],
          include: [
            {
              model: Venue,
              as: "venue",
              attributes: ["id", "name", "address"],
            },
          ],
        },
      ],
    });

    // ✅ Parse notifyGroups for each session
    const formatted = sessions.map((session) => {
      let parsedNotifyGroups = null;

      if (session.notifyGroups) {
        try {
          parsedNotifyGroups =
            typeof session.notifyGroups === "string"
              ? JSON.parse(session.notifyGroups)
              : session.notifyGroups;
        } catch (err) {
          console.warn(
            `⚠️ Failed to parse notifyGroups for session ${session.id}`
          );
          parsedNotifyGroups = session.notifyGroups; // leave as-is if invalid
        }
      }

      return {
        ...session.toJSON(),
        notifyGroups: parsedNotifyGroups,
      };
    });

    return { status: true, data: formatted };
  } catch (error) {
    console.error("❌ getCancelledSessionsByClass Error:", error.message);
    return { status: false, message: error.message };
  }
};
