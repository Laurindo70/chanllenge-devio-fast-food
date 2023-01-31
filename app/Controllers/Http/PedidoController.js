'use strict'

const { validateAll } = use('Validator');

const Database = use('Database');
const Pedido = use('App/Models/Pedido');
const ProdutoPedido = use('App/Models/ProdutoPedido');
const WebSocketController = require('../Http/WebSocketController');
const Pagamento = use('App/Models/Pagamento');
class PedidoController {

   /**
  * @swagger
  * /api/adicionar-produto-pedido/codigo-pedido={codigoPedido}:
  *   post:
  *     tags:
  *       - Pedido
  *     summary: Cadastro de produtos no pedido.
  *     parameters:
  *       - name: codigoPedido
  *         description: Código do pedido.
  *         in: path
  *         required: false
  *         type: integer
  *         format: int64
  *       - name: codigo_produto
  *         description: Código do produto.
  *         in: body
  *         required: false
  *         type: body
  *         schema:
  *               $ref: "#/definitions/Pedido"
  *     responses:
  *       200:
  *         description: Mensagem de sucesso
  *         example:
  *           mensagem: Produto adicionado com sucesso.
  *           pedido:
  *               codigo_pedido: 0
  *               valor_total: 10
  *           produtos:
  *               - codigo_produto: 0
  *                 nome_produto: exemplo
  *                 valor_unidade: 0
  *                 quantidade: 0
  *                 valor: 0    
  *       500:
  *         description: Mensagem de erro interno do servidor.
  *         example:
  *           - mensagem: Erro ao adicionar produtos ao pedido.
  *           - mensagem: Erro ao atualizar o valor do pedido.
  *           - mensagem: Erro ao cadastrar pedido.
  *       417:
  *         description: Mensagem de erro de entrada de dados.
  *         example:
  *           - mensagem: É necessario selecionar o produto.
  *           - mensagem: É necessario o nome do cliente para finalizar o pedido.
  */

