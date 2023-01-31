'use strict'

const Ws = use('Ws');
const Database = use('Database');

class WebSocketController {

   async pedidosCozinha(){
      let pedidos = [];
      const dados_pedidos = await Database.raw(`select codigo_pedido, nome_cliente from pedido where pedido_finalizado = true and preparo_finalizado = FALSE and cancelado = FALSE;`);

      for(let i = 0; i < dados_pedidos.rows.length; i++){
         const produtos = await Database.raw(`select produto_pedido.codigo_produto, produto.nome_produto, sum(produto_pedido.quantidade) as quantidade
         from produto_pedido inner join produto on produto.codigo_produto=produto_pedido.codigo_produto
         where produto_pedido.codigo_pedido = ${dados_pedidos.rows[i].codigo_pedido} and produto_pedido.removido = FALSE GROUP BY produto_pedido.codigo_produto, produto.nome_produto, produto.valor;`);

         let pedido = dados_pedidos.rows[i];
         pedido.produtos = produtos.rows;

         pedidos.push(pedido);
      }

      const topic = Ws.getChannel('pedidoCozinha').topic('pedidoCozinha');

      if(topic){
         topic.broadcast('pedidoCozinha', { pedidos });
      }
   }

   async pedidosFinalizado(){
      let pedidos = [];
      const dados_pedidos = await Database.raw(`SELECT codigo_pedido, nome_cliente from pedido where preparo_finalizado = true and cancelado = false and criado_em BETWEEN  (NOW() - INTERVAL '1 DAY') and NOW();`);

      for(let i = 0; i < dados_pedidos.rows.length; i++){
         const produtos = await Database.raw(`select produto_pedido.codigo_produto, produto.nome_produto, sum(produto_pedido.quantidade) as quantidade
         from produto_pedido inner join produto on produto.codigo_produto=produto_pedido.codigo_produto
         where produto_pedido.codigo_pedido = ${dados_pedidos.rows[i].codigo_pedido} and produto_pedido.removido = FALSE GROUP BY produto_pedido.codigo_produto, produto.nome_produto, produto.valor;`);

         let pedido = dados_pedidos.rows[i];
         pedido.produtos = produtos.rows;

         pedidos.push(pedido);
      }

      const topic = Ws.getChannel('pedidoFinalizado').topic('pedidoFinalizado');

      if(topic){
         topic.broadcast('pedidoFinalizado', { pedidos });
      }
   }

}

module.exports = WebSocketController
