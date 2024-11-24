import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookmarkDto, EditBookmarkDto } from './dto';

@Injectable()
export class BookmarkService {
  constructor(private prismaService: PrismaService) {}
  getBookmarks({ userId }: { userId: number }) {
    return this.prismaService.bookmark.findMany({
      where: {
        userId,
      },
    });
  }

  async getBookmark({
    bookmarkId,
    userId,
  }: {
    bookmarkId: number;
    userId: number;
  }) {
    try {
      const bookmark = await this.prismaService.bookmark.findUniqueOrThrow({
        where: {
          id: bookmarkId,
          userId,
        },
      });
      return bookmark;
    } catch (err) {
      if (err instanceof PrismaClientKnownRequestError) {
        if (err.code === 'P2025')
          throw new NotFoundException('Bookmark does not exist');
      }
      throw err;
    }
  }

  createBookmark({ userId, dto }: { userId: number; dto: CreateBookmarkDto }) {
    return this.prismaService.bookmark.create({
      data: {
        ...dto,
        user: {
          connect: {
            id: userId,
          },
        },
      },
      include: {
        user: {
          omit: {
            hash: true,
          },
        },
      },
    });
  }

  async updateBookmark({
    bookmarkId,
    userId,
    dto,
  }: {
    bookmarkId: number;
    userId: number;
    dto: EditBookmarkDto;
  }) {
    const bookmark = await this.prismaService.bookmark.findUnique({
      where: {
        id: bookmarkId,
        userId,
      },
    });

    if (!bookmark || bookmark.userId !== userId)
      throw new ForbiddenException('Access resource denied');

    return this.prismaService.bookmark.update({
      where: {
        id: bookmarkId,
      },
      data: {
        ...dto,
      },
    });
  }

  async deleteBookmark({
    bookmarkId,
    userId,
  }: {
    bookmarkId: number;
    userId: number;
  }) {
    const bookmark = await this.prismaService.bookmark.findUnique({
      where: {
        id: bookmarkId,
        userId,
      },
    });

    if (!bookmark || bookmark.userId !== userId)
      throw new ForbiddenException('Access resource denied');

    await this.prismaService.bookmark.delete({
      where: {
        id: bookmarkId,
      },
    });
  }
}
