# Site Carla Marques CNH

Site com visual 3D, assistente de IA que responde dúvidas e leva para o WhatsApp, montador de atendimento, SEO completo e Pixel da Meta instalado.

## Estrutura

```
server.js                 servidor (Node 18+, sem dependências)
assistant/knowledge.js    o que a IA sabe e as respostas prontas
public/                   arquivos do site (HTML, JS, imagens, SEO)
render.yaml               configuração do Render
```

## Publicação

### GitHub
Os arquivos ficam neste repositório. Cada alteração enviada aqui é publicada sozinha no Render.

### Render
Web Service gratuito ligado a este repositório (Build: `npm install`, Start: `npm start`).
Variáveis:
- `ANTHROPIC_API_KEY`: chave da API da Anthropic (console.anthropic.com). Sem a chave, a assistente funciona com respostas prontas.
- `SITE_URL`: domínio final, `https://www.carlamarquescnh.com.br`. Só configure depois que o domínio estiver funcionando.

Está no plano gratuito. Nele o site "dorme" depois de 15 minutos sem visita e leva cerca de 1 minuto para acordar no primeiro acesso. Para anúncios, vale migrar para o plano pago (Settings → Instance Type).

### Domínio na Hostinger
1. No Render: Settings → Custom Domains → adicione `www.carlamarquescnh.com.br` e `carlamarquescnh.com.br`.
2. Na Hostinger: Domínios → DNS → crie os registros que o Render mostrar:
   - `CNAME` `www` → endereço `.onrender.com` do serviço
   - `A` `@` → IP informado pelo Render
3. Aguarde a verificação; o Render emite o HTTPS sozinho.

## Depois de publicar
- **Meta:** Gerenciador de Eventos → Pixel "Carla Marques CNH - Site" → verifique o domínio e confira os eventos `PageView`, `Contact`, `Lead` e `ChatIniciado`.
- **Google:** Search Console → adicione o domínio → envie `/sitemap.xml`. Crie o Perfil da Empresa no Google com área de atendimento Brasil.
- **Instagram:** no app, Editar perfil → Links → adicione o endereço do site.
- **Facebook:** Sobre → Sites e links sociais → adicione o endereço do site.

## Editar
- Número do WhatsApp e ID do Pixel: `window.CM_CONFIG` no topo de `public/index.html`.
- Respostas da IA: `assistant/knowledge.js`.
- Domínio: `SITE_URL` no Render; o servidor troca o endereço em todas as páginas.
