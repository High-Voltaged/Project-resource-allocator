import { AuthGuard } from '@nestjs/passport';

export class Auth0Guard extends AuthGuard('auth0') {}
