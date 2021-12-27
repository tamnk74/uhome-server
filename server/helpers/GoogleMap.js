import { Client } from '@googlemaps/google-maps-services-js';
import { googleAPIConfig } from '../config';

export class GoogleMap {
  constructor() {
    this.client = new Client();
  }

  async getProvince({ lat, lng }) {
    const location = await this.client.reverseGeocode({
      params: {
        latlng: { lat, lng },
        key: googleAPIConfig.key,
      },
      timeout: 1000, // milliseconds
    });
    const addressComponents =
      location.data.results[0] && location.data.results[0].address_components;
    const address = addressComponents.find((address) =>
      address.types.includes('administrative_area_level_1')
    );
    return address ? address.short_name : '';
  }
}

export const googleMap = new GoogleMap();
