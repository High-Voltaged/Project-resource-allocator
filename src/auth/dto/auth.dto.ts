import { Field, ObjectType, ArgsType } from '@nestjs/graphql';
import { IsEmail, Length } from 'class-validator';
import { AUTH_VALIDATION } from '../const/auth.validation';

@ArgsType()
export class RegisterInput {
  @IsEmail()
  @Field()
  email: string;

  @Length(
    AUTH_VALIDATION.PASSWORD_MIN_LENGTH,
    AUTH_VALIDATION.PASSWORD_MAX_LENGTH,
  )
  @Field()
  password: string;

  @Length(AUTH_VALIDATION.NAME_MIN_LENGTH, AUTH_VALIDATION.NAME_MAX_LENGTH)
  @Field()
  firstName: string;

  @Length(AUTH_VALIDATION.NAME_MIN_LENGTH, AUTH_VALIDATION.NAME_MAX_LENGTH)
  @Field()
  lastName: string;
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
