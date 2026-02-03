import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import { db } from "../src/config/drizzle";
import {
  users,
  ministries,
  events as eventsTable,
  executiveMembers,
} from "../src/db/schema";
import { eq } from "drizzle-orm";

async function main() {
  console.log("🌱 Safe seed script started...");

  if (!process.env.DATABASE_URL) {
    console.error("❌ DATABASE_URL is missing");
    return;
  }

  try {
    /**
     * =========================
     * ADMIN USER
     * =========================
     */
    const existingAdmin = await db
      .select()
      .from(users)
      .where(eq(users.email, "admin@mutcu.ac.ke"));

    if (!existingAdmin.length) {
      const hashedPassword = await bcrypt.hash("admin123", 10);

      await db.insert(users).values({
        id: randomUUID(),
        email: "admin@mutcu.ac.ke",
        password: hashedPassword,
        name: "Admin User",
        role: "ADMIN",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      console.log("✅ Admin user created");
    } else {
      console.log("ℹ️ Admin user already exists — skipped");
    }

    /**
     * =========================
     * MINISTRIES
     * =========================
     */
    const ministriesData = [
      {
        name: "Music Ministry",
        slug: "music-ministry",
        description: "Leading worship through music.",
        icon: "fa-music",
        imageUrl: "/assets/images/music1.jpg",
      },
      {
        name: "Bible Study & Discipleship",
        slug: "bible-study-discipleship",
        description: "Growing in the Word.",
        icon: "fa-book-open",
        imageUrl: "/assets/images/bs1.jpg",
      },
      {
        name: "Missions & Evangelism",
        slug: "missions-evangelism",
        description: "Sharing the Gospel.",
        icon: "fa-globe",
        imageUrl: "/assets/images/mission1.jpg",
      },
      {
        name: "Creative Arts Ministry (CREAM)",
        slug: "creative-arts",
        description: "Faith through art.",
        icon: "fa-paint-brush",
        imageUrl: "/assets/images/dance3.jpg",
      },
      {
        name: "Prayer Ministry",
        slug: "prayer-ministry",
        description: "A culture of prayer.",
        icon: "fa-pray",
        imageUrl: "/assets/images/church2.jpg",
      },
      {
        name: "Welfare Committee",
        slug: "welfare-committee",
        description: "Care and support.",
        icon: "fa-hand-holding-heart",
        imageUrl: "/assets/images/prayer1.jpg",
      },
      {
        name: "Hospitality Ministry",
        slug: "hospitality-ministry",
        description: "Welcoming all.",
        icon: "fa-handshake-angle",
        imageUrl: "/assets/images/tlp.jpg",
      },
      {
        name: "Technical Department",
        slug: "technical-department",
        description: "Technical support.",
        icon: "fa-laptop-code",
        imageUrl: "/assets/images/mbbc1.jpg",
      },
      {
        name: "Resource Mobilisation Committee (RMC)",
        slug: "rmc",
        description: "Resource innovation.",
        icon: "fa-lightbulb",
        imageUrl: "/assets/images/prayer1.jpg",
      },
    ];

    for (const ministry of ministriesData) {
      const exists = await db
        .select()
        .from(ministries)
        .where(eq(ministries.slug, ministry.slug));

      if (!exists.length) {
        await db.insert(ministries).values({
          id: randomUUID(),
          ...ministry,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        console.log(`✅ Ministry added: ${ministry.name}`);
      }
    }

    /**
     * =========================
     * EVENTS
     * =========================
     */
    const eventsData = [
      {
        title: "Prayer Kesha",
        description: "Night of prayer.",
        date: new Date("2025-09-26T19:00:00"),
        time: "7:00 PM - 9:30 PM",
        location: "MUTCU Hall",
        imageUrl: "/assets/images/church1.jpg",
      },
      {
        title: "Praise Fest",
        description: "Praise and worship.",
        date: new Date("2025-11-07T19:00:00"),
        time: "7:00 PM - 9:30 PM",
        location: "MUTCU Hall",
        imageUrl: "/assets/images/Dance1.jpg",
      },
      {
        title: "Creative Night",
        description: "Ashes to Beauty.",
        date: new Date("2025-10-10T20:00:00"),
        time: "8:00 PM - 5:30 AM",
        location: "MUTCU Hall",
        imageUrl: "/assets/images/final poster.png",
      },
    ];

    for (const event of eventsData) {
      const exists = await db
        .select()
        .from(eventsTable)
        .where(eq(eventsTable.title, event.title));

      if (!exists.length) {
        await db.insert(eventsTable).values({
          id: randomUUID(),
          ...event,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        console.log(`✅ Event added: ${event.title}`);
      }
    }

    /**
     * =========================
     * EXECUTIVE MEMBERS
     * =========================
     */
    const executives = [
      {
        name: "Ezekiel Thaara",
        role: "Chairman",
        imageUrl: "/assets/images/EZEKIEL.jpg",
        order: 1,
      },
      {
        name: "Jesca Kinya",
        role: "1st Vice Chair",
        imageUrl: "/assets/images/JES.jpg",
        order: 2,
      },
      {
        name: "Martin Gitau",
        role: "2nd Vice Chair",
        imageUrl: "/assets/images/MARTIN.jpg",
        order: 3,
      },
      {
        name: "Grace Kanyiri",
        role: "Secretary",
        imageUrl: "/assets/images/GRACE.jpg",
        order: 4,
      },
    ];

    for (const exec of executives) {
      const exists = await db
        .select()
        .from(executiveMembers)
        .where(eq(executiveMembers.name, exec.name));

      if (!exists.length) {
        await db.insert(executiveMembers).values({
          id: randomUUID(),
          ...exec,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        console.log(`✅ Executive added: ${exec.name}`);
      }
    }

    console.log("✨ Safe seeding completed — no data was harmed.");
  } catch (error) {
    console.error("❌ Seeding error:", error);
    process.exit(1);
  }
}

main();
