import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { AppModule } from 'src/app.module';
import {
  STATUS_BAD_REQUEST,
  STATUS_OK,
  STATUS_UNPROCESSABLE_ENTITY,
} from 'src/config/httpStatusCodes';
import * as request from 'supertest';
import { Logger } from 'winston';
import { TestModule } from './test.module';
import { TestService } from './test.service';

describe('UserController', () => {
  let app: INestApplication;
  let logger: Logger;
  let testService: TestService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, TestModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    logger = app.get(WINSTON_MODULE_PROVIDER);
    testService = app.get(TestService);
  });

  // user register
  describe('POST /api/register', () => {
    beforeEach(async () => {
      await testService.deleteUsers();
    });

    it('should be rejected if request is invalid', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/register')
        .send({
          username: '',
        });
      logger.error(`Invalid Response: ${JSON.stringify(response.body)}`);
      expect(response.status).toBe(STATUS_BAD_REQUEST);
      expect(response.body.errors).toBeDefined();
    });

    it('should be able to register', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/register')
        .send({
          username: 'mastika',
          password: '811899',
          name: 'mastika',
          email: 'mastika@gmail.com',
        });
      logger.info(`Success Response: ${JSON.stringify(response.body)}`);
      expect(response.status).toBe(STATUS_OK);
      expect(response.body.data.username).toBe('mastika');
      expect(response.body.data.name).toBe('mastika');
    });

    it('should be rejected if username already exists', async () => {
      await testService.createUser();
      const response = await request(app.getHttpServer())
        .post('/api/register')
        .send({
          username: 'mastika',
          password: '811899',
          name: 'mastika',
          email: 'mastika@gmail.com',
        });
      logger.error(`already exists Response: ${JSON.stringify(response.body)}`);
      expect(response.status).toBe(STATUS_UNPROCESSABLE_ENTITY);
      expect(response.body.errors).toBeDefined();
    });
  });

  // user login
  describe('POST /api/login', () => {
    beforeEach(async () => {
      await testService.deleteUsers();
      await testService.createUser();
    });

    it('should be rejected if request is invalid', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/login')
        .send({
          username: '',
          password: '',
        });
      logger.error(`Invalid Response: ${JSON.stringify(response.body)}`);
      expect(response.status).toBe(STATUS_BAD_REQUEST);
      expect(response.body.errors).toBeDefined();
    });

    it('should be able to login', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/login')
        .send({
          username: 'mastika',
          password: '811899',
        });
      logger.info(`Success Response: ${JSON.stringify(response.body)}`);
      expect(response.status).toBe(STATUS_OK);
      expect(response.body.data.username).toBe('mastika');
      expect(response.body.data.name).toBe('mastika');
      expect(response.body.data.session.valid).toBe(true);
    });
  });

  // get user
  describe('GET /api/users', () => {
    beforeEach(async () => {
      await testService.deleteUsers();
      await testService.createUser();
    });

    it('should be rejected if request is invalid', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/users')
        .send({
          username: '',
          password: '',
        });
      logger.error(`Invalid Response: ${JSON.stringify(response.body)}`);
      expect(response.status).toBe(STATUS_BAD_REQUEST);
      expect(response.body.errors).toBeDefined();
    });

    it('should be able to login', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/users')
        .send({
          username: 'mastika',
          password: '811899',
        });
      logger.info(`Success Response: ${JSON.stringify(response.body)}`);
      expect(response.status).toBe(STATUS_OK);
      expect(response.body.data.username).toBe('mastika');
      expect(response.body.data.name).toBe('mastika');
      expect(response.body.data.session.valid).toBe(true);
    });
  });
});
