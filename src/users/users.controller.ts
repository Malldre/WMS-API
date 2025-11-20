import { Controller, Post, Body, ConflictException } from '@nestjs/common';
import { UsersService } from './users.repository';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post('register')
  async register(@Body() body: { username: string; email: string; password: string }) {
    const { username, email, password } = body;

    const existingUser = await this.usersService.findOne(username);
    if (existingUser) {
      throw new ConflictException('Username already exists');
    }

    const user = await this.usersService.createUser(username, email, password);

    return {
      id: user.id,
      username: user.username,
      message: 'User registered successfully',
    };
  }
}
