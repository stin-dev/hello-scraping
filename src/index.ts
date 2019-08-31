import executeScraping from './scraping';
import { executeScrapingPastdata } from './pastdata';

declare const global: {
  [x: string]: any;
}

global.executeScraping = function() {
  return executeScraping();
}

global.executeScrapingPastdata = function() {
  return executeScrapingPastdata();
}