import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { JwtGuard } from '../auth/guard';
import { GetMe } from '../auth/decorator';
import { EditUserDto } from './dto';
import { UserService } from './user.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('User')
@Controller('users')
@ApiBearerAuth()
@UseGuards(JwtGuard)
export class UserController {
  constructor(private userService: UserService) {}
  @Get('me')
  getMe(@GetMe() user: User) {
    return user;
  }

  @Patch()
  editUser(@GetMe('id') id: number, @Body() editUserDto: EditUserDto) {
    return this.userService.editUser(id, editUserDto);
  }
}
