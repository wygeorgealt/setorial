import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterDto, LoginDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
    ) { }

    async register(registerDto: RegisterDto) {
        const existing = await this.usersService.findByEmail(registerDto.email);
        if (existing) {
            throw new BadRequestException('Email already in use');
        }
        const hashedPassword = await bcrypt.hash(registerDto.password, 10);
        const user = await this.usersService.createUser({
            email: registerDto.email,
            password: hashedPassword,
            name: registerDto.name,
        });
        return this.generateAuthResponse(user);
    }

    async login(loginDto: LoginDto) {
        const user = await this.usersService.findByEmail(loginDto.email);
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }
        const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }
        return this.generateAuthResponse(user);
    }

    private generateAuthResponse(user: any) {
        const payload = { sub: user.id, email: user.email, role: user.role, tier: user.tier };
        const { password, ...userWithoutPassword } = user;

        const frontendUser = {
            ...userWithoutPassword,
            name: user.name || user.email.split('@')[0],
            points: 0,
            avatarUrl: 'https://i.pravatar.cc/150?u=' + user.id
        };

        return {
            user: frontendUser,
            token: this.jwtService.sign(payload),
            refresh_token: this.jwtService.sign(payload, {
                secret: process.env.JWT_REFRESH_SECRET,
                expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN as any) || '7d',
            }),
        };
    }
}
