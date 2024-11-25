import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { User } from '@prisma/client';
import { GetMe } from '../auth/decorator';
import { JwtGuard } from '../auth/guard';
import { EditUserDto } from './dto';
import { UserService } from './user.service';

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
