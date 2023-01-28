'use strict'


const Model = use('Model')

/** 
*  @swagger
*  definitions:
*    Pagamento:
*      type: object
*      properties:
*        id:
*          type: int
*        codigo_pedido:
*          type: int
*        tipo_pgamento_id:
*          type: int
*        valor:
*          type: numeric
*        criado_em:
*          type: datetime
*        atualizado_em:
*          type: datetime
*      required:
*        - id
*        - codigo_pedido
*        - tipo_pgamento_id
*        - valor
*        - criado_em
*        - atualizado_em
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
