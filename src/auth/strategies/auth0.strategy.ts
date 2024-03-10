import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';

console.log({ client_id: process.env.OAUTH_CLIENT_ID });

@Injectable()
export class Auth0Strategy extends PassportStrategy(Strategy, 'auth0') {
  constructor() {
    super({
      clientID: process.env.OAUTH_CLIENT_ID,
      clientSecret: process.env.OAUTH_SECRET,
      callbackURL: 'http://localhost:3000/google/redirect',
      scope: ['email', 'profile'],
    });
  }

  async validate(
    _refreshToken: string,
    accessToken: string,
    profile: any,
    done: VerifyCallback,
  ) {
    const { name, emails } = profile;

    console.log({ name, emails, accessToken, _refreshToken });

    const user = {
      email: emails[0].valueq,
      firstName: name.givenName,
      lastName: name.familyName,
      accessToken,
    };

    done(null, user);
  }
}
