'use strict'


const Model = use('Model')

/** 
*  @swagger
*  definitions:
*    Pedido:
*      type: object
*      properties:
*        nome_cliente:
*          type: string
*        quantidade:
*          type: integer
*        codigo_produto:
*          type: integer
*      required:
*        - quantidade
*        - codigo_produto
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