   async adicionarProduto({ request, response, params }) {

      const transacao = await Database.beginTransaction();

      try {

         const { codigoPedido } = await params;

         if (!isNaN(parseFloat(codigoPedido)) && isFinite(codigoPedido)) {

            const mensagemErro = {
               'codigo_produto.required': 'É necessario selecionar o produto',
               'quantidade.required': 'É necessario colocar a quantidade do produto.'
            }

            const validacao = await validateAll(request.all(), {
               codigo_produto: 'required',
               quantidade: 'required'
            }, mensagemErro);

            let mensagem = validacao.messages();

            if (validacao.fails()) {
               return response.status(417).send({ mensagem: mensagem[0].message });
            }

            const { codigo_produto, quantidade } = request.all();

            const dados_produto = await Database.raw(`select valor from produto where codigo_produto = ${codigo_produto}`);
            const valorPedido = await Database.raw(`select valor_total from pedido where codigo_pedido = ${codigoPedido}`);

            if (!dados_produto.rows[0].valor) {
               return response.status(417).send({ mensagem: "Produto invalido, código não existente" });
            }

            try {
               await ProdutoPedido.create({
                  codigo_produto,
                  codigo_pedido: codigoPedido,
                  quantidade: quantidade
               }, transacao);
            } catch (error) {
               await transacao.rollback();
               console.log(error);
               throw Error('Erro ao adicionar produtos ao pedido.');
            }

            try {
               await Database
                  .table('pedido')
                  .where('codigo_pedido', codigoPedido)
                  .update({ valor_total: (+valorPedido.rows[0].valor_total) + (quantidade * (+dados_produto.rows[0].valor)) });
            } catch (error) {
               await transacao.rollback();
               console.log(error);
               throw Error('Erro ao atualizar o valor do pedido.');
            }

            const dados_pedido = await transacao.raw(`select codigo_pedido, valor_total from pedido where codigo_pedido = ${codigoPedido};`);
            const produtos_pedido = await transacao.raw(`select produto_pedido.codigo_produto, produto.nome_produto, produto.valor as valor_unidade, sum(produto_pedido.quantidade) as quantidade, (sum(produto_pedido.quantidade)*produto.valor) as valor
         from produto_pedido inner join produto on produto.codigo_produto=produto_pedido.codigo_produto
         where produto_pedido.codigo_pedido = ${codigoPedido} and produto_pedido.removido = FALSE GROUP BY produto_pedido.codigo_produto, produto.nome_produto, produto.valor;`)

            await transacao.commit();
            return response.status(200).send({ mensagem: 'Produto adicionado com sucesso.', pedido: dados_pedido.rows[0], produtos: produtos_pedido.rows });

         }

         const mensagemErro = {
            'codigo_produto.required': 'É necessario selecionar o produto',
            'nome_cliente.required': 'É necessario o nome do cliente para finalizar o pedido',
            'quantidade.required': 'É necessario colocar a quantidade do produto.'
         }

         const validacao = await validateAll(request.all(), {
            codigo_produto: 'required',
            nome_cliente: 'required',
            quantidade: 'required'
         }, mensagemErro);

         let mensagem = validacao.messages();

         if (validacao.fails()) {
            return response.status(417).send({ mensagem: mensagem[0].message });
         }

         const { codigo_produto, quantidade, nome_cliente } = request.all();
         let pedido;

         const dados_produto = await Database.raw(`select valor from produto where codigo_produto = ${codigo_produto}`);

         if (!dados_produto.rows[0].valor) {
            return response.status(417).send({ mensagem: "Produto invalido, código não existente" });
         }

         try {
            pedido = await Pedido.create({
               valor_total: quantidade * (+dados_produto.rows[0].valor),
               observacao: null,
               troco: 0,
               nome_cliente
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
               quantidade: quantidade
            }, transacao);
         } catch (error) {
            await transacao.rollback();
            console.log(error);
            throw Error('Erro ao adicionar produtos ao pedido.');
         }

         const dados_pedido = await transacao.raw(`select codigo_pedido, valor_total from pedido where codigo_pedido = ${pedido.$attributes.codigo_pedido};`);
         const produtos_pedido = await transacao.raw(`select produto_pedido.codigo_produto, produto.nome_produto, produto.valor as valor_unidade, sum(produto_pedido.quantidade) as quantidade, (sum(produto_pedido.quantidade)*produto.valor) as valor
         from produto_pedido inner join produto on produto.codigo_produto=produto_pedido.codigo_produto
         where produto_pedido.codigo_pedido = ${pedido.$attributes.codigo_pedido} and produto_pedido.removido = FALSE GROUP BY produto_pedido.codigo_produto, produto.nome_produto, produto.valor;`)

         await transacao.commit();
         return response.status(200).send({ mensagem: 'Produto adicionado com sucesso.', pedido: dados_pedido.rows[0], produtos: produtos_pedido.rows });

      } catch (error) {
         console.log(error);
         return response.status(500).send({ mensagem: error.toString() })
      }

   }

   /**
  * @swagger
  * /api/remover-produto-pedido/codigo-pedido={codigoPedido}/codigo-produto={codigoProduto} :
  *   put:
  *     tags:
  *       - Pedido
  *     summary: Remoção de produto do pedido.
  *     parameters:
  *       - name: codigoPedido
  *         description: Código do pedido.
  *         in: path
  *         required: true
  *         type: integer
  *       - name: codigoProduto
  *         description: Código do produto.
  *         in: path
  *         required: true
  *         type: integer
  *     responses:
  *       200:
  *         description: Mensagem de sucesso.
  *         example:
  *           mensagem: Produto removido com sucesso
  *       500:
  *         description: Mensagem de Erro
  *         example:
  *           mensagem: Erro ao retirar produto do pedido.
  */

   async removerProduto({ request, response, params }) {

      const transacao = await Database.transaction();

      try {

         const { codigoPedido, codigoProduto } = params;

         const produto = await Database.raw(`select sum(produto_pedido.quantidade) as quantidade, (sum(produto_pedido.quantidade) * valor) as valor_total from produto_pedido inner join produto on produto.codigo_produto = produto_pedido.codigo_produto
         where produto_pedido.codigo_produto = ${codigoProduto} and codigo_pedido = ${codigoPedido} and removido = false
         group by produto_pedido.codigo_produto, produto.valor
         `);

         if (!produto.rows[0]) {
            return response.status(417).send({ mensagem: 'O produto não está presente nesse pedido.' });
         }

         const dadosPedido = await Database.raw(`select valor_total from pedido where codigo_pedido = ${codigoPedido}`);

         await transacao
            .table('pedido')
            .where('codigo_pedido', codigoPedido)
            .update({ valor_total: (dadosPedido.rows[0].valor_total - (+produto.rows[0].valor_total)), atualizado_em: new Date() });

         await transacao
            .table('produto_pedido')
            .where('codigo_produto', codigoProduto)
            .where('codigo_pedido', codigoPedido)
            .update({ removido: true, atualizado_em: new Date() });

         const pedido = await transacao.raw(`select count(*) as produtos from produto_pedido where codigo_pedido = ${codigoPedido} and removido = false;`);

         if (pedido.rows[0].produtos == 0) {
            await transacao
               .table('pedido')
               .where('codigo_pedido', codigoPedido)
               .update({ cancelado: true, atualizado_em: new Date() });
         }

         await transacao.commit();
         return response.status(200).send({ mensagem: 'Produto removido com sucesso' });

      } catch (error) {
         await transacao.rollback();
         console.log(error);
         return response.status(500).send({ mensagem: 'Erro ao retirar produto do pedido.' });
      }
   }

