'use strict'


const Rotas = use('Route')

Rotas.group(() => {

  Rotas.post('/cadstro-produto', 'ProdutoController.criacaoProduto');
  Rotas.get('/listar-produtos/ativo=:ativo/pagina=:pagina/nome-produto=:nomeProduto?/codigo-produto=:codigoProduto?', 'ProdutoController.listagemProduto');
  Rotas.put('/inativar-produto/codigo-produto=:codigoProduto', 'ProdutoController.inativarProduto');
  Rotas.put('/ativar-produto/codigo-produto=:codigoProduto', 'ProdutoController.ativarProduto');
  Rotas.post('/adicionar-produto-pedido/codigo-pedido=:codigoPedido?', 'PedidoController.adicionarProduto');  

}).prefix('api');


