import packageInfo from '../../package.json';

export const environment = {
  appVersion: packageInfo.version,
  production: false,
  apiUrl: 'http://localhost:9009/api',
  recaptchaSiteKey: '6Lc7-nMrAAAAAF3UXst23o5_lDC2sPGkyvtjpiAo',
  appName: 'SopraHR - Avance Salaire',
  version: '1.0.0'
};