import { ForecastPoint, StormGlass } from '@src/clients/stormGlass';

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

    for (const beach of beaches) {
      const points = await this.stormGlass.fetchPoints(beach.lat, beach.lng);

      const enrichedBeachData = points.map((e) => ({
        ...{
          lat: beach.lat,
          lng: beach.lng,
          name: beach.name,
          position: beach.position,
          rating: 1,
        },
        ...e,
      }));

      pointsWithCorrectSources.push(...enrichedBeachData);
    }

    return pointsWithCorrectSources;
  }
}
