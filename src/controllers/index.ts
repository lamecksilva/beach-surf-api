import logger from '@src/logger';
import { CUSTOM_VALIDATION } from '@src/models/user';
import { Response } from 'express';
import Mongoose from 'mongoose';

// Abstract classes can only be extended
export abstract class BaseController {
  protected sendCreateUpdateErrorResponse(
    res: Response,
    error: Mongoose.Error.ValidationError | Error
  ): void {
    if (error instanceof Mongoose.Error.ValidationError) {
      const clientErrors = this.handleClientErrors(error);

      res
        .status(clientErrors.code)
        .send({ code: clientErrors.code, error: clientErrors.error });
    } else {
      logger.error(error);
      res.status(500).send({ code: 500, error: 'Something went wrong!' });
    }
  }

  private handleClientErrors(error: Mongoose.Error.ValidationError): {
    code: number;
    error: string;
  } {
    const duplicatedKindErrors = Object.values(error.errors).filter((err) => {
      if (
        err instanceof Mongoose.Error.ValidatorError ||
        err instanceof Mongoose.Error.CastError
      ) {
        return err.kind === CUSTOM_VALIDATION.DUPLICATED;
      } else {
        return null;
      }
    });

    if (duplicatedKindErrors.length) {
      return { code: 409, error: error.message };
    }
    return { code: 422, error: error.message };
  }
}
