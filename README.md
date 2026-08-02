# YouTube Playlist Downloader

Interface web para analisar uma playlist do YouTube, selecionar os vídeos e iniciar o download de um ficheiro ZIP.

## Requisitos

- Node.js 20 ou superior
- O [backend](../backend/README.md) iniciado em `http://localhost:2000`

## Executar

```bash
npm install
npm run dev
```

Abra [http://localhost:5000](http://localhost:5000) no navegador.

## Configuração da API

O endereço do backend está em `src/constants/api.ts`:

```ts
export const BASE_URL = 'http://localhost:2000'
```

Altere esse valor se o backend estiver noutro servidor ou porta.

## Como funciona

1. Cole a URL de uma playlist do YouTube.
2. Selecione os vídeos que pretende baixar.
3. Clique em **Baixar vídeos**.
4. O navegador inicia o download de `videos.zip` e mostra o progresso na área de Transferências.

O frontend não guarda os vídeos. O backend envia o ZIP como uma transferência direta para o navegador.

## Scripts

```bash
npm run dev     # inicia o servidor de desenvolvimento
npm run build   # valida o TypeScript e gera a versão de produção
npm run lint    # corrige problemas detetados pelo ESLint
npm run format  # formata os ficheiros com Prettier
```
