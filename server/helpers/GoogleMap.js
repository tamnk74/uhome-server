import { Client } from '@googlemaps/google-maps-services-js';
import _ from 'lodash';
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

  async getDistance(from, to) {
    const distanceResponse = await this.client.distancematrix({
      params: {
        origins: [from],
        destinations: [to],
        key: googleAPIConfig.key,
      },
    });

    const distance = _.get(distanceResponse.data.rows, '[0].elements.[0].distance.value', 0);

    return (distance / 1000).toFixed(1);
  }
}

export const googleMap = new GoogleMap();
