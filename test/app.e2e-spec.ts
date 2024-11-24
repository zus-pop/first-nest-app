import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';
import * as pactum from 'pactum';
import { AuthDTO } from '../src/auth/dto';
import { EditUserDto } from '../src/user/dto';
import { CreateBookmarkDto, EditBookmarkDto } from '../src/bookmark/dto';

describe('App e2e', () => {
  let app: INestApplication;
  let prismaService: PrismaService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
    await app.listen(6969);

    prismaService = app.get(PrismaService);
    await prismaService.cleanDb();
    pactum.request.setBaseUrl('http://localhost:6969');
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Auth', () => {
    const dto: AuthDTO = {
      email: 'test@gmail.com',
      password: '123456',
    };
    describe('Register', () => {
      it('should throw if email is not provided', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({
            password: dto.password,
          })
          .expectStatus(HttpStatus.BAD_REQUEST);
      });

      it('should throw if password is not provided', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({
            email: dto.email,
          })
          .expectStatus(HttpStatus.BAD_REQUEST);
      });

      it('should throw if body is not provided', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .expectStatus(HttpStatus.BAD_REQUEST);
      });

      it('should register a new user', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody(dto)
          .expectStatus(HttpStatus.CREATED);
      });
    });

    describe('Login', () => {
      it('should throw if email is not provided', () => {
        return pactum
          .spec()
          .post('/auth/login')
          .withBody({
            password: dto.password,
          })
          .expectStatus(HttpStatus.BAD_REQUEST);
      });

      it('should throw if password is not provided', () => {
        return pactum
          .spec()
          .post('/auth/login')
          .withBody({
            email: dto.email,
          })
          .expectStatus(HttpStatus.BAD_REQUEST);
      });

      it('should throw if body is not provided', () => {
        return pactum
          .spec()
          .post('/auth/login')
          .expectStatus(HttpStatus.BAD_REQUEST);
      });

      it('should login a user', () => {
        return pactum
          .spec()
          .post('/auth/login')
          .withBody(dto)
          .expectStatus(HttpStatus.OK)
          .stores('userAt', 'access_token');
      });
    });
  });

  describe('User', () => {
    describe('Me', () => {
      it('should return a user data from token', () => {
        return pactum
          .spec()
          .get('/users/me')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(HttpStatus.OK);
      });
    });

    describe('Edit user', () => {
      const editUserDto: EditUserDto = {
        firstName: 'Pop Corn',
        email: 'popcorn@gmail.com',
      };
      it('should edit a user data', () => {
        return pactum
          .spec()
          .patch('/users')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .withBody(editUserDto)
          .expectStatus(HttpStatus.OK)
          .expectBodyContains(editUserDto.firstName)
          .expectBodyContains(editUserDto.email);
      });
    });
  });

  describe('Bookmarks', () => {
    describe('Get empty bookmarks', () => {
      it('should return empty array', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(HttpStatus.OK)
          .expectBody([]);
      });
    });
    describe('Create bookmark', () => {
      const dto: CreateBookmarkDto = {
        title: 'Google',
        description: 'Search engine',
        link: 'https://google.com',
      };
      it('should create a bookmark', () => {
        return pactum
          .spec()
          .post('/bookmarks')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .withBody(dto)
          .expectStatus(HttpStatus.CREATED)
          .stores('bookmarkId', 'id');
      });
    });
    describe('Get bookmarks', () => {
      it('should return a bookmark array with length 1', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(HttpStatus.OK)
          .expectJsonLength(1);
      });
    });
    describe('Get bookmark by id', () => {
      it('should return a bookmark', () => {
        return pactum
          .spec()
          .get('/bookmarks/{id}')
          .withPathParams({
            id: '$S{bookmarkId}',
          })
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(HttpStatus.OK)
          .expectBodyContains('$S{bookmarkId}');
      });
    });
    describe('Update bookmark by id', () => {
      const dto: EditBookmarkDto = {
        title: 'Facebook',
        description: 'Social media',
        link: 'https://facebook.com',
      };
      it('should update a bookmark', () => {
        return pactum
          .spec()
          .patch('/bookmarks/{id}')
          .withPathParams({
            id: '$S{bookmarkId}',
          })
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .withBody(dto)
          .expectStatus(HttpStatus.OK)
          .expectBodyContains(dto.title)
          .expectBodyContains(dto.description)
          .expectBodyContains(dto.link);
      });
    });
    describe('Delete bookmark by id', () => {
      it('should delete a bookmark', () => {
        return pactum
          .spec()
          .delete('/bookmarks/{id}')
          .withPathParams({
            id: '$S{bookmarkId}',
          })
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(HttpStatus.NO_CONTENT);
      });

      it('should return an empty bookmark', () => {
        return pactum
          .spec()
          .get('/bookmarks/{id}')
          .withPathParams({
            id: '$S{bookmarkId}',
          })
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(HttpStatus.NOT_FOUND)
          .inspect();
      });
    });
  });
});
