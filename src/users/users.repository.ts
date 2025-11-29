import { Inject, Injectable } from '@nestjs/common';
import { DB_CONNECTION } from '../db/db.module';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../db/schema';
import { eq, desc, sql } from 'drizzle-orm';

type UserInsert = typeof schema.users.$inferInsert;

@Injectable()
export class UsersRepository {
  constructor(
    @Inject(DB_CONNECTION)
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  /**
   * Find all users with related data (WITHOUT password)
   */
  async findAll(): Promise<any[]> {
    const result = await this.db
      .select({
        // User fields (NO password!)
        uuid: schema.users.uuid,
        username: schema.users.username,
        name: schema.users.name,
        email: schema.users.email,
        userGroupId: schema.users.userGroupId,
        status: schema.users.status,
        createdAt: schema.users.createdAt,

        // User group data (JOIN)
        userGroupUuid: schema.userGroups.uuid,
        userGroupName: schema.userGroups.name,
        userGroupDescription: schema.userGroups.description,
      })
      .from(schema.users)
      .leftJoin(
        schema.userGroups,
        eq(schema.users.userGroupId, schema.userGroups.id),
      )
      .orderBy(desc(schema.users.createdAt));

    return result;
  }

  /**
   * Find user by UUID with related data (WITHOUT password)
   */
  async findByUuid(uuid: string): Promise<any | null> {
    const result = await this.db
      .select({
        // User fields (NO password!)
        uuid: schema.users.uuid,
        username: schema.users.username,
        name: schema.users.name,
        email: schema.users.email,
        userGroupId: schema.users.userGroupId,
        status: schema.users.status,
        createdAt: schema.users.createdAt,

        // User group data (JOIN)
        userGroupUuid: schema.userGroups.uuid,
        userGroupName: schema.userGroups.name,
        userGroupDescription: schema.userGroups.description,
      })
      .from(schema.users)
      .leftJoin(
        schema.userGroups,
        eq(schema.users.userGroupId, schema.userGroups.id),
      )
      .where(eq(schema.users.uuid, uuid))
      .limit(1);

    return result[0] || null;
  }

  /**
   * Find user by username WITH password (for authentication only)
   * Returns full user record including internal id and password hash
   */
  async findByUsernameWithPassword(username: string): Promise<any | null> {
    const result = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.username, username))
      .limit(1);

    return result[0] || null;
  }

  /**
   * Find user by email WITH password (for authentication only)
   * Returns full user record including internal id and password hash
   */
  async findByEmailWithPassword(email: string): Promise<any | null> {
    const result = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, email))
      .limit(1);

    return result[0] || null;
  }

  /**
   * Find user by username (WITHOUT password - for public API)
   */
  async findByUsername(username: string): Promise<any | null> {
    const result = await this.db
      .select({
        // User fields (NO password!)
        uuid: schema.users.uuid,
        username: schema.users.username,
        name: schema.users.name,
        email: schema.users.email,
        userGroupId: schema.users.userGroupId,
        status: schema.users.status,
        createdAt: schema.users.createdAt,

        // User group data (JOIN)
        userGroupUuid: schema.userGroups.uuid,
        userGroupName: schema.userGroups.name,
        userGroupDescription: schema.userGroups.description,
      })
      .from(schema.users)
      .leftJoin(
        schema.userGroups,
        eq(schema.users.userGroupId, schema.userGroups.id),
      )
      .where(eq(schema.users.username, username))
      .limit(1);

    return result[0] || null;
  }

  /**
   * Create new user
   */
  async create(userData: UserInsert): Promise<any> {
    const newUser = await this.db
      .insert(schema.users)
      .values(userData)
      .returning();

    // Return created user without password
    return await this.findByUuid(newUser[0].uuid);
  }

  /**
   * Update user by UUID
   */
  async update(uuid: string, userData: Partial<UserInsert>): Promise<any | null> {
    const updatedUser = await this.db
      .update(schema.users)
      .set(userData)
      .where(eq(schema.users.uuid, uuid))
      .returning();

    if (!updatedUser[0]) {
      return null;
    }

    // Return updated user without password
    return await this.findByUuid(updatedUser[0].uuid);
  }

  /**
   * Delete user by UUID
   */
  async delete(uuid: string): Promise<any | null> {
    // Get user data before deletion (without password)
    const user = await this.findByUuid(uuid);

    if (!user) {
      return null;
    }

    await this.db
      .delete(schema.users)
      .where(eq(schema.users.uuid, uuid));

    return user;
  }

  /**
   * Check if username exists
   */
  async usernameExists(username: string): Promise<boolean> {
    const result = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(schema.users)
      .where(eq(schema.users.username, username));

    return Number(result[0].count) > 0;
  }

  /**
   * Check if email exists
   */
  async emailExists(email: string): Promise<boolean> {
    const result = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(schema.users)
      .where(eq(schema.users.email, email));

    return Number(result[0].count) > 0;
  }
}
