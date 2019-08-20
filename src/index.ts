import {getUpdatedCalander} from './Code'

declare const global: {
  [x: string]: any ;
}

global.getUpdatedCalander = function(e: any) {
  return getUpdatedCalander(e)
}