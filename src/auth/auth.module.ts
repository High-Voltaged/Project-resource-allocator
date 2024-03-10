import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthResolver } from './auth.resolver';
import { AuthController } from './auth.controller';
import { Auth0Strategy } from './strategies/auth0.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UserModule } from '~/users/user.module';
import { JwtModule } from '@nestjs/jwt';
import { LocalStrategy } from './strategies/local.strategy';

@Module({
  imports: [
    UserModule,
    JwtModule.registerAsync({
      useFactory: () => ({
        signOptions: { expiresIn: '1d' },
        secret: process.env.JWT_SECRET,
      }),
    }),
  ],
  providers: [
    AuthService,
    AuthResolver,
    // Auth0Strategy,
    LocalStrategy,
    JwtStrategy,
  ],
  // controllers: [AuthController],
})
export class AuthModule {}
