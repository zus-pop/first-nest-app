import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDTO } from './dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  login(@Body() dto: AuthDTO) {
    return this.authService.login(dto);
  }

  @Post('signup')
  signup(@Body() dto: AuthDTO) {
    return this.authService.signup(dto);
  }
}
