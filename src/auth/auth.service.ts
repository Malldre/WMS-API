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
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const { password: _, ...result } = user;
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
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const user = await this.usersService.create({
      ...userData,
      password: hashedPassword,
    });

    const { password: _, ...result } = user;
    return result;
  }
}