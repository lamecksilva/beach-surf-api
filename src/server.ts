import './util/module-alias';
import { Server } from '@overnightjs/core';
import { Application } from 'express';
import { json } from 'body-parser';
import expressPino from 'express-pino-logger';
import cors from 'cors';
import * as database from './database';
import { ForecastController } from './controllers/forecast';
import { BeachesController } from './controllers/beaches';
import { UsersController } from './controllers/user';
import logger from './logger';

export class SetupServer extends Server {
  constructor(private port = 3000) {
    super();
  }

  public init(): void {
    this.setupExpress();
    this.setupControllers();
    this.databaseSetup();
  }

  private setupExpress(): void {
    this.app.use(json());
    this.app.use(
      cors({
        origin: '*',
      })
    );
    this.app.use(
      expressPino({
        logger,
      })
    );
  }

  private setupControllers(): void {
    const forecastController = new ForecastController();
    const beachesController = new BeachesController();
    const usersController = new UsersController();

    this.addControllers([
      forecastController,
      beachesController,
      usersController,
    ]);
  }

  private async databaseSetup(): Promise<void> {
    await database.connect();
  }

  public async close(): Promise<void> {
    await database.close();
  }

  public getApp(): Application {
    return this.app;
  }

  public start(): void {
    this.app.listen(this.port, () => {
      logger.info(`Server listening on port: ${this.port}`);
    });
  }
}