   /**
* @swagger
* /api/fechar-pedido/codigo-pedido={codigoPedido} :
*   post:
*     tags:
*       - Pedido
*     summary: Fechar pedido para o preparo.
*     parameters:
*       - name: codigoPedido
*         description: Código do pedido.
*         in: path
*         required: true
*         type: integer
*       - name: forma_pagamento
*         description: Pagamento do pedido.
*         in: body
*         required: false
*         type: body
*         schema:
*            $ref: "#/definitions/Pagamento"
*     responses:
*       200:
*         description: Mensagem de sucesso.
*         example:
*           pedido: 
*               codigp_pedido: 0
*               valor_total: 0
*               troco: 0
*               observacao: null
*               data: 00/00/0000 00:00
*           produtos:
*              - codigo_produto: 0
*                nome_produto: 'exemplo'
*                valor_unidade: 0
*                quantidade: 0
*                valor: 0
*       500:
*         description: Mensagem de Erro
*         example:
*           mensagem: Erro ao retirar produto do pedido.
*/

   async fecharPedido({ request, response, params }) {

      const transacao = await Database.beginTransaction();

      try {

         const { codigoPedido } = params;

         const { forma_pagamento, observacao } = request.all();

         if (!forma_pagamento[0]) {
            return response.status(417).send({ mensagem: 'É necessario selecionar a forma de pagamento.' });
         }

         const pedido = await transacao.raw(`select valor_total, pedido_finalizado from pedido where codigo_pedido = ${codigoPedido}`);
         let valor_total = 0;
         let devolver_troco = false;

         if (!pedido.rows[0]) {
            return response.status(404).send({ mensagem: 'Esse pedido não possui cadastro.' });
         }

         if (pedido.rows[0].pedido_finalizado) {
            return response.status(417).send({ mensagem: 'Esse pedido já foi fechado e enviado para a cozinha para preparo.' });
         }

         for (let i = 0; i < forma_pagamento.length; i++) {
            valor_total = + forma_pagamento[i].valor;
            const tipo_pagamento = await transacao.raw(`select recebe_troco from tipo_pagamento where id = ${forma_pagamento[i].tipo_pagamento}`);
            devolver_troco = (tipo_pagamento.rows[0].recebe_troco ? true : devolver_troco);
         }

         if (!devolver_troco && ((valor_total - (+pedido.rows[0].valor_total)) > 0)) {
            return response.status(417).send({ mensagem: 'Os valores inseridos são maiores que o valor total, e não será gerado nenhum troco pois nenhuma forma de pagamento escolhida é dinheiro.' });
         }

         if ((valor_total - pedido.rows[0].valor_total) < 0) {
            return response.status(417).send({ mensagem: 'Os valores inseridos são menores que o valor total.' });
         }

         await transacao
            .table('pedido')
            .where('codigo_pedido', codigoPedido)
            .update({
               troco: valor_total - pedido.rows[0].valor_total,
               observacao: observacao,
               pedido_finalizado: true,
               atualizado_em: new Date()
            });

         for (let i = 0; i < forma_pagamento.length; i++) {
            await Pagamento.create({
               codigo_pedido: codigoPedido,
               tipo_pagamento_id: forma_pagamento[i].tipo_pagamento,
               valor: forma_pagamento[i].valor
            }, transacao);
         }

         const dados_pedido = await transacao.raw(`select codigo_pedido, valor_total, troco, observacao, TO_CHAR(criado_em, 'DD/MM/YYYY HH24:MI') AS data from pedido where codigo_pedido = ${codigoPedido};`);
         const produtos_pedido = await transacao.raw(`select produto_pedido.codigo_produto, produto.nome_produto, produto.valor as valor_unidade, sum(produto_pedido.quantidade) as quantidade, (sum(produto_pedido.quantidade)*produto.valor) as valor
         from produto_pedido inner join produto on produto.codigo_produto=produto_pedido.codigo_produto
         where produto_pedido.codigo_pedido = ${codigoPedido} and produto_pedido.removido = FALSE GROUP BY produto_pedido.codigo_produto, produto.nome_produto, produto.valor;`);

         await transacao.commit();
         const socket = new WebSocketController();
         await socket.pedidosCozinha();
         return response.status(200).send({ pedido: dados_pedido.rows[0], produtos: produtos_pedido.rows });

      } catch (error) {
         await transacao.rollback();
         console.log(error);
         return response.status(500).send({ mensagem: 'Erro ao finalizar pedido.' });
      }
   }

