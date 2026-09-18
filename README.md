# Editor Visual (Visual Builder)

Editor visual arrasta-e-solta para montar páginas sem escrever código, com
exportação do projeto em `.zip` para sincronizar com o GitHub. Não depende
de nenhuma API de IA — tudo roda localmente no navegador.

Stack: **TanStack Start + React 19 + Tailwind CSS 4 + Puck** (`@puckeditor/core`).

## Como usar

```bash
npm install
npm run dev
```

Abra `http://localhost:3000`. A página inicial já carrega direto no editor
visual — não existe uma "página normal" separada do editor.

- **Painel esquerdo**: blocos prontos para arrastar (Header, Galeria
  Protegida, Tabela de Preços, Depoimentos, Banner, Rodapé, além de blocos
  simples de Texto, Imagem e Botão), organizados por categoria.
- **Clique em qualquer elemento** da página (texto, botão, imagem, seção)
  para abrir o painel direito com as propriedades daquele bloco: textos,
  cores (com seletor visual), espaçamento (padding) e URLs de imagem.
- **"+ Adicionar novo bloco"** no topo insere uma seção em branco no fim da
  página com um clique, sem precisar arrastar.
- **"Baixar Projeto (.zip)"** empacota todo o código-fonte do projeto,
  já com o estado atual do editor gravado em
  `src/data/initial-data.json`, pronto para extrair localmente ou commitar
  no GitHub. Ao rodar `npm install && npm run dev` no projeto extraído, o
  editor abre exatamente do jeito que foi deixado.
- Edições também ficam salvas automaticamente no navegador (localStorage),
  então recarregar a página não perde o trabalho.
- O botão no canto superior direito alterna entre modo **claro/escuro/auto**.

## Sobre a "Galeria Protegida"

A senha da Galeria Protegida é um recurso simples para uso pessoal (ocultar
fotos de visitantes casuais). Ela fica em texto no código-fonte e é
verificada no navegador — **não é segurança real**, então não deve ser usada
para proteger conteúdo sensível.

## Estrutura

```
src/
  components/       Topo do editor, botão de baixar/adicionar bloco, tema
  components/ui/     Peças de UI reutilizáveis (Button, Card, Input)
  puck/config.tsx     Configuração do Puck: lista de blocos disponíveis
  puck/blocks/        Cada bloco arrastável (Header, Banner, etc.)
  puck/fields/        Campos customizados do painel de propriedades (cor, espaçamento)
  data/initial-data.json  Conteúdo atual da página (sobrescrito ao baixar o .zip)
  routes/index.tsx    Página única: o editor
```

## Publicando as mudanças no GitHub

1. Edite a página visualmente e clique em **Baixar Projeto (.zip)**.
2. Extraia o `.zip` por cima da pasta do projeto (ou sobre um clone do
   repositório).
3. `git add -A && git commit -m "Atualiza página via editor visual" && git push`.

## Publicando o site (hospedagem compartilhada, ex: Hostinger)

Este projeto gera um site **100% estático** (HTML/CSS/JS puro) — não precisa
de VPS, nem de Node.js rodando no servidor. Funciona em qualquer hospedagem
compartilhada comum.

```bash
npm run build
```

Isso cria a pasta **`hospedagem-estatica/`**, já pronta pra subir. Dentro
dela tem só `index.html` e uma pasta `assets/`.

1. Abra o **Gerenciador de Arquivos** (ou FTP) do painel da Hostinger.
2. Entre na pasta pública do seu domínio (geralmente `public_html`).
3. Envie **todo o conteúdo** de dentro de `hospedagem-estatica/` pra lá
   (o `index.html` deve ficar direto dentro de `public_html`, não dentro de
   uma subpasta).
4. Pronto — acessando o seu domínio já abre o editor.

Se preferir rodar num VPS com Node.js (como o painel de ofertas já roda),
também funciona: depois do `npm run build`, o próprio comando `npm run
build` também gera `.output/server/index.mjs`, que pode ser executado com
`node .output/server/index.mjs` atrás de um nginx/pm2. Mas pra esse editor,
a opção estática acima é mais simples e não tem custo de servidor.
