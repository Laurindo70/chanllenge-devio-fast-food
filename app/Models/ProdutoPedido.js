'use strict'


const Model = use('Model')

/** 
*  @swagger
*  definitions:
*    ProdutoPedido:
*      type: object
*      properties:
*        codigo_produto:
*          type: integer
*          format: int64
*        quantidade:
*           type: integer
*           format: int32
*      required:
*        - codigo_produto
*        - quantidade
*/

class ProdutoPedido extends Model {

   static get table() {
      return 'produto_pedido'
   }

   static get createdAtColumn() {
      return false
   }

   static get updatedAtColumn() {
      return false
   }

   static get primaryKey() {
      return false
   }

}

module.exports = ProdutoPedido
