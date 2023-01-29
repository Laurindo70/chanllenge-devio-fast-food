CREATE TABLE produto(
   codigo_produto SERIAL PRIMARY KEY,
   nome_produto VARCHAR(150) NOT NULL,
   valor DOUBLE PRECISION NOT NULL,
   ativo BOOLEAN NOT NULL,
   criado_em timestamp without time zone DEFAULT now(),
   atualizado_em timestamp without time zone DEFAULT now()
);

CREATE TABLE pedido(
   codigo_pedido SERIAL PRIMARY KEY,
   valor_total DOUBLE PRECISION NOT NULL,
   observacao TEXT,
   troco DOUBLE PRECISION NOT NULL,
   pedido_finalizado BOOLEAN NOT NULL,
   preparo_finalizado BOOLEAN NOT NULL,
   criado_em timestamp without time zone DEFAULT now(),
   atualizado_em timestamp without time zone DEFAULT now()
);

CREATE TABLE tipo_pagamento(
   id SERIAL PRIMARY KEY,
   nome_tipo_pagamento VARCHAR(100) NOT NULL,
   criado_em timestamp without time zone DEFAULT now(),
   atualizado_em timestamp without time zone DEFAULT now()
);

CREATE TABLE produto_pedido(
   codigo_produto INTEGER NOT NULL,
   codigo_pedido INTEGER NOT NULL,
   quantidade integer NOT NULL,
   criado_em timestamp without time zone DEFAULT now(),
   atualizado_em timestamp without time zone DEFAULT now(),
   FOREIGN KEY(codigo_produto) REFERENCES produto(codigo_produto),
   FOREIGN KEY(codigo_pedido) REFERENCES pedido(codigo_pedido)
);

CREATE TABLE pagamento(
   id SERIAL PRIMARY KEY,
   codigo_pedido INTEGER NOT NULL,
   tipo_pgamento_id INTEGER NOT NULL,
   valor DOUBLE PRECISION NOT NULL,
   criado_em timestamp without time zone DEFAULT now(),
   atualizado_em timestamp without time zone DEFAULT now(),
   FOREIGN KEY(codigo_pedido) REFERENCES pedido(codigo_pedido),
   FOREIGN KEY(tipo_pgamento_id) REFERENCES tipo_pagamento(id)
);