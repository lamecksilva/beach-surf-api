import { ForecastPoint, StormGlass } from '@src/clients/stormGlass';
import { InternalError } from '@src/util/errors/internal-errors';

export enum BeachPosition {
  S = 'S',
  E = 'E',
  W = 'W',
  N = 'N',
}

export interface Beach {
  name: string;
  position: BeachPosition;
  lat: number;
  lng: number;
  user: string;
}

// 'Omit' Exclui campos da interface passada por "parâmetro"
export interface BeachForecast extends Omit<Beach, 'user'>, ForecastPoint {}

// Internal Error
export class ForecastProcessingInternalError extends InternalError {
  constructor(message: string) {
    super(`Unexpected error during the forecast processing: ${message}`);
  }
}

export class Forecast {
  /**
   *
   * Construtor recebe um service do StormGlass, mas pode ser substituido se necessário.
   */
  constructor(protected stormGlass = new StormGlass()) {}

  /**
   * Recebe uma lista de praias
   * Para cada praia, busca os forecasts
   * Une os dados do forecast com as infos da praia (nome, etc)
   * Retorna um novo array
   */
  public async processForecastForBeaches(
    beaches: Beach[]
  ): Promise<BeachForecast[]> {
    const pointsWithCorrectSources: BeachForecast[] = [];

    try {
      for (const beach of beaches) {
        const points = await this.stormGlass.fetchPoints(beach.lat, beach.lng);

        const enrichedBeachData = this.enrichedBeachData(points, beach);

        pointsWithCorrectSources.push(...enrichedBeachData);
      }

      return pointsWithCorrectSources;
    } catch (err) {
      throw new ForecastProcessingInternalError(err.message);
    }
  }

  // Une os dados dos forecasts com os da praia
  private enrichedBeachData(
    points: ForecastPoint[],
    beach: Beach
  ): BeachForecast[] {
    return points.map((e) => ({
      ...{
        lat: beach.lat,
        lng: beach.lng,
        name: beach.name,
        position: beach.position,
        rating: 1,
      },
      ...e,
    }));
  }
}
