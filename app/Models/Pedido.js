'use strict'


const Model = use('Model')

/** 
*  @swagger
*  definitions:
*    Pedido:
*      type: object
*      properties:
*        codigo_pedido:
*          type: int
*        valor_total:
*          type: numeric
*        observacao:
*          type: text
*        troco:
*          type: numeric
*        pedido_finalizado:
*          type: Bool
*        preparo_finalizado:
*          type: Bool
*        criado_em:
*           type: datetime
*        atualizado_em:
*           type: datetime
*      required:
*        - codigo_pedido
*        - valor_total
*        - pedido_finalizado
*        - preparo_finalizado
*        - criado_em
*        - atualizado_em
*/


class Pedido extends Model {

   static get table() {
      return 'pedido'
   }

   static get createdAtColumn() {
      return 'criado_em'
   }

   static get updatedAtColumn() {
      return 'atualizado_em'
   }

   static get primaryKey() {
      return 'codigo_pedido'
   }

}

module.exports = Pedido
