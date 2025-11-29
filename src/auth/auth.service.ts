import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmailForAuth(email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const { password: _, id: __, ...result } = user;
    return result;
  }

  async login(user: any) {
    const payload = {
      username: user.username,
      sub: user.uuid,
      userId: user.id,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        uuid: user.uuid,
        username: user.username,
      },
    };
  }

  async register(userData: {
    username: string;
    email: string;
    password: string;
    userGroupId?: number;
  }) {
    // UsersService.create already hashes the password
    const user = await this.usersService.create(userData);

    // User returned from create() already has no password field
    return user;
  }

  async changePassword(
    userUuid: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    // Buscar usuário com senha
    const user = await this.usersService.findByUuidWithPassword(userUuid);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Validar senha atual
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Atualizar senha
    await this.usersService.updateUser(userUuid, { password: newPassword });

    return { message: 'Password changed successfully' };
  }

  async resetPassword(
    email: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    // Buscar usuário pelo email
    const user = await this.usersService.findByEmailForAuth(email);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Atualizar senha
    await this.usersService.updateUser(user.uuid, { password: newPassword });

    return { message: 'Password reset successfully' };
  }
}