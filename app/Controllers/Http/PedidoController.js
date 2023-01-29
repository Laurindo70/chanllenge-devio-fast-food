'use strict'

const { validateAll } = use('Validator');

const Database = use('Database');
const Pedido = use('App/Models/Pedido');
const ProdutoPedido = use('App/Models/ProdutoPedido');

class PedidoController {

   /**
  * @swagger
  * /api/adicionar-produto-pedido/codigo-pedido={codigoPedido}:
  *   post:
  *     tags:
  *       - Pedido
  *     summary: Cadastro de produtos no pedido.
  *     parameters:
  *       - name: codigo_produto
  *         description: Código do Produto.
  *         in: formData
  *         required: true
  *         type: integer
  *       - name: qtd
  *         description: quantidade de Produtos.
  *         in: formData
  *         required: true
  *         type: integer
  *     responses:
  *       200:
  *         description: Mensagem de sucesso
  *         example:
  *           - mensagem: Produto adicionado com sucesso ao pedido.
  *           - mensagem: Pedido iniciado com sucesso.
  *       500:
  *         description: Mensagem de Erro
  *         example:
  *           mensagem: Erro ao cadastrar novo produto.
  *       417:
  *         description: Mensagem de Erro
  *         example:
  *           - mensagem: É necessario preencher o nome do produto.
  *           - mensagem: Já existe um produto com esse nome cadastrado,
  *           - mensagem: É necessario preencher o valor do produto,
  *           - mensagem: O valor inserido não é um numero.
  */

   async adicionarProduto({ request, response, params }) {

      const transacao = await Database.beginTransaction();

      try {

         const { codigoPedido } = await params;

         if (!isNaN(parseFloat(codigoPedido)) && isFinite(codigoPedido)) {

            const mensagemErro = {
               'codigo_produto.required': 'É necessario selecionar o produto'
            }

            const validacao = await validateAll(request.all(), {
               codigo_produto: 'required'
            }, mensagemErro);

            let mensagem = validacao.messages();

            if (validacao.fails()) {
               return response.status(417).send({ mensagem: mensagem[0].message });
            }

            const { codigo_produto, qtd } = request.all();

            const dados_produto = await Database.raw(`select valor from produto where codigo_produto = ${codigo_produto}`);
            const valorPedido = await Database.raw(`select valor_total from pedido where codigo_pedido = ${codigoPedido}`);

            if (!dados_produto.rows[0].valor) {
               return response.status(417).send({ mensagem: "Produto invalido, código não existente" });
            }

            try {
               await ProdutoPedido.create({
                  codigo_produto,
                  codigo_pedido: codigoPedido,
                  quantidade: qtd
               });
            } catch (error) {
               console.log(error);
               throw Error('Erro ao adicionar produtos ao pedido.');
            }

            try {
               await Database
                  .table('pedido')
                  .where('codigo_pedido', codigoPedido)
                  .update({ valor_total: (+valorPedido.rows[0].valor_total) + (qtd(+dados_produto.rows[0].valor)) });
            } catch (error) {
               console.log(error);
               throw Error('Erro ao atualizar o valor do pedido.');
            }


            return response.status(200).send({ mensagem: 'Produto adicionado com sucesso ao pedido.' });

         } else {

            const mensagemErro = {
               'codigo_produto.required': 'É necessario selecionar o produto'
            }

            const validacao = await validateAll(request.all(), {
               codigo_produto: 'required'
            }, mensagemErro);

            let mensagem = validacao.messages();

            if (validacao.fails()) {
               return response.status(417).send({ mensagem: mensagem[0].message });
            }

            const { codigo_produto, qtd } = request.all();
            let pedido;

            const dados_produto = await Database.raw(`select valor from produto where codigo_produto = ${codigo_produto}`);

            if (!dados_produto.rows[0].valor) {
               return response.status(417).send({ mensagem: "Produto invalido, código não existente" });
            }

            try {
               pedido = await Pedido.create({
                  valor_total: qtd * (+dados_produto.rows[0].valor),
                  observacao: null,
                  troco: 0,
                  pedido_finalizado: false,
                  preparo_finalizado: false
               }, transacao);

            } catch (error) {
               await transacao.rollback();
               console.log(error);
               throw Error('Erro ao cadastrar pedido.');
            }

            try {
               await ProdutoPedido.create({
                  codigo_produto,
                  codigo_pedido: pedido.$attributes.codigo_pedido,
                  quantidade: qtd
               }, transacao);
            } catch (error) {
               await transacao.rollback();
               console.log(error);
               throw Error('Erro ao adicionar produtos ao pedido.');
            }

            await transacao.commit();
            return response.status(200).send({ mensagem: 'Pedido iniciado com sucesso.' });

         }

      } catch (error) {
         console.log(error);
         return response.status(500).send({ mensagem: error.toString() })
      }

   }

}

module.exports = PedidoController
