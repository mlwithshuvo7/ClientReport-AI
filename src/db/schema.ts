import { relations } from 'drizzle-orm';
import { integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

// Users table storing account credentials and profile metadata
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  fullName: text('full_name'),
  company: text('company'),
  role: text('role'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Projects table storing user report workspaces and dataset metadata
export const projects = pgTable('projects', {
  id: text('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }),
  uid: text('uid').notNull(),
  name: text('name').notNull(),
  description: text('description'),
  data: text('data').notNull(), // Serialized JSON of datasets, cleaning history, charts, reportConfig
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Licenses table storing purchase and device activation states
export const licenses = pgTable('licenses', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull(),
  licenseKey: text('license_key').notNull(),
  tier: text('tier').notNull(),
  activatedDevices: integer('activated_devices').default(1),
  maxDevices: integer('max_devices').default(3),
  status: text('status').default('active'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Relationships
export const usersRelations = relations(users, ({ many }) => ({
  projects: many(projects),
  licenses: many(licenses),
}));

export const projectsRelations = relations(projects, ({ one }) => ({
  user: one(users, {
    fields: [projects.userId],
    references: [users.id],
  }),
}));
