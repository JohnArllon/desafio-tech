import { Controller, Get } from '@nestjs/common';
import { MikroORM } from '@mikro-orm/core';

@Controller('health')
export class HealthController {
  constructor(private readonly orm: MikroORM) {}

  @Get('live')
  checkLive() {
    return { status: 'UP', timestamp: new Date().toISOString() };
  }

  @Get('ready')
  async checkReady() {
    try {
      const isConnected = await this.orm.isConnected();
      return {
        status: isConnected ? 'UP' : 'DOWN',
        database: isConnected ? 'connected' : 'disconnected',
        timestamp: new Date().toISOString(),
      };
    } catch {
      return { status: 'DOWN', database: 'disconnected', timestamp: new Date().toISOString() };
    }
  }
}