const db = require("../../config/drizzle");
const {
  users,
  events,
  ministries,
  prayerRequests,
  contactSubmissions,
  newsletterSubscriptions,
} = require("../../db/schema");
const { successResponse, errorResponse } = require("../../utils/response");
const { sql } = require("drizzle-orm");

/**
 * Get dashboard statistics (admin only)
 */
const getDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalEvents,
      totalMinistries,
      totalPrayerRequests,
      totalContacts,
      totalSubscriptions,
      pendingPrayerRequests,
      newContacts,
    ] = await Promise.all([
      db.select({ count: sql`count(*)` }).from(users),
      db.select({ count: sql`count(*)` }).from(events),
      db.select({ count: sql`count(*)` }).from(ministries),
      db.select({ count: sql`count(*)` }).from(prayerRequests),
      db.select({ count: sql`count(*)` }).from(contactSubmissions),
      db
        .select({ count: sql`count(*)` })
        .from(newsletterSubscriptions)
        .where(sql`is_active = true`),
      db
        .select({ count: sql`count(*)` })
        .from(prayerRequests)
        .where(sql`status = 'PENDING'`),
      db
        .select({ count: sql`count(*)` })
        .from(contactSubmissions)
        .where(sql`status = 'NEW'`),
    ]);

    // Extract numeric counts
    const [u] = totalUsers;
    const [e] = totalEvents;
    const [m] = totalMinistries;
    const [p] = totalPrayerRequests;
    const [c] = totalContacts;
    const [s] = totalSubscriptions;
    const [pp] = pendingPrayerRequests;
    const [nc] = newContacts;

    return successResponse(
      res,
      {
        users: Number(u?.count || 0),
        events: Number(e?.count || 0),
        ministries: Number(m?.count || 0),
        prayerRequests: Number(p?.count || 0),
        contacts: Number(c?.count || 0),
        subscriptions: Number(s?.count || 0),
        pendingPrayerRequests: Number(pp?.count || 0),
        newContacts: Number(nc?.count || 0),
      },
      "Dashboard statistics retrieved successfully",
    );
  } catch (error) {
    console.error("Get dashboard stats error:", error);
    return errorResponse(res, "Failed to retrieve dashboard statistics", 500);
  }
};

module.exports = {
  getDashboardStats,
};
