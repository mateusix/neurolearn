# Conteúdo e narração

A trilha atual contém 21 etapas e 82 exercícios. Os enunciados e respostas ficam em `lib/lessons.ts`; a personalização por tema e apoio fica em `lib/personalized-lessons.ts`. O conteúdo é uma proposta de protótipo e deve passar por revisão pedagógica.

## Voz da Luna

A narração utiliza a voz Nina M., do ElevenLabs (`GM2UA3fbsIaLHcswCDX9`). Os arquivos são reproduzidos somente quando a criança toca em Ouvir. Não há reprodução automática nem substituição pela voz do navegador.

O catálogo `narration.pt-BR.json` registra textos, identificadores e disponibilidade. Atualmente há 25 gravações marcadas como disponíveis. Um áudio só deve ser marcado como `generated` depois que o MP3 correspondente estiver em `public/audio/pt-BR/nina` e sua pronúncia e correspondência com o texto forem conferidas. Frases pendentes não exibem um botão de reprodução sem arquivo.

As explicações específicas estão em `exercise-guidance.pt-BR.json`. As variações de incentivo e conclusão são escolhidas por `lib/luna-dialogue.ts`.

## Importar novas gravações

Salve o arquivo com o identificador da frase, como `ouvir-bola.mp3`, na pasta Downloads. Depois execute:

```bash
node scripts/import-nina-audio.cjs
```

Confira o áudio antes de publicar. O importador verifica apenas o formato do arquivo, sem reconhecer o conteúdo falado. As gravações pendentes de escuta e animais estão listadas em `audios-para-baixar.md`.

## Recursos e termos de uso

Os áudios foram gerados pelo ElevenLabs e continuam sujeitos aos termos do plano utilizado, incluindo atribuição e restrições de uso. Não inclua credenciais no catálogo nem no repositório.

As imagens de palavras utilizam emojis, cuja aparência pode variar entre aparelhos. Não há reconhecimento de fala ativo. A conclusão das atividades representa progresso no protótipo, sem valor diagnóstico.

## Verificação

`npm test` verifica integridade das atividades, personalização, orientações, progresso, perfis e efeitos sonoros. Os testes automatizados não substituem a avaliação pedagógica, a escuta das gravações ou a pesquisa de usabilidade.
