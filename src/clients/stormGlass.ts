import { AxiosStatic } from 'axios';

export class StormGlass {
  readonly stormGlassAPIParams =
    'swellDirection,swellHeight,swellPeriod,waveDirection,waveHeight,windDirection,windSpeed';
  readonly stormGlassAPISource = 'noaaa';

  constructor(protected request: AxiosStatic) {}

  // eslint-disable-next-line @typescript-eslint/ban-types
  public async fetchPoints(lat: number, lng: number): Promise<{}> {
    return this.request.get(
      `https://api.stormglass.io/v2/weather/point?params=${this.stormGlassAPIParams}&source=${this.stormGlassAPISource}&lat=${lat}&lng=${lng}`
    );
  }
}
