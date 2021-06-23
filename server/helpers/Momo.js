import { momoConfig } from '../config';
import { readFile } from './Util';

const NodeRSA = require('node-rsa');
const fastJson = require('fast-json-stringify');

export class Momo {
  static async ecryptRSA(data) {
    const publicKey = await readFile(momoConfig.publicKeyFile);
    const key = new NodeRSA(publicKey, { encryptionScheme: 'pkcs1' });
    const encryptData = key.encrypt(fastJson(data), 'base64');

    return encryptData.toString('base64');
  }
}
