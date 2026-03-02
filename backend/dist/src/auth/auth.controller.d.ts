import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
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
}
