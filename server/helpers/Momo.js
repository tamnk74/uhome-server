import fs from 'fs';
import { momoConfig } from '../config';

global.navigator = { appName: 'nodejs' }; // fake the navigator object
global.window = {}; // fake the window object
const JSEncrypt = require('jsencrypt');
const NodeRSA = require('node-rsa');
const crypto = require('crypto');

export class Momo {
  static async encryptRSA(data) {
    const publicKey = await fs.readFileSync(momoConfig.publicKeyFile, {
      encoding: 'utf8',
      flag: 'r',
    });

    const key = new NodeRSA(publicKey, { encryptionScheme: 'pkcs1' });
    const encryptData = key.encrypt(JSON.stringify(data), 'base64');

    return encryptData.toString('base64');
  }

  static async jsEncryptRSA(data) {
    const publicKey = await fs.readFileSync(momoConfig.publicKeyFile, {
      encoding: 'utf8',
      flag: 'r',
    });
    console.log(publicKey);
    const encrypt = new JSEncrypt();
    encrypt.setPublicKey(publicKey);
    const encrypted = encrypt.encrypt(JSON.stringify(data));

    return encrypted;
  }

  static createSignature(data) {
    const rawSignature = Object.keys(data)
      .map((key) => `${key}=${data[key]}`)
      .join('&');

    return crypto.createHmac('sha256', momoConfig.secretKey).update(rawSignature).digest('hex');
  }
}
