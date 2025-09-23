# Project PlantCare

Aplicativo mobile (React Native + Expo) para análise de plantas. Permite capturar ou selecionar imagens de folhas/plantas, executar a análise e exibir um resultado com possíveis diagnósticos e recomendações de cuidados. Inclui histórico de análises e uma área de configurações.

## Funcionalidades
- Captura de foto com câmera ou seleção da galeria
- Tela de análise com processamento no cliente
- Exibição de resultado com diagnóstico e recomendações
- Histórico de análises realizadas
- Configurações do aplicativo
- Compartilhamento de resultados

## Tecnologias
- Expo (SDK 53) e Expo Router
- React Native 0.79 e React 19
- Navegação com `@react-navigation` (abas)
- Câmera e imagens: `expo-camera`, `expo-image-picker`
- Arquivos/Compartilhamento: `expo-file-system`, `expo-sharing`
- UI/Utilitários: `expo-status-bar`, `expo-linear-gradient`, `expo-blur`

## Estrutura do projeto (resumo)
```
app/
  _layout.tsx
  (tabs)/
    _layout.tsx
    index.tsx       // Tela inicial
    history.tsx     // Histórico
    settings.tsx    // Configurações
  analysis.tsx      // Fluxo de análise
  result.tsx        // Resultado da análise
assets/
  images/           // Ícones e imagens
```

## Pré-requisitos
- Node.js LTS instalado
- NPM (ou Yarn) configurado
- Expo Go no dispositivo (opcional, para rodar no device)
- Emuladores: Android Studio (Android) e/ou Xcode (iOS)

## Instalação
```bash
npm install
```

## Executando (desenvolvimento)
```bash
npm run dev
```
- Escaneie o QR Code no terminal/Expo DevTools para abrir no Expo Go (Android/iOS).
- Para web, selecione "w" no DevTools ou acesse a URL indicada.

## Build Web (estático)
```bash
npm run build:web
```
Os arquivos exportados ficarão na pasta `dist` (padrão do Expo Export para web).

## Scripts
- `npm run dev`: inicia o servidor de desenvolvimento do Expo
- `npm run build:web`: exporta versão web estática
- `npm run lint`: executa o linter do Expo

## TypeScript
- Projeto em TypeScript (`tsconfig.json`)
- Tipos adicionais para Expo em `expo-env.d.ts`

## Licença
Este projeto está licenciado sob os termos do arquivo `LICENSE`.

—
Ajuste este README conforme as regras de negócio e o fluxo real da análise (ex.: uso de serviço externo ou ML local).
