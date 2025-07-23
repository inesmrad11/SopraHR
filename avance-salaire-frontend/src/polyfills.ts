/**
 * This file includes polyfills needed by Angular and is loaded before the app.
 * You can add your own extra polyfills to this file.
 *
 * This file is divided into 2 sections:
 *   1. Browser polyfills. These are applied before loading ZoneJS and are sorted by browsers.
 *   2. Application imports. Files imported after ZoneJS that should be loaded before your main
 *      file.
 *
 * The current setup is for so-called "evergreen" browsers; the last versions of browsers that
 * automatically update themselves. This includes recent versions of Safari, Chrome (including
 * Opera), Edge on the desktop, and iOS and Chrome on mobile.
 *
 * Learn more in https://angular.io/guide/browser-support
 */

/***************************************************************************************************
 * BROWSER POLYFILLS
 */

/**
 * By default, zone.js will patch all possible macroTask and DomEvents
 * user can disable parts of macroTask/DomEvents patch by setting following flags
 * because those flags need to be set before `zone.js` is loaded, and webpack
 * will put import in the top of bundle, so user need to create a separate file
 * in this directory (for example: `zone-flags.ts`), and import it before `zone.js`.
 *
 * The following flags will be set up by `ng add @angular/lications/browser`
 *
 * L'ordre des importations est crucial ici.
 */
import 'zone.js'; // Included with Angular CLI.

// Ajout du polyfill pour 'global'
(window as any).global = window;

/***************************************************************************************************
 * APPLICATION IMPORTS
 */
