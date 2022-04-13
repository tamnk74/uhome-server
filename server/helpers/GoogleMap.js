import { Client, ReverseGeocodingLocationType } from '@googlemaps/google-maps-services-js';
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
        location_type: ReverseGeocodingLocationType.GEOMETRIC_CENTER,
      },
      timeout: 1000, // milliseconds
    });
    const results = _.get(location, 'data.results', []);
    const shortNames = [];
    for (let index = 0; index < results.length; index++) {
      const iterator = results[index];
      const addressComponents = _.get(iterator, 'address_components', []);
      const names = addressComponents.map((address) => {
        return address.types.includes('administrative_area_level_1') ? address.short_name : '';
      });
      shortNames.push(...names);
    }

    return _.compact(shortNames);
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
