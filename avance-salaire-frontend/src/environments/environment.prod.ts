import packageInfo from '../../package.json';

export const environment = {
  appVersion: packageInfo.version,
  apiUrl: 'https://api.soprahr.com/api', // Replace with your actual production API URL
  recaptchaSiteKey: '6Lc7-nMrAAAAAF3UXst23o5_lDC2sPGkyvtjpiAo', // Replace with production reCAPTCHA key
  appName: 'SopraHR - Avance Salaire',
  version: '1.0.0',
  production: true
};
