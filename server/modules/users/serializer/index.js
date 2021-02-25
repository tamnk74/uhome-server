import { Serializer as JSONAPISerializer } from 'jsonapi-serializer';

export const authSerializer = new JSONAPISerializer('auth', {
  attributes: ['id', 'tokenType', 'accessToken', 'refreshToken', 'expiresIn'],
  keyForAttribute: 'snake_case',
});
