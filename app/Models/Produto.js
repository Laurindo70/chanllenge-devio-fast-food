'use strict'

const Model = use('Model')

/** 
*  @swagger
*  definitions:
*    Produto:
*      type: object
*      properties:
*        codigo_produto:
*          type: string
*        nome_produto:
*          type: string
*        valor:
*          type: numeric
*        criado_em:
*           type: datetime
*        atualizado_em:
*           type: datetime
*      required:
*        - codigo_produto
*        - nome_produto
*        - valor
*        - criado_em
*        - atualizado_em
*/

class Produto extends Model {

   static get table() {
      return 'produto'
   }

   static get createdAtColumn() {
      return 'criado_em'
   }

   static get updatedAtColumn() {
      return 'atualizado_em'
   }

   static get primaryKey() {
      return 'codigo_produto'
   }

}

module.exports = Produto
