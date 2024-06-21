import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { Users } from '@prisma/client';

import { CreateUserDto } from './dtos/create-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';

import * as bcrypt from 'bcrypt';
import { LoginDto } from './dtos/login.dto';
import { LoginResponse } from './interfaces/LoginResponse';
import { json } from 'stream/consumers';


@Injectable()
export class AuthService {

    constructor(private readonly prisma: PrismaService) { }

    async createUser(createUserDto: CreateUserDto): Promise<Users> {
        const { password, ...dataUser } = createUserDto
        const user = await this.userByEmail(createUserDto.email);
        if (user) {
            throw new BadRequestException('Email Exists');
        }

        const name = await this.prisma.users.findFirst({
            where: {
                name: createUserDto.name
            }
        })

        if (name) throw new BadRequestException('Name Exists');

        const hashedPassword = bcrypt.hashSync(password, 10);
        return await this.prisma.users.create({
            data: {
                password: hashedPassword,
                ...dataUser
            }
        });
    }

    async login(loginDto: LoginDto): Promise<LoginResponse> { //


        const user = await this.userByEmail(loginDto.email);
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const pwd = bcrypt.compareSync(loginDto.password, user.password)

        if (pwd === false) {
            throw new BadRequestException('Invalid credentials');
        }

        return user;

    }

    userByEmail(email: string) {

        return this.prisma.users.findFirst({
            where: {
                email,
            }
        })
    }

}
