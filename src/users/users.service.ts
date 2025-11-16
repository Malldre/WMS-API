import { Injectable, OnModuleInit } from '@nestjs/common';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService implements OnModuleInit {
  private users: User[] = [];

  async onModuleInit() {
    // Initialize users with hashed passwords
    this.users = [
      {
        id: 1,
        username: 'admin',
        password: await bcrypt.hash('admin123', 10),
      },
      {
        id: 2,
        username: 'user',
        password: await bcrypt.hash('user123', 10),
      },
    ];
  }

  async findOne(username: string): Promise<User | undefined> {
    return this.users.find(user => user.username === username);
  }

  async createUser(username: string, password: string): Promise<User> {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser: User = {
      id: this.users.length + 1,
      username,
      password: hashedPassword,
    };
    this.users.push(newUser);
    return newUser;
  }
}
