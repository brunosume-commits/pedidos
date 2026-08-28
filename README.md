# Arte Fogão — sistema de pedidos (versão Cloudflare)

Esta é a nova versão do sistema, rodando fora da plataforma de Artifacts.
Vantagens: baixar/imprimir o relatório funciona de verdade, e os dados ficam
guardados num banco de verdade (Cloudflare D1) em vez de depender da página
salvar a si mesma.

O banco de dados **já foi criado** na sua conta Cloudflare:
- Nome: `arte-fogao-db`
- Id: `3c348acf-de13-4989-be17-14ad4a8bef4d`
- Já tem a tabela `estado` pronta (veja `schema.sql`).

Falta só publicar o código. Abaixo o passo a passo, do mesmo jeito que você
já fez com o `artefogaobot`.

## Passo 1 — Criar o repositório no GitHub

1. Entre em https://github.com/new
2. Nome do repositório: `arte-fogao` (é só um nome, pode ser outro se preferir)
3. Deixe "Public" ou "Private", tanto faz
4. **Não** marque nenhuma opção de "adicionar README" — deixe o repositório vazio
5. Clique em "Create repository"

## Passo 2 — Subir os arquivos

Na página do repositório recém-criado, clique no link **"uploading an existing file"**
(ou "upload files" no menu). Arraste TODOS os arquivos e pastas deste pacote
(mantendo a estrutura de pastas: `public/`, `src/`, `wrangler.toml`, `package.json`
etc.) e clique em "Commit changes".

## Passo 3 — Conectar no Cloudflare

1. Entre no painel da Cloudflare: https://dash.cloudflare.com
2. Vá em **Workers & Pages** → **Create** → aba **Workers** → **Connect to Git** (ou "Import a repository")
3. Autorize o Cloudflare a acessar sua conta GitHub, se pedir
4. Selecione o repositório `arte-fogao` que você acabou de criar
5. Nas configurações de build, o Cloudflare deve detectar o `wrangler.toml`
   sozinho (framework: "Workers"). Não precisa mexer em comando de build.
6. Clique em **Save and Deploy**

## Passo 4 — Conferir o vínculo com o banco de dados (D1)

O `wrangler.toml` já vem apontando para o banco `arte-fogao-db` que criei
para você. Depois do primeiro deploy, confira em:

**Workers & Pages → arte-fogao → Settings → Bindings**

Deve aparecer um binding do tipo **D1 Database** chamado `DB` apontando para
`arte-fogao-db`. Se por algum motivo não aparecer automaticamente, adicione
manualmente ali mesmo (Add binding → D1 Database → variable name `DB` →
selecione `arte-fogao-db`) e clique em Deploy de novo.

## Pronto

Depois do deploy, a Cloudflare te dá um link tipo
`https://arte-fogao.SEU-USUARIO.workers.dev` — esse é o novo endereço do
sistema. Pode salvar como favorito e abrir de qualquer aparelho; os dados
agora vêm sempre do banco de dados, então não tem mais o problema de aparelho
diferente mostrando informação diferente ou desatualizada.

## Fazendo ajustes depois

Sempre que eu (Claude) mandar uma atualização de código daqui pra frente, o
processo é: você sobe os arquivos novos no mesmo repositório do GitHub
(substituindo os antigos) e a Cloudflare publica a nova versão sozinha em
1-2 minutos — não precisa repetir os passos 3 e 4.

## Estrutura do projeto

- `public/index.html` — o sistema inteiro (front-end), igual ao que já existia,
  só que agora busca e salva os dados em `/api/state` em vez de "publicar"
  a própria página.
- `src/worker.js` — o servidor (Cloudflare Worker): serve o `index.html` e
  responde `/api/state` (GET lê do banco, POST grava no banco).
- `wrangler.toml` — configuração do Worker (nome, onde estão os arquivos
  estáticos, qual banco D1 usar).
- `schema.sql` — script SQL da tabela usada (só de referência; o banco já
  está criado e com a tabela pronta).
