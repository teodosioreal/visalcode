# Rastreador (Google Ads + BuyGoods)

Ferramenta de uso próprio para rastrear campanhas de review:

```
Anúncio Google ──► Página de review (?gclid=...)
                     │  t.js registra a visita e gera um ID
                     ▼
            Link da BuyGoods ganha &subid=<ID>
                     ▼
            Venda → BuyGoods chama /postback com o subid
                     ▼
            /google-ads.csv lista a venda com o gclid
                     ▼
            Google Ads importa a planilha sozinho (programação HTTPS)
```

Node puro + SQLite embutido. **Zero dependências** (não precisa de `npm install`).
Requer **Node 22.13 ou mais novo**.

## Rodar na VPS

```bash
# 1. Node 22 (se ainda não tiver)
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo bash - && sudo apt install -y nodejs

# 2. Código
sudo git clone https://github.com/teodosioreal/visalcode /opt/visalcode
cd /opt/visalcode/rastreador
sudo cp .env.example .env && sudo nano .env      # preencha senha, SECRET_KEY, PUBLIC_URL...
sudo mkdir -p dados && sudo chown -R www-data dados

# 3. Serviço (sobe sozinho e reinicia se cair)
sudo cp deploy/rastreador.service /etc/systemd/system/
sudo systemctl enable --now rastreador
sudo journalctl -u rastreador -f                 # ver logs (cada postback aparece aqui)

# 4. HTTPS com Caddy (aponte o DNS do subdomínio para o IP da VPS antes)
sudo apt install -y caddy
sudo cp deploy/Caddyfile /etc/caddy/Caddyfile && sudo nano /etc/caddy/Caddyfile
sudo systemctl reload caddy
```

Se a VPS já usa Nginx, faça um `proxy_pass http://127.0.0.1:3100;` no
subdomínio e mande o cabeçalho `X-Forwarded-For`.

Atualizar depois: `cd /opt/visalcode && sudo git pull && sudo systemctl restart rastreador`.

## Configurar

Abra `https://SEU-SUBDOMINIO/configurar` (login do `.env`). A página mostra
tudo pronto para copiar:

1. **Script da página de review** — `<script src=".../t.js" async></script>`.
   Todo link que aponta para `buygoods` recebe `subid=ID_DA_VISITA`. Para um
   link de outro domínio, coloque `data-rastrear` no `<a>`.
2. **Sufixo do URL final no Google Ads** (nível da conta), com a
   codificação automática (gclid) ativada:
   `campaignid={campaignid}&adgroupid={adgroupid}&keyword={keyword}&matchtype={matchtype}&device={device}&network={network}`
3. **Postback na BuyGoods** (Postback Pixels, vale para todas as ofertas):
   `.../postback?key=CHAVE&subid={SUBID}&order={ORDERID}&amount={COMMISSION_AMOUNT}&type={CONV_TYPE}&product={PRODUCT_CODENAME}`
4. **Google Ads**:
   - Crie uma ação de conversão do tipo *Importar → conversões de cliques*
     com o nome **exatamente igual** a `CONVERSION_NAME` do `.env`.
   - Em *Conversões → Uploads → Programações*, crie uma programação com fonte
     **HTTPS** apontando para `.../google-ads.csv?key=CHAVE`, a cada 6 horas.

A planilha traz as vendas aprovadas dos últimos `EXPORT_DAYS` dias que têm
gclid. O Google ignora as que já importou, então repetir não tem problema.
Reembolsos (`type` com refund/chargeback) saem da planilha e aparecem no painel.

## Endpoints

| Rota | Acesso | O que faz |
| --- | --- | --- |
| `GET /t.js` | público | script da página de review |
| `POST /c`, `POST /o` | público | registra visita / clique no botão |
| `GET\|POST /postback` | `key` | recebe venda da BuyGoods |
| `GET /google-ads.csv` | `key` | planilha de conversões do Google Ads |
| `GET /`, `/configurar` | login | painel e configuração |
| `GET /saude` | público | checagem de "está no ar" |

## Testes

```bash
npm test
```
