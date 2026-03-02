import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto, LoginDto } from './dto/auth.dto';
export declare class AuthService {
    private usersService;
    private jwtService;
    constructor(usersService: UsersService, jwtService: JwtService);
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
    private generateAuthResponse;
}
