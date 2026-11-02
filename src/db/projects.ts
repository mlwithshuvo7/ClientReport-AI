import { db } from './index.ts';
import { projects, users } from './schema.ts';
import { eq, desc } from 'drizzle-orm';

export async function getUserProjects(uid: string) {
  try {
    const records = await db
      .select()
      .from(projects)
      .where(eq(projects.uid, uid))
      .orderBy(desc(projects.updatedAt));

    return records.map((r) => {
      try {
        return JSON.parse(r.data);
      } catch (e) {
        return {
          id: r.id,
          name: r.name,
          description: r.description,
          updatedAt: r.updatedAt,
        };
      }
    });
  } catch (error) {
    console.error('Failed to get user projects from database:', error);
    throw new Error('Database projects query failed.', { cause: error });
  }
}

export async function saveUserProject(uid: string, projectData: any) {
  try {
    const existingUser = await db.select().from(users).where(eq(users.uid, uid)).limit(1);
    const userRecord = existingUser[0];

    const serialized = JSON.stringify(projectData);

    const result = await db
      .insert(projects)
      .values({
        id: projectData.id,
        userId: userRecord ? userRecord.id : null,
        uid,
        name: projectData.name || 'Untitled Project',
        description: projectData.description || '',
        data: serialized,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: projects.id,
        set: {
          name: projectData.name || 'Untitled Project',
          description: projectData.description || '',
          data: serialized,
          updatedAt: new Date(),
        },
      })
      .returning();

    return result[0];
  } catch (error) {
    console.error('Failed to save project in database:', error);
    throw new Error('Database project save failed.', { cause: error });
  }
}

export async function deleteUserProject(uid: string, projectId: string) {
  try {
    await db.delete(projects).where(eq(projects.id, projectId));
    return true;
  } catch (error) {
    console.error('Failed to delete project from database:', error);
    throw new Error('Database project delete failed.', { cause: error });
  }
}
