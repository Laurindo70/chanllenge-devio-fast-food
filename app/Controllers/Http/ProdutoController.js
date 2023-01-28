'use strict'

const { validateAll } = use('Validator');

const Database = use('Database');
const Produto = use('App/Models/Produto');


class ProdutoController {


   /**
  * @swagger
  * /api/cadstro-produto:
  *   post:
  *     tags:
  *       - Produto
  *     summary: Cadastro de produtos
  *     parameters:
  *       - name: nome_produto
  *         description: Nome do Produto
  *         in: formData
  *         required: true
  *         schema: {
  *            type: string
  *         }
  *       - name: valor
  *         description: Valor do Produto
  *         in: formData
  *         required: true
  *         schema: {
  *            type: numeric
  *         }
  *     responses:
  *       200:
  *         description: Mensagem de sucesso
  *         example:
  *           mensagem: Produto cadastrado com sucesso.
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

   async criacaoProduto({ request, response }) {

      try {

         const mensagemErro = {
            'nome_produto.required': 'É necessario preencher o nome do produto',
            'nome_produto.unique': 'Já existe um produto com esse nome cadastrado',
            'valor.required': 'É necessario preencher o valor do produto',
         };

         const validacao = await validateAll(request.all(), {
            nome_produto: 'required|unique:produto',
            valor: 'required'
         }, mensagemErro);

         let mensagem = validacao.messages();

         if (validacao.fails()) {
            return response.status(417).send({ mensagem: mensagem[0].message });
         }

         const { nome_produto, valor } = request.all();

         if (isNaN(valor)) {
            return response.status(417).send({ mensagem: 'O valor inserido não é um numero.' });
         }

         await Produto.create({
            nome_produto,
            valor
         });

         return response.status(200).send({ mensagem: 'Produto cadastrado com sucesso.' });

      } catch (error) {
         console.log(error);
         return response.status(500).send({ mensagem: 'Erro ao cadastrar novo produto.' });
      }

   }

   /**
  * @swagger
  * /api/listar-produtos/ativo={ativo}/pagina={pagina}/nome-produto={nomeProduto}/codigo-produto={codigoProduto} :
  *   get:
  *     tags:
  *       - Produto
  *     summary: Listagem dos produtos com paginação.
  *     parameters:
  *       - name: ativo
  *         description: Produtos ativos ou não.
  *         in: path
  *         required: false
  *         type: boolean
  *       - name: pagina
  *         description: Pagina que será acessada
  *         in: path
  *         required: false
  *         type: integer
  *       - name: nomeProduto
  *         description: filtro de nome
  *         in: path
  *         required: false
  *         type: string
  *       - name: codigoProduto
  *         description: filtro de nome
  *         in: path
  *         required: false
  *         type: integer
  *     responses:
  *       200:
  *         description: Dados requisitados.
  *         example:
  *           produtos: 
  *               codigo_produto: 0
  *               nome_produto: exemplo
  *               valor: 0
  *           pagina: 1
  *           total_pagina: 1
  *       500:
  *         description: Mensagem de Erro
  *         example:
  *           mensagem: Erro ao listar produtos.
  */

   async listagemProduto({ request, response, params }) {
      try {

         const { ativo, nomeProduto, codigoProduto, pagina } = params;
         let where = ` where ativo = ${ativo} and nome_produto ilike '%${nomeProduto || '' }%'`;
         let offset = ((pagina > 0 ? pagina : 1) - 1) * 10;

         if(codigoProduto != 0 && codigoProduto){
            where += ` and codigo_produto = ${codigoProduto}`
         }

         const produtos = await Database.raw(`SELECT codigo_produto, nome_produto, valor from produto ${where} ORDER BY nome_produto limit 10 offset ${offset}`);

         const total_paginas = await Database.raw(`SELECT count(*) as total from produto ${where}`);

         return response.status(200).send({produtos: produtos.rows, pagina : +pagina, total_paginas: (Math.ceil(total_paginas.rows[0].total / 10)) });

      } catch (error) {
         console.log(error);
         return response.status(500).send({ mensagem: 'Erro ao listar produtos.' });
      }
   }

    /**
  * @swagger
   /api/inativar-produto/codigo-produto={codigoProduto} :
  *   put:
  *     tags:
  *       - Produto
  *     summary: Inativação de produto.
  *     parameters:
  *       - name: codigoProduto
  *         description: Identificação do produto para Inativação.
  *         in: path
  *         required: true
  *         type: integer
  *     responses:
  *       200:
  *         description: Mensagem de sucesso.
  *         example:
  *           mensagem: Produto inativado com sucesso.
  *       500:
  *         description: Mensagem de Erro
  *         example:
  *           mensagem: Erro ao inativar produto.
  */

   async inativarProduto({ request, response, params }){
      try {
         
         const { codigoProduto } = params;

         await Database
         .table('produto')
         .where('codigo_produto', codigoProduto)
         .update({ ativo: false });

         return response.status(200).send({ mensagem: 'Produto inativado com sucesso.' });

      } catch (error) {
         console.log(error);
         return response.status(500).send({ mensagem: 'Erro ao inativar produto.' });
      }
   }


   /**
  * @swagger
   /api/ativar-produto/codigo-produto={codigoProduto} :
  *   put:
  *     tags:
  *       - Produto
  *     summary: Ativação de produto.
  *     parameters:
  *       - name: codigoProduto
  *         description: Identificação do produto para ativação.
  *         in: path
  *         required: true
  *         type: integer
  *     responses:
  *       200:
  *         description: Mensagem de sucesso.
  *         example:
  *           mensagem: Produto ativado com sucesso.
  *       500:
  *         description: Mensagem de Erro
  *         example:
  *           mensagem: Erro ao ativar produto.
  */

   async ativarProduto({ request, response, params }){
      try {
         
         const { codigoProduto } = params;

         await Database
         .table('produto')
         .where('codigo_produto', codigoProduto)
         .update({ ativo: true });

         return response.status(200).send({ mensagem: 'Produto ativado com sucesso.' });

      } catch (error) {
         console.log(error);
         return response.status(500).send({ mensagem: 'Erro ao ativar produto.' });
      }
   }

}

module.exports = ProdutoController
