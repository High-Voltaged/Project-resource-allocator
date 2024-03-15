import { Field, ObjectType, ArgsType } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import { ArrayMinSize, IsEmail, Length, ValidateNested } from 'class-validator';
import { UserSkillInput } from '~/users/dto/user.dto';

@ArgsType()
export class RegisterInput {
  @IsEmail()
  @Field()
  email: string;

  @Length(8, 50)
  @Field()
  password: string;

  @Length(3, 14)
  @Field()
  firstName: string;

  @Length(3, 14)
  @Field()
  lastName: string;

  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => UserSkillInput)
  @Field(() => [UserSkillInput])
  skills: UserSkillInput[];
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
