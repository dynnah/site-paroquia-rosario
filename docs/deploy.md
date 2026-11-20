# Publicação e automações (Fase 8)

Passo a passo para colocar o site no ar e deixá-lo se atualizando sozinho. O código já está pronto: o que falta são as configurações nos painéis do **GitHub**, do **Cloudflare**, do **Sanity** e do **Registro.br**, que só você (ou quem tem as contas da paróquia) pode fazer. Os nomes dos menus mudam de vez em quando; o que importa são os valores indicados.

**Primeiro em teste, depois o domínio.** O site vai ao ar primeiro no endereço de teste do Cloudflare (`https://NOME-DO-PROJETO.pages.dev`), com `BLOQUEAR_BUSCADORES=true`: assim dá para mostrar, revisar e aprovar sem o Google listar nada. O domínio `.org.br` e a abertura para os buscadores ficam para o [lançamento](#5-lançamento-domínio-registrobr-e-cloudflare), depois da aprovação final.

## Como as peças se encaixam

```
 Equipe publica no Studio (Sanity) ──webhook──┐
                                              ▼
 GitHub Actions, todo dia 00h05 ──Deploy Hook──▶ Cloudflare Pages ──▶ site no ar
 push na branch main ─────────────────────────┘   (build + publicação)

 GitHub Actions, dia 1 de cada mês ──▶ backup do Sanity (artefato de 90 dias)
```

- **Por que refazer o site todo dia?** O site é estático. A liturgia do dia e o "Próxima missa" saem prontos no build, e o texto das leituras muda a cada dia. Sem o rebuild das 00h05, o site mostraria a liturgia de ontem.
- **Por que o webhook do Sanity?** Para que um aviso, evento ou post publicado no Studio apareça no site em 1 ou 2 minutos, sem esperar a meia-noite.

## O que já está no repositório

| Arquivo                                 | O que faz                                                                                   |
| --------------------------------------- | ------------------------------------------------------------------------------------------- |
| `.github/workflows/rebuild-diario.yml`  | Todo dia às 00h05 (São Paulo) chama o Deploy Hook do Cloudflare. Também roda na mão.         |
| `.github/workflows/backup-mensal.yml`   | Dia 1 de cada mês exporta o dataset do Sanity e guarda o arquivo por 90 dias. Também na mão. |
| `site/public/_headers`                  | Cache dos arquivos do site no Cloudflare Pages.                                              |
| `site/.env.example`, `studio/.env.example` | Lista das variáveis de ambiente.                                                          |

Os dois workflows só rodam sozinhos depois de estarem na branch `main` (o GitHub só agenda o que está na branch padrão).

## Ordem sugerida

1. [GitHub](#1-github): confirmar o repositório e as Actions.
2. [Sanity](#2-sanity-parte-1-publicar-o-studio): publicar o Studio atualizado.
3. [Cloudflare Pages](#3-cloudflare-pages): criar o projeto e o primeiro build (no endereço `*.pages.dev`, em modo de teste).
4. [Deploy Hooks, secrets e webhook](#4-ligar-as-automações): ligar rebuild diário, webhook e backup.
5. [Conferência em teste](#6-conferência-depois-de-publicar) e aprovação final com o pároco e a secretaria.
6. [Lançamento](#5-lançamento-domínio-registrobr-e-cloudflare): domínio `.org.br`, `SITE_URL` final e abrir para os buscadores.

---

## 1. GitHub

O repositório é `dynnah/site-paroquia-rosario`.

1. Em **Settings → Actions → General**, confirme que **Actions permissions** está em "Allow all actions" (ou permite as da própria GitHub: `actions/checkout`, `actions/setup-node`, `actions/upload-artifact`).
2. Em **Settings → Secrets and variables → Actions** você vai cadastrar, nos passos 4.2 e 4.4:
   - _Secrets_: `CLOUDFLARE_DEPLOY_HOOK_URL` e `SANITY_BACKUP_TOKEN`.
   - _Variables_: `SANITY_PROJECT_ID` (e, só se mudar o dataset, `SANITY_DATASET`; o padrão é `production`).

> **Atenção:** em repositórios públicos, o GitHub **desliga os workflows agendados depois de 60 dias sem nenhuma atividade** no repositório (commits contam). Se o rebuild diário parar, vá em **Actions** e reative. Quando um workflow agendado falha, o GitHub avisa por e-mail a pessoa que mexeu por último no agendamento.

## 2. Sanity, parte 1: publicar o Studio

O Studio da equipe fica em `https://paroquia-do-rosario.sanity.studio`. Ele só mostra campos novos (como a linha da conta bancária do Pix e o tipo "pastoral ou movimento") depois de publicado de novo.

No seu computador, na pasta do projeto:

```bash
npx sanity login            # uma vez, com a conta do Sanity
npm run deploy -w studio    # publica o Studio
```

## 3. Cloudflare Pages

1. Em [dash.cloudflare.com](https://dash.cloudflare.com), vá em **Workers & Pages → Create → Pages → Connect to Git** e escolha o repositório `site-paroquia-rosario`. (Se o painel só oferecer "Workers", use a opção de importar um repositório; os valores abaixo são os mesmos.)
2. Em **Set up builds and deployments**:

   | Campo                       | Valor                   |
   | --------------------------- | ----------------------- |
   | Production branch           | `main`                  |
   | Framework preset            | `Astro` (ou `None`)     |
   | Build command               | `npm run build -w site` |
   | Build output directory      | `site/dist`             |
   | Root directory (advanced)   | deixe em branco         |

3. Em **Environment variables (Production)**:

   | Variável                    | Valor                                                                                                         |
   | --------------------------- | ------------------------------------------------------------------------------------------------------------- |
   | `NODE_VERSION`              | `22` (o projeto exige Node 22.12 ou mais)                                                                     |
   | `PUBLIC_SANITY_PROJECT_ID`  | o ID do projeto, em [sanity.io/manage](https://www.sanity.io/manage)                                          |
   | `PUBLIC_SANITY_DATASET`     | `production`                                                                                                  |
   | `SITE_URL`                  | por enquanto `https://NOME-DO-PROJETO.pages.dev`; no lançamento vira o endereço final (com `https://`, sem `/`) |
   | `BLOQUEAR_BUSCADORES`       | `true` enquanto o site estiver em teste: todas as páginas saem com `noindex` e o `robots.txt` proíbe tudo. **Apague no lançamento.** |
   | `PUBLIC_CF_ANALYTICS_TOKEN` | opcional (veja `docs/qualidade.md`, ou ligue o Web Analytics pelo painel)                                     |

   Não precisa de `SANITY_API_READ_TOKEN`: o dataset do plano Free é público. Não defina `LITURGIA_OCULTAR_TEXTO`: o texto das leituras já vai no ar por padrão (a variável só serve para tirá-lo do ar se a CNBB pedir; veja `docs/liturgia.md`).

4. Clique em **Save and Deploy** e espere o primeiro build (uns 2 a 3 minutos). O site abre em `https://NOME-DO-PROJETO.pages.dev`.
5. **Economize builds:** em **Settings → Builds → Branch control**, deixe os _preview deployments_ em **None** (ou só a branch `main`). O plano Free tem **500 builds por mês**, e cada push em qualquer branch gastaria um.

> No log do build, procure a linha `[liturgia] … a API não respondeu … usando a reserva`. Se aparecer, a página de liturgia saiu com o aviso de reserva em vez das leituras. Refaça o build (**Deployments → Retry deployment**).

## 4. Ligar as automações

### 4.1 Deploy Hooks (dois, um para cada uso)

Em **Cloudflare Pages → o projeto → Settings → Builds → Deploy hooks → Add deploy hook**, crie:

- `GitHub Actions`, branch `main`;
- `Sanity`, branch `main`.

Cada um gera uma URL. Ela é um segredo: quem a tem pode disparar builds. Dois hooks permitem trocar um sem mexer no outro.

### 4.2 Rebuild diário

Em **GitHub → Settings → Secrets and variables → Actions → New repository secret**:

- Nome `CLOUDFLARE_DEPLOY_HOOK_URL`, valor: a URL do hook `GitHub Actions`.

Teste: **Actions → Rebuild diário → Run workflow**. Em seguida, o Cloudflare deve mostrar um build novo em **Deployments**. O horário (`5 3 * * *`, em UTC) equivale a 00h05 em São Paulo.

### 4.3 Rebuild ao publicar no Sanity (webhook)

O plano Free do Sanity inclui webhooks (2 no momento; confira em [sanity.io/pricing](https://www.sanity.io/pricing)). Em [sanity.io/manage](https://www.sanity.io/manage) → o projeto → **API → Webhooks → Create webhook**:

| Campo                  | Valor                                                                                                   |
| ---------------------- | ------------------------------------------------------------------------------------------------------- |
| Name                   | `Rebuild do site`                                                                                       |
| URL                    | a URL do hook `Sanity`                                                                                  |
| Dataset                | `production`                                                                                            |
| Trigger on             | Create, Update e Delete                                                                                 |
| Filter                 | `!(_id in path("drafts.**")) && !(_id in path("versions.**"))`                                          |
| Projection             | em branco                                                                                               |
| HTTP method            | `POST`                                                                                                  |
| Drafts / Versions      | desligados (se o painel tiver essas opções)                                                             |

O filtro é importante: sem ele, cada rascunho salvo (o Studio salva sozinho enquanto se digita) dispararia um build e gastaria a cota de 500 por mês.

> **Cuidado com alterações em massa.** Cada documento publicado dispara um build. Antes de rodar os scripts `seed:*` do Studio ou de importar muitos documentos, **desligue o webhook** (botão _Disable_) e ligue de novo no fim.
>
> **Conta de builds.** 1 por dia (rebuild) + 1 por push na `main` + 1 por publicação no Studio. Para uma paróquia, fica bem abaixo de 500. Se um dia apertar, desligue o webhook e troque por um agendamento a cada poucas horas no `rebuild-diario.yml` (por exemplo `0 */6 * * *`).

### 4.4 Backup mensal

1. Em **sanity.io/manage → o projeto → API → Tokens → Add API token**: nome `Backup GitHub Actions`, permissão **Viewer** (só leitura). Copie o token: ele aparece uma única vez.
2. No GitHub, cadastre:
   - _Secret_ `SANITY_BACKUP_TOKEN`: o token.
   - _Variable_ `SANITY_PROJECT_ID`: o ID do projeto (não é segredo).
3. Teste: **Actions → Backup mensal do Sanity → Run workflow**. No fim, o resumo da execução mostra o arquivo e o número de documentos, e o arquivo fica em **Artifacts** (`backup-sanity`).

O backup guarda só os documentos **publicados** e as imagens (`--no-drafts`). O dataset do plano Free é público, então o arquivo não contém nada que já não esteja no ar. Baixe o arquivo de vez em quando e guarde uma cópia no cofre da paróquia: o GitHub apaga os artefatos depois de 90 dias.

**Restaurar** (no seu computador, depois do `sanity login`):

```bash
# só traz de volta o que foi apagado, sem tocar no que existe:
npx sanity dataset import rosario-sanity-production-AAAA-MM-DD.tar.gz --dataset production --missing
# ou sobrescreve os documentos que têm o mesmo ID:
npx sanity dataset import rosario-sanity-production-AAAA-MM-DD.tar.gz --dataset production --replace
```

Para recomeçar de um dataset vazio, crie outro dataset (`npx sanity dataset create teste`) e importe lá primeiro.

### 4.5 CORS do Sanity

**Não precisa configurar.** O site só lê o Sanity durante o build, no servidor do Cloudflare; o navegador de quem visita nunca fala com o Sanity. O Studio hospedado em `*.sanity.studio` já vem liberado. Só vire a mão aqui se um dia o site passar a ler o Sanity direto do navegador: aí cadastre o endereço do site em **API → CORS origins**.

## 5. Lançamento: domínio, Registro.br e Cloudflare

**Só depois da aprovação final.** Até lá o site fica no endereço `*.pages.dev`, bloqueado para buscadores.

1. **Registre o domínio** em [registro.br](https://registro.br): um `.org.br` no CNPJ da paróquia (ex.: `paroquiadorosariojp.org.br`).
2. **Adicione o domínio ao Cloudflare:** **Add a domain** → digite o domínio → plano **Free**. O Cloudflare mostra **dois servidores de nome** (algo como `ada.ns.cloudflare.com`).
3. **Aponte o Registro.br para o Cloudflare:** no Registro.br, abra o domínio → **DNS → Alterar servidores DNS** → **Usar outros servidores DNS** e informe os dois servidores do Cloudflare. Se o DNSSEC estiver ligado no Registro.br, desligue antes de trocar. A troca leva de minutos a algumas horas; o Cloudflare avisa por e-mail quando ficar ativa.
4. **Ligue o domínio ao Pages:** no projeto → **Custom domains → Set up a custom domain** → `paroquiadorosariojp.org.br`. Repita com `www.paroquiadorosariojp.org.br`. O Cloudflare cria os registros DNS sozinho e emite o HTTPS.
5. **HTTPS sempre:** em **SSL/TLS → Edge Certificates**, ligue **Always Use HTTPS**.
6. **Redirecionar `www` para a raiz:** em **Rules → Redirect Rules → Create rule**:
   - _When incoming requests match_: **Hostname** equals `www.paroquiadorosariojp.org.br`.
   - _Then_: **Dynamic**, expressão `concat("https://paroquiadorosariojp.org.br", http.request.uri.path)`, código **301**, marcando **Preserve query string**.
7. **Troque o `SITE_URL` e abra para os buscadores:** em **Settings → Environment variables**, ponha `https://paroquiadorosariojp.org.br` (sem `/` no fim), **apague `BLOQUEAR_BUSCADORES`** e refaça o build (**Deployments → Retry deployment**). É ele que corrige o endereço canônico, o Open Graph (a prévia do link no WhatsApp e no Instagram), o `sitemap.xml` e o `robots.txt`.

## 6. Conferência depois de publicar

**Em teste (endereço `*.pages.dev`):**

- [ ] `https://NOME-DO-PROJETO.pages.dev/robots.txt` mostra `Disallow: /` e a página inicial tem `<meta name="robots" content="noindex, nofollow">`.
- [ ] As páginas abrem no celular e no computador, e `/liturgia` mostra as leituras de hoje.
- [ ] O Studio publica e o site muda em 1 ou 2 minutos (veja o item do aviso de teste abaixo).

**No lançamento (domínio final):**

- [ ] `https://SEU-DOMINIO/` abre com o cadeado (HTTPS) e `www` redireciona para a raiz.
- [ ] `https://SEU-DOMINIO/robots.txt` tem `Allow: /` (sem `Disallow: /`), e ele e o `sitemap-index.xml` mostram o endereço final, não `localhost` nem `pages.dev`.
- [ ] O código-fonte da página inicial tem `<link rel="canonical" href="https://SEU-DOMINIO/">`.
- [ ] A prévia do link no WhatsApp mostra título, descrição e imagem.
- [ ] `/liturgia` mostra as leituras de hoje (não o aviso de reserva).
- [ ] Publique um aviso de teste no Studio: em 1 ou 2 minutos aparece no site (e apague depois).
- [ ] No dia seguinte, confira em **Deployments** que houve um build às 00h05 e que a liturgia mudou.
- [ ] `npm run auditar` contra o endereço final (`BASE=https://SEU-DOMINIO node scripts/auditar.mjs`) sem nenhum problema.
- [ ] Cloudflare Web Analytics ligado (opcional).

## Se algo der errado

| Sintoma                                              | O que fazer                                                                                                             |
| ---------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| O build do Cloudflare falha por versão do Node        | Defina `NODE_VERSION` com `22` (ou `24`) em Environment variables.                                                      |
| Falta o secret `CLOUDFLARE_DEPLOY_HOOK_URL` no Actions | Cadastre o secret (passo 4.2). O erro aparece no log do workflow.                                                       |
| Rebuild diário parou de rodar                         | Veja **Actions**: o GitHub desliga agendamentos de repositório público parado há 60 dias. Reative.                      |
| Publiquei no Studio e nada mudou no site              | Veja **Sanity → API → Webhooks → Attempts** (se a chamada falhou) e **Cloudflare → Deployments** (se o build falhou).   |
| O Studio não mostra campos novos                      | Rode `npm run deploy -w studio` (passo 2).                                                                              |
| A liturgia saiu com o aviso de reserva                | A API da liturgia falhou durante o build. Refaça o build; se a CNBB pedir, use `LITURGIA_OCULTAR_TEXTO=true`.           |
| O backup falha                                        | Confira o token (permissão Viewer, não expirado) e a variável `SANITY_PROJECT_ID`.                                      |
