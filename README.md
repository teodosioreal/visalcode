# Editor Visual (Visual Builder)

Duas ferramentas num só app, sem depender de nenhuma API de IA — tudo roda
localmente no navegador:

- **aba "Páginas"**: editor visual arrasta-e-solta para montar páginas.
- **aba "Fluxos"**: editor de formulários com etapas sequenciais
  (transições, validação e ramificação condicional).

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
- **"Conectar GitHub"** salva o conteúdo editado direto num repositório do
  GitHub, sem precisar baixar `.zip`. Veja a seção abaixo.

## Conectar GitHub (salvar direto no repositório)

Clique em **"Conectar GitHub"** no topo do editor e informe:

- Um **token de acesso pessoal** (fine-grained) criado em
  [github.com/settings/personal-access-tokens/new](https://github.com/settings/personal-access-tokens/new),
  com acesso restrito **só a este repositório** e permissão **Contents:
  Read and write**.
- Usuário/organização, nome do repositório e branch (ex: `teodosioreal` /
  `visalcode` / `main`).

Depois de conectado:

- **"Salvar no GitHub"** grava o conteúdo atual em
  `src/data/initial-data.json` do repositório, como um commit direto na
  branch configurada.
- **"Carregar do GitHub"** (no ícone de engrenagem ao lado) traz o conteúdo
  que já está no repositório para dentro do editor.

O token fica guardado **só no seu navegador** (localStorage) — nunca é
enviado a nenhum lugar além da própria API do GitHub. Não use essa opção em
computador compartilhado, e revogue o token em
[github.com/settings/tokens](https://github.com/settings/tokens) se
precisar.

Essa conexão salva só o **conteúdo da página** (o que muda quando você
edita visualmente). Para levar todo o código-fonte do projeto pra um
repositório novo pela primeira vez, use o **"Baixar Projeto (.zip)"**.

## Editor de Fluxos (`/flows`)

Configura formulários com etapas sequenciais que avançam conforme o
preenchimento — tipo um Typeform próprio. Fica na aba **"Fluxos"**, no topo
da tela.

- **Painel esquerdo**: lista de etapas — adicionar, duplicar, reordenar,
  excluir e marcar qual é a etapa inicial (ícone ▶).
- **Centro (pré-visualização ao vivo)**: mostra a etapa selecionada com a
  aparência real. Um alternador **desktop/celular** no topo mostra a mesma
  etapa dentro de uma moldura de celular, pra ver como fica numa tela
  pequena. Clique em **"Testar fluxo"** pra preencher de verdade e ver a
  transição, o carregamento entre etapas, a validação e o avanço
  acontecendo (depois, **"Sair do teste"** volta a mostrar a etapa que
  você está editando).
- **Painel direito**, por etapa selecionada:
  - **Etapa**: título, descrição e uma imagem opcional — cole uma URL ou
    clique em **"Enviar"** pra escolher uma foto do computador/celular
    (ela é redimensionada automaticamente e guardada dentro do próprio
    fluxo, sem precisar de link externo nem de servidor pra hospedar).
    Pode aparecer como **banner no topo do card** ou como **fundo cobrindo a
    etapa inteira** (com uma sobreposição escura automática pra manter o
    texto legível em cima da foto). A descrição aceita `{{id-do-campo}}`
    pra citar a resposta dada numa etapa anterior — útil pra montar uma
    etapa final de "diagnóstico" que resume o que a pessoa preencheu antes
    de pedir o contato dela.
  - **Efeito e tempo de transição**: tipo de animação (fade, deslizar,
    zoom, step-up...), duração em ms, delay e curva de easing (inclusive
    `cubic-bezier` personalizado).
  - **Carregamento entre etapas**: liga uma barrinha de "processando" (com
    spinner e mensagem customizável, ex: "Montando seu diagnóstico...")
    mostrada por alguns segundos ao sair desta etapa, antes de revelar a
    próxima — dá a impressão de que a resposta foi analisada.
  - **Regras e validação**: se a etapa é obrigatória, se avança sozinha
    (ao preencher/selecionar) ou só com clique no botão de avançar, e o
    texto desse botão (ex: "Quero minha avaliação").
  - **Campos**: adicionar campos (texto, e-mail, número, seleção
    única/múltipla, upload, data...), com rótulo, obrigatoriedade, mensagem
    de erro customizada e regras de validação (tamanho mín/máx, valor
    mín/máx, opções da seleção).
  - **Ramificação (branching)**: regras "se a resposta de tal campo for
    X, vá para a etapa Y", mais uma etapa padrão de destino quando nenhuma
    regra bate.
  - **Link final (fim do fluxo)**: transforma o botão desta etapa num link
    de saída de verdade (ex: `https://wa.me/55...`, um checkout, uma página
    de agendamento) em vez de avançar pra outra etapa — o ponto final real
    do funil, com texto do botão customizável e opção de abrir em nova aba.
- **"Ver JSON"**: mostra o arquivo de configuração por trás do editor
  visual — dá pra editar o JSON diretamente ali e clicar em "Aplicar" pra
  atualizar o fluxo (sincronização nos dois sentidos: editar no formulário
  visual atualiza o JSON, e editar o JSON atualiza o formulário visual).
- **"Importar"** aceita três tipos de arquivo:
  - Um `.json` de fluxo (gerado pelo próprio "Baixar .json") — carrega direto.
  - Um arquivo de **código** (`.tsx`/`.ts`/`.jsx`/`.js`) que tenha uma lista de
    perguntas parecida com `[{ question: "...", options: [...] }, ...]`.
  - Um **`.zip` do projeto inteiro** — o editor vasculha todos os arquivos de
    código dentro dele (ignorando `node_modules`, pastas de build e
    componentes de UI genéricos) procurando essa mesma lista de perguntas.

  Em qualquer um dos dois últimos casos, o editor acha a lista sozinho (sem
  executar o código, só lê o texto) e abre um assistente pra você dizer qual
  campo é a pergunta, as opções, o subtítulo e a imagem — depois gera uma
  etapa por pergunta automaticamente, encadeadas em sequência, com a opção
  de já adicionar uma etapa final de captura de contato (nome + WhatsApp).
  Dá pra escolher se isso substitui o fluxo atual ou entra no final dele.
- **"Baixar .json"** exporta o fluxo atual pra usar/versionar em outro lugar.
- Assim como na aba Páginas, fica salvo automaticamente no navegador com
  data/hora da última alteração.

## Sobre a "Galeria Protegida"

A senha da Galeria Protegida é um recurso simples para uso pessoal (ocultar
fotos de visitantes casuais). Ela fica em texto no código-fonte e é
verificada no navegador — **não é segurança real**, então não deve ser usada
para proteger conteúdo sensível.

## Estrutura

```
src/
  components/        Topo do editor de páginas, abas de navegação, tema
  components/ui/     Peças de UI reutilizáveis (Button, Card, Input, Select, Switch, Dialog)
  puck/config.tsx     Configuração do Puck: lista de blocos disponíveis
  puck/blocks/        Cada bloco arrastável (Header, Banner, etc.)
  puck/fields/        Campos customizados do painel de propriedades (cor, espaçamento)
  data/initial-data.json  Conteúdo atual da página (sobrescrito ao baixar o .zip)
  flows/types.ts       Tipos do modelo de fluxo (FlowConfig, FlowStep, TransitionConfig...)
  flows/FlowEditor.tsx Editor de fluxos: junta lista de etapas, preview e propriedades
  flows/panels/        Seções do painel de propriedades (transição, validação, campos, branching)
  routes/index.tsx    Aba "Páginas"
  routes/flows.tsx    Aba "Fluxos"
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
