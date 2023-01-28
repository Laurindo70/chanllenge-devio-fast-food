'use strict'

module.exports = {
  /*
  |--------------------------------------------------------------------------
  | Swagger Information
  | Please use Swagger 2 Spesification Docs
  | https://swagger.io/docs/specification/2-0/basic-structure/
  |--------------------------------------------------------------------------
  */

  enable: true,
  specUrl: '/swagger.json',

  options: {
    swaggerDefinition: {
      info: {
        title: 'Fast Food - Ronan Laurindo Flor',
        version: '1.0.0',
      },

    },

    apis: [
      'app/**/*.js',
      'start/routes.js'
    ]
  }
}