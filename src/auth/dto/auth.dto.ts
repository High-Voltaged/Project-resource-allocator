import { Field, ObjectType, ArgsType } from '@nestjs/graphql';
import { IsEmail, IsEnum, Length } from 'class-validator';
import { UserRole } from '~/users/user.entity';

@ArgsType()
export class RegisterInput {
  @IsEmail()
  @Field()
  email: string;

  @Length(8, 50)
  @Field()
  password: string;

  @Field()
  firstName: string;

  @Field()
  lastName: string;

  @Field()
  @IsEnum(UserRole)
  role: UserRole;
}

@ArgsType()
export class LoginInput {
  @IsEmail()
  @Field()
  email: string;

  @Length(8, 50)
  @Field()
  password: string;
}

@ObjectType()
export class LoginResult {
  @Field()
  accessToken: string;
}
