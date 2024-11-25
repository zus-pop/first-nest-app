import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EditUserDto } from './dto';

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {}

  async editUser(id: number, editUserDto: EditUserDto) {
    return await this.prismaService.user.update({
      where: {
        id,
      },
      data: {
        ...editUserDto,
      },
      omit: {
        hash: true,
      },
    });
  }
}
