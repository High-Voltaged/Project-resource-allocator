import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Request } from 'express';
import { Auth0Guard } from './guards/auth0.guard';

@Controller('google')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(Auth0Guard)
  @Get()
  googleAuth() {}

  @UseGuards(Auth0Guard)
  @Get('redirect')
  googleRedirect(@Req() req: Request) {
    return this.authService.googleLogin(req);
  }
}
