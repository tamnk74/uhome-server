import axios from 'axios';
import { ocrKey, ocrSecret, ocrDomain } from '../config';
import { ocrApis } from '../constants';

export default class OcrService {
  static async getIdentifyCard(frontSideImage, backSideImage) {
    return axios.get(`${ocrDomain}${ocrApis.identifyCard}`, {
      params: {
        img1: frontSideImage,
        img2: backSideImage,
        format_type: 'url',
        get_thumb: false,
      },
      auth: {
        username: ocrKey,
        password: ocrSecret,
      },
    });
  }
}
