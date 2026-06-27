import { pgTable, serial, text, integer, doublePrecision, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const properties = pgTable('properties', {
  id: text('id').primaryKey(), // We use strings like prop-1, prop-2, etc. or unique IDs
  address: text('address').notNull(),
  city: text('city').notNull(),
  state: text('state').notNull(),
  price: doublePrecision('price').notNull(),
  beds: integer('beds').notNull(),
  baths: doublePrecision('baths').notNull(),
  sqft: integer('sqft').notNull(),
  type: text('type').notNull(), // 'Single Family' | 'Multi Family' | 'Condo' | 'Townhouse'
  status: text('status').notNull(), // 'Active' | 'Under Contract' | 'Closed' | 'Off Market'
  monthlyRent: doublePrecision('monthly_rent'),
  monthlyNOI: doublePrecision('monthly_noi'),
  purchasePrice: doublePrecision('purchase_price'),
  capRate: doublePrecision('cap_rate'),
  equityGain: doublePrecision('equity_gain'),
  notes: text('notes'),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const deals = pgTable('deals', {
  id: text('id').primaryKey(), // deal-1, deal-2, etc.
  clientName: text('client_name').notNull(),
  propertyAddress: text('property_address').notNull(),
  stage: text('stage').notNull(), // Lead | Showing | Offer Made | Under Contract | Closed | Fell Through
  price: doublePrecision('price').notNull(),
  commissionRate: doublePrecision('commission_rate').notNull(),
  projectedCommission: doublePrecision('projected_commission').notNull(),
  date: text('date').notNull(),
  type: text('type').notNull(), // Buyer | Seller
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const clients = pgTable('clients', {
  id: text('id').primaryKey(), // client-1, client-2, etc.
  name: text('name').notNull(),
  role: text('role').notNull(), // Buyer | Seller | Both
  email: text('email').notNull(),
  phone: text('phone').notNull(),
  budget: doublePrecision('budget').notNull(),
  notes: text('notes'),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const financials = pgTable('financials', {
  id: serial('id').primaryKey(),
  month: text('month').notNull(), // Jan, Feb, Mar, etc.
  commissionEarned: doublePrecision('commission_earned').notNull(),
  projectedIncome: doublePrecision('projected_income').notNull(),
  rentalIncome: doublePrecision('rental_income').notNull(),
  noi: doublePrecision('noi').notNull(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Relationships
export const usersRelations = relations(users, ({ many }) => ({
  properties: many(properties),
  deals: many(deals),
  clients: many(clients),
  financials: many(financials),
}));

export const propertiesRelations = relations(properties, ({ one }) => ({
  user: one(users, {
    fields: [properties.userId],
    references: [users.id],
  }),
}));

export const dealsRelations = relations(deals, ({ one }) => ({
  user: one(users, {
    fields: [deals.userId],
    references: [users.id],
  }),
}));

export const clientsRelations = relations(clients, ({ one }) => ({
  user: one(users, {
    fields: [clients.userId],
    references: [users.id],
  }),
}));

export const financialsRelations = relations(financials, ({ one }) => ({
  user: one(users, {
    fields: [financials.userId],
    references: [users.id],
  }),
}));
