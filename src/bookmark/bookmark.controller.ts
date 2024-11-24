import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtGuard } from '../auth/guard';
import { BookmarkService } from './bookmark.service';
import { User } from '@prisma/client';
import { GetMe } from '../auth/decorator';
import { CreateBookmarkDto, EditBookmarkDto } from './dto';

@UseGuards(JwtGuard)
@Controller('bookmarks')
export class BookmarkController {
  constructor(private bookmarkService: BookmarkService) {}

  @Post()
  createBookmark(@GetMe('id') userId: number, @Body() dto: CreateBookmarkDto) {
    return this.bookmarkService.createBookmark({ userId, dto });
  }

  @Get()
  getBookmarks(@GetMe('id') userId: number) {
    return this.bookmarkService.getBookmarks({ userId });
  }

  @Get(':id')
  getBookmark(
    @Param('id', ParseIntPipe) bookmarkId: number,
    @GetMe('id') userId: number,
  ) {
    return this.bookmarkService.getBookmark({
      bookmarkId,
      userId,
    });
  }

  @Patch(':id')
  updateBookmark(
    @Param('id', ParseIntPipe) bookmarkId: number,
    @GetMe('id') userId: number,
    @Body() dto: EditBookmarkDto,
  ) {
    return this.bookmarkService.updateBookmark({
      bookmarkId,
      userId,
      dto,
    });
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  deleteBookmark(
    @Param('id', ParseIntPipe) bookmarkId: number,
    @GetMe('id') userId: number,
  ) {
    return this.bookmarkService.deleteBookmark({
      bookmarkId,
      userId,
    });
  }
}
