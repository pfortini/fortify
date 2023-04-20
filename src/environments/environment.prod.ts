import { prod } from './.env.js';

export const environment = {
  production: true,
  clientId: prod.clientId,
  clientSecret: prod.clientSecret,
  redirectUri: prod.redirectUri,
  storageLocation: 'Documents'
};
