import { Controller, Request, Post, UseGuards, Get } from '@nestjs/common';
import { GoogleOAuth2Guard } from '../../guards/google-auth.guard';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { LocalAuthGuard } from '../../guards/local-auth.guard';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @UseGuards(LocalAuthGuard)
    @Post('login')
    async login(@Request() req) {
        return this.authService.login(req.user);
    }

    @Get("google")
    @UseGuards(GoogleOAuth2Guard)
    async googleAuth() {
      // Guard redirects
    }

    @Get("google/callback")
    @UseGuards(GoogleOAuth2Guard)
    async googleLogin(@Request() req) {
        return this.authService.login(req.user);
    }

    @UseGuards(JwtAuthGuard)
    @Post('profile')
    getProfile(@Request() req) {
        return req.user;
    }
}
