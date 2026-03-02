import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { PrismaService } from '../prisma.service';
export declare class AuthService {
    private usersService;
    private jwtService;
    private prisma;
    constructor(usersService: UsersService, jwtService: JwtService, prisma: PrismaService);
    register(registerDto: RegisterDto): Promise<{
        user: any;
        token: string;
        refresh_token: string;
    }>;
    login(loginDto: LoginDto): Promise<{
        user: any;
        token: string;
        refresh_token: string;
    }>;
    changePassword(userId: string, currentPassword: string, newPassword: string): Promise<{
        message: string;
    }>;
    private generateAuthResponse;
}
