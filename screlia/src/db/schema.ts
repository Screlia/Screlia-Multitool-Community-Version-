import { relations } from 'drizzle-orm';
import { pgTable, text, timestamp, boolean } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: text('id').primaryKey(), // Firebase Auth UID
  email: text('email').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const userSettings = pgTable('user_settings', {
  userId: text('user_id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
  includedKeywords: text('included_keywords').default(''),
  excludedKeywords: text('excluded_keywords').default(''),
  preferredDomains: text('preferred_domains').default(''),
  relevance: text('relevance').default('broad'),
  language: text('language').default('Türkçe'),
  theme: text('theme').default('system'),
  searchEngine: text('search_engine').default('google'),
  apiKey: text('api_key').default(''),
  chatgptApiKey: text('chatgpt_api_key').default(''),
  claudeApiKey: text('claude_api_key').default(''),
  aiModel: text('ai_model').default('gemini'),
  isPremium: boolean('is_premium').default(false),
  installedAddons: text('installed_addons').default(''),
});

export const usersRelations = relations(users, ({ one }) => ({
  settings: one(userSettings),
}));

export const userSettingsRelations = relations(userSettings, ({ one }) => ({
  user: one(users, {
    fields: [userSettings.userId],
    references: [users.id],
  }),
}));
