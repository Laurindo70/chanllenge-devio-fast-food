'use strict'


const Model = use('Model')

/** 
*  @swagger
*  definitions:
*    TipoPagamento:
*      type: object
*      properties:
*        tipo_pagamento:
*          type: integer
*        valor:
*          type: number
*          format: float
*      required:
*        - tipo_pagamento:
*        - nome_tipo_pagamento
*/

class TipoPagamento extends Model {

   static get table() {
      return 'tipo_pagamento'
   }

   static get createdAtColumn() {
      return 'criado_em'
   }

   static get updatedAtColumn() {
      return 'atualizado_em'
   }

}

module.exports = TipoPagamento
