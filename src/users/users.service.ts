import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { DB_CONNECTION } from '../db/db.module';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../db/schema';
import { eq } from 'drizzle-orm';
import { omitAllInternalIds } from '../common/utils/omit-id.util';

type User = typeof schema.users.$inferSelect;
type UserInsert = typeof schema.users.$inferInsert;

@Injectable()
export class UsersService {
  constructor(
    @Inject(DB_CONNECTION)
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async findAll(): Promise<Omit<User, 'id'>[]> {
    const users = await this.db.select().from(schema.users);
    return users.map((user) => omitAllInternalIds(user));
  }

  async findByUuid(uuid: string): Promise<Omit<User, 'id'> | null> {
    const user = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.uuid, uuid))
      .limit(1);

    if (!user[0]) {
      return null;
    }

    return omitAllInternalIds(user[0]);
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, email))
      .limit(1);

    return user[0] || null;
  }

  async findByUsername(username: string): Promise<User | null> {
    const user = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.username, username))
      .limit(1);

    return user[0] || null;
  }

  async create(userData: {
    username: string;
    email: string;
    password: string;
    userGroupId?: number;
  }): Promise<Omit<User, 'id'>> {
    const newUser = await this.db
      .insert(schema.users)
      .values({
        username: userData.username,
        email: userData.email,
        password: userData.password,
        userGroupId: userData.userGroupId || null,
      })
      .returning();

    return omitAllInternalIds(newUser[0]);
  }

  async createUser(
    username: string,
    email: string,
    password: string,
  ): Promise<Omit<User, 'id'>> {
    const newUser = await this.db
      .insert(schema.users)
      .values({
        username,
        email,
        password,
      })
      .returning();

    return omitAllInternalIds(newUser[0]);
  }

  async updateUser(
    uuid: string,
    userData: Partial<UserInsert>,
  ): Promise<Omit<User, 'id'>> {
    const updatedUser = await this.db
      .update(schema.users)
      .set(userData)
      .where(eq(schema.users.uuid, uuid))
      .returning();

    if (!updatedUser[0]) {
      throw new NotFoundException(`User with UUID ${uuid} not found`);
    }

    return omitAllInternalIds(updatedUser[0]);
  }

  async deleteUser(uuid: string): Promise<Omit<User, 'id'>> {
    const deletedUser = await this.db
      .delete(schema.users)
      .where(eq(schema.users.uuid, uuid))
      .returning();

    if (!deletedUser[0]) {
      throw new NotFoundException(`User with UUID ${uuid} not found`);
    }

    return omitAllInternalIds(deletedUser[0]);
  }
}