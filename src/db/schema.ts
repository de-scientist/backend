import {
  pgTable,
  text,
  varchar,
  uuid,
  timestamp,
  boolean,
  integer,
} from "drizzle-orm/pg-core";

export const blogs = pgTable("blogs", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull(),
  excerpt: text("excerpt"),
  content: text("content").notNull(),
  featuredImage: text("featuredImage"),
  author: text("author"),
  status: text("status").default("draft"), // draft | published
  tags: text("tags"), // comma-separated tags
  publishedAt: timestamp("publishedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull(),
  password: text("password").notNull(),
  name: text("name"),
  role: text("role").default("USER"),
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export const events = pgTable("events", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  date: timestamp("date").notNull(),
  time: text("time"),
  location: text("location"),
  imageUrl: text("imageUrl"),
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export const ministries = pgTable("ministries", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  icon: text("icon"),
  imageUrl: text("imageUrl"),
  slug: text("slug").notNull(),
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

// Additional tables (prayer_requests, newsletter_subscriptions, contact_submissions, executive_members, media)
export const prayerRequests = pgTable("prayer_requests", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name"),
  request: text("request").notNull(),
  isPublic: boolean("isPublic").default(false),
  status: text("status").default("PENDING"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export const newsletterSubscriptions = pgTable("newsletter_subscriptions", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull(),
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export const contactSubmissions = pgTable("contact_submissions", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  status: text("status").default("NEW"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export const executiveMembers = pgTable("executive_members", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  role: text("role").notNull(),
  imageUrl: text("imageUrl"),
  bio: text("bio"),
  email: text("email"),
  phone: text("phone"),
  order: integer("order").default(0),
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export const media = pgTable("media", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title"),
  description: text("description"),
  imageUrl: text("imageUrl").notNull(),
  category: text("category"),
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

// Members registration table
export const members = pgTable("members", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  yearOfStudy: text("yearOfStudy").notNull(),
  course: text("course").notNull(),
  ministry1: text("ministry1"),
  ministry2: text("ministry2"),
  message: text("message"),
  status: text("status").default("PENDING"), // PENDING, APPROVED, REJECTED
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

// resources table
export const resources = pgTable("resources", {
  id: uuid("id").defaultRandom().primaryKey(),

  title: text("title").notNull(),
  description: text("description"),
  url: text("url"), // file or external link
  type: text("type"), // PDF | AUDIO | VIDEO | LINK
  imageUrl: text("imageUrl"),

  isActive: boolean("isActive").default(true),

  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});
