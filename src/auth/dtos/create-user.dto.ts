import { IsEmail, IsString, MinLength } from "class-validator";

export class CreateUserDto {

    @IsString()
    @MinLength(10)
    name: string;

    @IsString()
    @IsEmail()
    email: string;

    @IsString()
    @MinLength(7)
    password: string;

}