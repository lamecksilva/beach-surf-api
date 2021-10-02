import './util/module-alias';
import { Server } from '@overnightjs/core';
import e, { Application, Request, Response } from 'express';
import { json } from 'body-parser';
import expressPino from 'express-pino-logger';
import cors from 'cors';
import apiSchema from './api.schema.json';
import swaggerUi from 'swagger-ui-express';
import listEndpoints from 'express-list-endpoints';

import { OpenApiValidator } from 'express-openapi-validator';
import { OpenAPIV3 } from 'express-openapi-validator/dist/framework/types';

import * as database from './database';
import { ForecastController } from './controllers/forecast';
import { BeachesController } from './controllers/beaches';
import { UsersController } from './controllers/user';
import logger from './logger';
import { apiErrorValidator } from './middlewares/api-error-validator';

export class SetupServer extends Server {
  constructor(private port = 3000) {
    super();
  }

  public async init(): Promise<void> {
    this.setupExpress();

    await this.docsSetup();
    this.setupControllers();

    await this.databaseSetup();
    this.setupErrorHandlers();
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

  private setupErrorHandlers(): void {
    this.app.use(apiErrorValidator);
  }

  private setupControllers(): void {
    const usersController = new UsersController();
    const beachesController = new BeachesController();
    const forecastController = new ForecastController();

    this.addControllers([
      usersController,
      beachesController,
      forecastController,
    ]);

    this.app.get('/', (_: Partial<Request>, res: Response): void => {
      res.send(`Beach Surf API on port: ${this.port}`);
    });
  }

  private async databaseSetup(): Promise<void> {
    await database.connect();
  }

  public async close(): Promise<void> {
    await database.close();
  }

  private async docsSetup(): Promise<void> {
    this.app.use('/docs', swaggerUi.serve, swaggerUi.setup(apiSchema));
    await new OpenApiValidator({
      apiSpec: apiSchema as OpenAPIV3.Document,
      validateRequests: false,
      validateResponses: true,
    }).install(this.app);
  }
  public getApp(): Application {
    return this.app;
  }

  public start(): void {
    this.app.listen(this.port, () => {
      logger.info(`Server listening on port: ${this.port}`);
    });

    process.env.NODE_ENV === 'development' &&
      console.info('Rotas: ', listEndpoints(this.app as e.Express));
  }
}
