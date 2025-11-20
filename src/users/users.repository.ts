import { Injectable, Inject } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DB_CONNECTION } from '../db/db.module';
import { users, User, NewUser } from '../db/schema';
import * as bcrypt from 'bcrypt';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

@Injectable()
export class UsersService {
  constructor(
    @Inject(DB_CONNECTION)
    private db: PostgresJsDatabase<typeof import('../db/schema')>,
  ) {}

  async findOne(username: string): Promise<User | undefined> {
    const result = await this.db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    return result[0];
  }

  async findById(id: number): Promise<User | undefined> {
    const result = await this.db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    return result[0];
  }

  async createUser(username: string, email: string,  password: string): Promise<User> {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser: NewUser = {
      username,
      email,
      password: hashedPassword,
    };

    const result = await this.db.insert(users).values(newUser).returning();
    return result[0];
  }
}
