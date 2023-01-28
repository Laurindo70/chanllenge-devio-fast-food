'use strict'

const { validateAll } = use('Validator');

const Database = use('Database');
const Pedido = use('App/Models/Pedido');
const ProdutoPedido = use('App/Models/ProdutoPedido');
 
class PedidoController {

   async adicionarProduto({ request, response, params }){

      const transacao = await Database.beginTransaction();

      try {
         
         const {codigoPedido} = await params;

         if(!isNaN(parseFloat(codigoPedido)) && isFinite(codigoPedido)){

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

            let dados_produto;

            dados_produto = await Database.raw(`SELECT produto.valor, produto_pedido.quantidade, (produto.valor * produto_pedido.quantidade) as total FROM produto LEFT JOIN produto_pedido on produto_pedido.codigo_produto = produto.codigo_produto where produto.codigo_produto = ${codigo_produto} and produto_pedido.codigo_pedido = ${codigoPedido};`);

            if(!dados_produto.rows[0].valor){
               dados_produto = await Database.raw(`select valor from produto where codigo_produto = ${codigo_produto}`);

               const valorPedido = await Database.raw(`select valor_total from pedido where codigo_pedido = ${codigoPedido}`);

               if(!dados_produto.rows[0].valor){
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

               await Database
                  .table('pedido')
                  .where('codigo_pedido', codigoPedido)
                  .update({ valor_total: (+valorPedido.rows[0].valor_total) + (qtd (+dados_produto.rows[0].valor)) });

               return response.status(200).send({ mensagem: 'Produto adicionado com sucesso ao pedido.' });
            }



            return response.status(200).send("ttests");

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

            if(!dados_produto.rows[0].valor){
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
