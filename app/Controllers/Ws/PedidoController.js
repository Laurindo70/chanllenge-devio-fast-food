'use strict'

const Database = use('Database');

class PedidoController {
  constructor({ socket, request }) {
    this.socket = socket
    this.request = request
  }

  async onPedidoCozinha() {
    console.log('conectado');
    let pedidos = [];
    const dados_pedidos = await Database.raw(`select codigo_pedido, nome_cliente from pedido where pedido_finalizado = true and preparo_finalizado = FALSE and cancelado = FALSE;`);

    for (let i = 0; i < dados_pedidos.rows.length; i++) {
      const produtos = await Database.raw(`select produto_pedido.codigo_produto, produto.nome_produto, sum(produto_pedido.quantidade) as quantidade
         from produto_pedido inner join produto on produto.codigo_produto=produto_pedido.codigo_produto
         where produto_pedido.codigo_pedido = ${dados_pedidos.rows[i].codigo_pedido} and produto_pedido.removido = FALSE GROUP BY produto_pedido.codigo_produto, produto.nome_produto, produto.valor;`);

      let pedido = dados_pedidos.rows[i];
      pedido.produtos = produtos.rows;

      pedidos.push(pedido);
    }
    console.log(pedidos);
    this.socket.broadcastToAll('pedidoCozinha', pedidos);
  }

  // async onPedidoFinalizado(){

  // }

  onClose() {
    this.socket.broadcastToAll('drop:connection');
  }

}

module.exports = PedidoController
