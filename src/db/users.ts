import { db } from './index.ts';
import { users } from './schema.ts';
import { eq } from 'drizzle-orm';

export interface UserInput {
  uid: string;
  email: string;
  fullName?: string;
  company?: string;
  role?: string;
}

export async function getOrCreateUser(input: UserInput) {
  try {
    const result = await db
      .insert(users)
      .values({
        uid: input.uid,
        email: input.email,
        fullName: input.fullName || input.email.split('@')[0],
        company: input.company || 'Enterprise Analytics',
        role: input.role || 'Data Analyst',
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          email: input.email,
          ...(input.fullName ? { fullName: input.fullName } : {}),
          ...(input.company ? { company: input.company } : {}),
          ...(input.role ? { role: input.role } : {}),
        },
      })
      .returning();

    return result[0];
  } catch (error) {
    console.error('Failed to get or create user in database:', error);
    throw new Error('Database user sync failed.', { cause: error });
  }
}

export async function getUserByUid(uid: string) {
  try {
    const result = await db.select().from(users).where(eq(users.uid, uid)).limit(1);
    return result[0] || null;
  } catch (error) {
    console.error('Failed to lookup user by UID in database:', error);
    throw new Error('Database user lookup failed.', { cause: error });
  }
}
