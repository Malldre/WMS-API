import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import * as bcrypt from 'bcrypt';

type UserInsert = {
  username: string;
  name?: string;
  email: string;
  password: string;
  userGroupId?: number;
  status?: 'ACTIVE' | 'INACTIVE' | 'BLOCKED';
};

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async findAll(): Promise<any[]> {
    return await this.usersRepository.findAll();
  }

  async findByUuid(uuid: string): Promise<any | null> {
    const user = await this.usersRepository.findByUuid(uuid);

    if (!user) {
      throw new NotFoundException(`User with UUID ${uuid} not found`);
    }

    return user;
  }

  async findByUsername(username: string): Promise<any | null> {
    const user = await this.usersRepository.findByUsername(username);

    if (!user) {
      throw new NotFoundException(`User with username ${username} not found`);
    }

    return user;
  }

  /**
   * Find user by username WITH password (for authentication only)
   * Used by AuthService for login validation
   */
  async findByUsernameForAuth(username: string): Promise<any | null> {
    return await this.usersRepository.findByUsernameWithPassword(username);
  }

  /**
   * Find user by email WITH password (for authentication only)
   * Used by AuthService for login validation
   */
  async findByEmailForAuth(email: string): Promise<any | null> {
    return await this.usersRepository.findByEmailWithPassword(email);
  }

  async create(userData: UserInsert): Promise<any> {
    // Check if username already exists
    const usernameExists = await this.usersRepository.usernameExists(userData.username);
    if (usernameExists) {
      throw new ConflictException('Username already exists');
    }

    // Check if email already exists
    const emailExists = await this.usersRepository.emailExists(userData.email);
    if (emailExists) {
      throw new ConflictException('Email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    // Create user
    return await this.usersRepository.create({
      ...userData,
      password: hashedPassword,
    });
  }

  /**
   * Legacy method for backward compatibility with AuthService
   * @deprecated Use create() instead
   */
  async createUser(username: string, email: string, password: string): Promise<any> {
    const hashedPassword = await bcrypt.hash(password, 10);

    return await this.usersRepository.create({
      username,
      email,
      password: hashedPassword,
    });
  }

  async updateUser(uuid: string, userData: Partial<UserInsert>): Promise<any> {
    // Check if user exists
    const existingUser = await this.usersRepository.findByUuid(uuid);
    if (!existingUser) {
      throw new NotFoundException(`User with UUID ${uuid} not found`);
    }

    // If updating username, check if new username already exists
    if (userData.username && userData.username !== existingUser.username) {
      const usernameExists = await this.usersRepository.usernameExists(userData.username);
      if (usernameExists) {
        throw new ConflictException('Username already exists');
      }
    }

    // If updating email, check if new email already exists
    if (userData.email && userData.email !== existingUser.email) {
      const emailExists = await this.usersRepository.emailExists(userData.email);
      if (emailExists) {
        throw new ConflictException('Email already exists');
      }
    }

    // Hash password if provided
    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, 10);
    }

    const updatedUser = await this.usersRepository.update(uuid, userData);

    if (!updatedUser) {
      throw new NotFoundException(`Failed to update user with UUID ${uuid}`);
    }

    return updatedUser;
  }

  async deleteUser(uuid: string): Promise<any> {
    const deletedUser = await this.usersRepository.delete(uuid);

    if (!deletedUser) {
      throw new NotFoundException(`User with UUID ${uuid} not found`);
    }

    return deletedUser;
  }
}
