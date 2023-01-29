'use strict'


const Rotas = use('Route')

Rotas.group(() => {

  Rotas.post('/cadstro-produto', 'ProdutoController.criacaoProduto');
  Rotas.get('/listar-produtos/ativo=:ativo/pagina=:pagina/nome-produto=:nomeProduto?/codigo-produto=:codigoProduto?', 'ProdutoController.listagemProduto');
  Rotas.put('/inativar-produto/codigo-produto=:codigoProduto', 'ProdutoController.inativarProduto');
  Rotas.put('/ativar-produto/codigo-produto=:codigoProduto', 'ProdutoController.ativarProduto');
  Rotas.post('/adicionar-produto-pedido/codigo-pedido=:codigoPedido?', 'PedidoController.adicionarProduto');  
  Rotas.put('/remover-produto-pedido/codigo-pedido=:codigoPedido/codigo-produto=:codigoProduto', 'PedidoController.removerProduto');  
  Rotas.post('/fechar-pedido/codigo-pedido=:codigoPedido', 'PedidoController.fecharPedido');  

}).prefix('api');


