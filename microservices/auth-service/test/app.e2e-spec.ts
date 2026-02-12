import type { Server } from 'http';
import { Controller, Get, INestApplication, Module } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';

@Controller()
class TestController {
  @Get('health')
  health() {
    return { status: 'ok' };
  }
}

@Module({
  controllers: [TestController],
})
class TestModule {}

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [TestModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/health (GET)', () => {
    return request(app.getHttpServer() as Server)
      .get('/health')
      .expect(200)
      .expect({ status: 'ok' });
  });
});
