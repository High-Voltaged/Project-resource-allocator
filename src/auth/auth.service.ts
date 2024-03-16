import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import authErrors from './auth.constants';
import { LoginInput, RegisterInput } from './dto/auth.dto';
import { UserService } from '~/users/user.service';
import { User } from '~/users/user.entity';

const SALT_OR_ROUNDS = 10;

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  googleLogin(req: Request) {
    if (!req.user) {
      return { message: authErrors.GOOGLE_AUTH };
    }

    return req.user;
  }

  async register({ password, ...user }: RegisterInput) {
    const found = await this.userService.findByEmail(user.email);
    if (found) {
      throw new BadRequestException(authErrors.EMEAIL_EXISTS);
    }

    const hash = await bcrypt.hash(password, SALT_OR_ROUNDS);

    return this.userService.createUser({ ...user, password: hash });
  }

  async login(user: User) {
    const { email } = user;

    const accessToken = await this.jwtService.signAsync({
      email,
      sub: user.id,
    });

    if (!accessToken) {
      throw new InternalServerErrorException();
    }

    return { accessToken };
  }

  async validateUser({ email, password }: LoginInput) {
    const user = await this.userService.findByEmail(email);

    if (user && (await bcrypt.compare(password, user.password))) {
      return user;
    }

    throw new UnauthorizedException(authErrors.INVALID_CREDENTIALS);
  }
}
