# Sugestões da Luna e IA local

Primeira integração do Transformers.js, versão 4.3.1. O painel Sugestões da Luna oferece até três atividades liberadas: próxima etapa, uma revisão com pelo menos duas tentativas e menos de 80% de acerto, e revisões recentes. Essas regras são locais, determinísticas e não são IA generativa. Não inferem diagnóstico nem nível clínico; as respostas dos exercícios continuam definidas pelo conteúdo revisado.

A opção experimental de relacionar sugestões ao tema escolhido usa embeddings do modelo `Xenova/paraphrase-multilingual-MiniLM-L12-v2`, quantizado q8, revisão `2c4055b12046f11709e9df2c122e59ffbdc2f900`. O modelo base tem licença Apache-2.0. Arquivo ONNX: 118.308.126 bytes; tokenizer, runtime e demais arquivos tornam o download inicial próximo de 150 MB. Fontes: https://huggingface.co/Xenova/paraphrase-multilingual-MiniLM-L12-v2 e https://huggingface.co/sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2.

O modelo transforma textos em vetores e compara o tema às descrições de atividades. Não escreve histórias nem conversa livremente. Mesmo com scores do modelo, a próxima etapa e a revisão prioritária permanecem; recomendações nunca desbloqueiam etapas ou mudam o progresso.

## Carregamento e privacidade

Não há chave de API nem serviço de inferência pago. O painel é carregado sob demanda. O modelo só inicia ao tocar em Testar sugestões neste aparelho, após ler a informação de download. Não há ativação automática ou preferência persistida para download. O processamento roda em um Web Worker, via WASM e uma thread. Cancelar, sair do painel, erro ou limite de 90 segundos encerram o worker; sugestões por regras permanecem disponíveis. Ao finalizar, o modelo é descartado e o worker encerrado para liberar recursos. Arquivos podem permanecer no cache, sujeito a disponibilidade/espaço do navegador.

Só textos fixos de temas e descrições do catálogo são passados ao worker. Nome, conta, respostas, progresso e contadores de acerto não são enviados à Hugging Face. O histórico é considerado pelo algoritmo no navegador. O download dos arquivos necessariamente revela ao provedor informações normais de conexão, como IP; não significa ausência de tráfego externo.

O processamento consome memória e bateria. Não há garantia de velocidade em todos os aparelhos. A alternativa por regras funciona mesmo se a IA não for suportada ou não concluir. Não adicionar modelo ao carregamento inicial da trilha nem prometer compatibilidade universal.

## Validação

Testes cobrem acesso às etapas, próxima descoberta, prioridade de revisão, ordenação por scores, resultados inválidos, descarte do modelo e erro do worker. Execução real conferida no navegador com o tema Animais: a revisão prioritária foi preservada e a atividade Os sons dos animais foi sugerida. Cancelamento conferido; abertura da atividade sugerida conferida. Layout sem rolagem horizontal em larguras 320 e 390 px. Testes automatizados, análise de tipos e build passaram. Auditoria das dependências de produção sem vulnerabilidades conhecidas na data da alteração. Não foram testados todos os modelos de celular; o teste de execução foi feito no navegador deste Mac. Essa funcionalidade não foi avaliada pedagogicamente com crianças; revisão com orientadora continua necessária.
