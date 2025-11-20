import { Controller, Post, Body, ConflictException, Get, Put, Delete } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}
  
  @Get()
  async getAllUsers() {
    const users = await this.usersService.getAllUsers();
    return users;
  }

  @Get(':uuid')
  async getUserById(uuid: string) {
    const user = await this.usersService.findById(uuid);
    return user;
  }

  @Get('username/:username')
  async getUserByUsername(username: string) {
    const user = await this.usersService.findOne(username);
    return user;
  }

  @Put(':uuid')
  async updateUser(uuid: string, @Body() body: { username: string; email: string; password: string }) {
    const { username, email, password } = body;

    const user = await this.usersService.updateUser(uuid, username, email, password);

    return {
      id: user.uuid,
      username: user.username,
      message: 'User updated successfully',
    };
  }

  @Delete(':uuid')
  async deleteUser(uuid: string) {
    await this.usersService.deleteUser(uuid);
    return {
      message: 'User deleted successfully',
    };
  }

  @Post('register')
  async register(@Body() body: { username: string; email: string; password: string }) {
    const { username, email, password } = body;

    const existingUser = await this.usersService.findOne(username);
    if (existingUser) {
      throw new ConflictException('Username already exists');
    }

    const user = await this.usersService.createUser(username, email, password);

    return {
      id: user.uuid,
      username: user.username,
      message: 'User registered successfully',
    };
  }
}