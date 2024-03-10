import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { User } from '~/users/user.entity';
import { UserService } from '~/users/user.service';
import authErrors from '../auth.constants';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: User) {
    const { email } = payload;
    const user: User = await this.userService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException(authErrors.EMAIL_NOT_FOUND);
    }

    return user;
  }
}
