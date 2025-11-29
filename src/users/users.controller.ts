import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async getCurrentUser(@Request() req) {
    return await this.usersService.findByUuid(req.user.uuid);
  }

  @Get()
  async findAll() {
    return await this.usersService.findAll();
  }

  @Get(':uuid')
  async findByUuid(@Param('uuid') uuid: string) {
    return await this.usersService.findByUuid(uuid);
  }

  @Get('username/:username')
  async findByUsername(@Param('username') username: string) {
    return await this.usersService.findByUsername(username);
  }

  @Put(':uuid')
  async update(
    @Param('uuid') uuid: string,
    @Body() userData: {
      username?: string;
      email?: string;
      password?: string;
      userGroupId?: number;
      status?: 'ACTIVE' | 'INACTIVE' | 'BLOCKED';
    },
  ) {
    return await this.usersService.updateUser(uuid, userData);
  }

  @Delete(':uuid')
  async delete(@Param('uuid') uuid: string) {
    return await this.usersService.deleteUser(uuid);
  }

  @Post()
  async create(
    @Body()
    userData: {
      username: string;
      email: string;
      password: string;
      userGroupId?: number;
    },
  ) {
    return await this.usersService.create(userData);
  }
}