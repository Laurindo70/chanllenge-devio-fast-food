'use strict'


const Model = use('Model')

/** 
*  @swagger
*  definitions:
*    Pagamento:
*      type: object
*      properties:
*        forma_pagamento:
*             type: array
*             items: 
*               $ref: "#/definitions/TipoPagamento"
*      required:
*        - forma_pagamento
*/

class Pagamento extends Model {

   static get table() {
      return 'pagamento'
   }

   static get createdAtColumn() {
      return 'criado_em'
   }

   static get updatedAtColumn() {
      return 'atualizado_em'
   }

}

module.exports = Pagamento
