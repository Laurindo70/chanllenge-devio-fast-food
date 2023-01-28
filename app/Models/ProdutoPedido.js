'use strict'


const Model = use('Model')

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
