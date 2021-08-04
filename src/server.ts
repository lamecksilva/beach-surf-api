import './util/module-alias';
import { Server } from '@overnightjs/core';
import { Application } from 'express';
import * as database from './database';
import { ForecastController } from './controllers/forecast';
import { BeachesController } from './controllers/beaches';
import { json } from 'body-parser';
import { UsersController } from './controllers/user';

export class SetupServer extends Server {
  constructor(private port = 9000) {
    super();
  }

  public init(): void {
    this.setupExpress();
    this.setupControllers();
    this.databaseSetup();
  }

  private setupExpress(): void {
    this.app.use(json());
  }

  private setupControllers(): void {
    const forecastController = new ForecastController();
    const beachesController = new BeachesController();
    const usersController = new UsersController()

    this.addControllers([forecastController, beachesController, usersController]);
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

  public start():void{
    this.app.listen(this.port, () => {
      console.info("Server listening on port: ", this.port)
    })
  }
}
