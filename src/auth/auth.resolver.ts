import { UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import { LoginInput, LoginResult, RegisterInput } from './dto/auth.dto';
import { LocalAuthGuard } from './guards/local_auth.guard';
import { AuthService } from './auth.service';

@Resolver()
export class AuthResolver {
  constructor(private authService: AuthService) {}

  @Mutation(() => Boolean)
  async registerUser(@Args() data: RegisterInput) {
    await this.authService.register(data);
    return true;
  }

  @Mutation(() => LoginResult)
  @UseGuards(LocalAuthGuard)
  loginUser(@Args() _data: LoginInput, @Context() context) {
    return this.authService.login(context.user);
  }
}