   /**
  * @swagger
  * /api/finalizar-preparo/codigo-pedido={codigoPedido} :
  *   put:
  *     tags:
  *       - Pedido
  *     summary: Finalização do preparo do pedido.
  *     parameters:
  *       - name: codigoPedido
  *         description: Código do pedido.
  *         in: path
  *         required: true
  *         type: integer
  *     responses:
  *       200:
  *         description: Mensagem de sucesso.
  *         example:
  *           mensagem: Pedido 0 do cliente string já pronto para retirada.
  *       500:
  *         description: Mensagem de Erro
  *         example:
  *           mensagem: Erro ao finalizar preparo do pedido.
  */

   async finalizarPreparo({ request, response, params }) {
      try {

         const { codigoPedido } = params;

         await Database
            .table('pedido')
            .where('codigo_pedido', codigoPedido)
            .update({
               preparo_finalizado: true,
               atualizado_em: new Date()
            });

         const pedido = await Database.raw(`select nome_cliente from pedido where codigo_pedido = ${codigoPedido};`);

         const socket = new WebSocketController();
         await socket.pedidosFinalizado();

         return response.status(200).send({ mensagem: `Pedido ${codigoPedido} do cliente ${pedido.rows[0].nome_cliente} já pronto para retirada.` });

      } catch (error) {
         console.log(error);
         return response.status(500).send({ mensagem: 'Erro ao finalizar preparo do pedido.' });
      }
   }

   /**
  * @swagger
  * /api/cancelar-preparo/codigo-pedido={codigoPedido} :
  *   put:
  *     tags:
  *       - Pedido
  *     summary: Finalização do preparo do pedido.
  *     parameters:
  *       - name: codigoPedido
  *         description: Código do pedido.
  *         in: path
  *         required: true
  *         type: integer
  *     responses:
  *       200:
  *         description: Mensagem de sucesso.
  *         example:
  *           mensagem: Pedido cancelado com sucesso.
  *       500:
  *         description: Mensagem de Erro
  *         example:
  *           mensagem: Erro ao cancelar pedido.
  */

   async cancelarPedido({ request, response, params }) {
      try {

         const { codigoPedido } = params;

         await Database
            .table('pedido')
            .where('codigo_pedido', codigoPedido)
            .update({ cancelado: true, atualizado_em: new Date() });

         return response.status(200).send({ mensagem: 'Pedido cancelado com sucesso.' });

      } catch (error) {
         console.log(error);
         return response.status(500).send({ mensagem: 'Erro ao cancelar pedido.' });
      }
   }

   /**
  * @swagger
  * /api/listar-tipos-pagamento :
  *   get:
  *     tags:
  *       - Pedido
  *     summary: Lista de tipos de pagamentos.
  *     responses:
  *       200:
  *         description: Mensagem de sucesso.
  *         example:
  *           - id: 0
  *             nome_tipo_pagamento: teste
  *           - id: 0
  *             nome_tipo_pagamento: teste
  *       500:
  *         description: Mensagem de Erro
  *         example:
  *           mensagem: Erro ao listar os tipos de pagamentos.
  */
   
   async tipoPagamento({ request, response }){
      try {
         
         const tipos = await Database.raw(`select id, nome_tipo_pagamento FROM tipo_pagamento;`);

         return response.status(200).send(tipos.rows);

      } catch (error) {
         console.log(error);
         return response.status(500).send({ mensagem: 'Erro ao listar os tipos de pagamentos.' });
      }
   }

}

module.exports = PedidoController
