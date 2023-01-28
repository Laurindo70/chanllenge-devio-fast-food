'use strict'


const Model = use('Model')

/** 
*  @swagger
*  definitions:
*    Tipo Pagamento:
*      type: object
*      properties:
*        id:
*          type: int
*        nome_tipo_pagamento:
*          type: string
*        criado_em:
*           type: datetime
*        atualizado_em:
*           type: datetime
*      required:
*        - id
*        - nome_tipo_pagamento
*        - criado_em
*        - atualizado_em
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
