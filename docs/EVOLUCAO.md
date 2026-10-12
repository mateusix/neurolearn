# Checklist de evolução

Escopo autorizado: histórias com perguntas, associação de imagens/palavras, jogos de memória, personagens e acessórios desbloqueáveis, adesivos, comemorações suaves, mensagens da Luna, tamanho de leitura, favoritos e relatórios por criança. Persistência em metadados privados do Clerk para contas e navegador para visitantes.

- [x] Histórias em pequenos trechos com perguntas durante a leitura.
- [x] Associação de imagens e palavras; memória sem cronômetro.
- [x] Novos bichinhos, acessórios e adesivos por etapas concluídas.
- [x] Coleção e personalização do bichinho escolhido.
- [x] Boas-vindas, orientações e elogios variados da Luna.
- [x] Tamanho de leitura ajustável.
- [x] Atividades favoritas e seção para retomá-las.
- [x] Relatório de progresso e taxa de acerto das tentativas registradas.
- [x] Persistência por perfil, validação no servidor e migração de histórico antigo.
- [x] Verificações de funcionamento, acessibilidade e responsividade; publicação.

Fora do escopo por decisão do usuário: cenários e acesso/painel de professor.

Áudios novos não são gerados nesta alteração: mensagens novas ficam em texto; as gravações existentes continuam opcionais. Não apresentar síntese do navegador como voz Nina. Taxa de acerto não é uma medida clínica e não reconstrói tentativas anteriores.

## Conteúdo desta versão

26 etapas e 96 exercícios. As etapas 1 a 21 mantêm sua ordem; as novas etapas 22 e 23 são histórias em três trechos/perguntas cada, a 24 associa quatro imagens a palavras e as 25 e 26 têm duas rodadas de memória com três pares cada. O jogo não tem cronômetro; cartas incorretas permanecem abertas até a criança escolher virá-las novamente.

Pato: 3 etapas; dinossauro: 9; pinguim: 15. Chapéu: 4; óculos: 8; laço: 12; boné: 6; flor: 10; coroa: 16; cachecol: 20. Itens bloqueados são cartões sem ação, com cadeado e desenho dessaturado; nomes e requisitos permanecem legíveis. Os seis bichinhos iniciais continuam disponíveis. Adesivos acompanham as nove conquistas. Acessórios aparecem no cabeçalho, na coleção e nos perfis.

Favoritos guardam etapas da trilha e respeitam seu acesso. Tamanho de leitura: menor, padrão e maior, alterável no topo. Relatórios mostram conclusão, acertos/tentativas por etapa e taxa agregada; repetições também são contadas. Na memória cada combinação de duas cartas é uma tentativa. Não são armazenadas respostas individuais nem dados clínicos.

## Persistência e compatibilidade

Metadados privados da família evoluem de versão 1 para 2, preservando os índices das 21 etapas anteriores. A migração limita eventual histórico legado das antigas atividades de fala a 21, evitando liberar as novas histórias por engano. Visitantes passam a usar progresso v2, migrando o v1 quando necessário; preferências, bichinho e posições antigas permanecem recuperáveis.

Por criança, `experience` guarda favoritos, acessório, tamanho de texto e contadores compactos `[tentativas, acertos]` por etapa. O servidor valida limites, personagens/acessórios liberados e campos permitidos dessa estrutura. A fila de sincronização e a cópia local pendente incluem os novos dados. Contadores usam o maior valor conhecido ao mesclar dispositivos; não são um histórico transacional exato de tentativas simultâneas em dois aparelhos. Cosméticos e favoritos usam a última alteração salva.

A cópia manual dos perfis inclui esses dados. Existe limite total de 7.500 bytes de metadados: foi verificada a estrutura de cinco perfis com todas as etapas, favoritos e contadores. Outros metadados da conta ainda podem consumir espaço; falhas de sincronização continuam explícitas e mantêm a cópia local.

## Validação

Testes de conteúdo, confirmação, personalização, perfis, memória, favoritos, relatórios, desbloqueios, migração, limites e tutorial. Conferência da jornada pelo navegador em origem local de teste separada dos dados do usuário. Sem pesquisa com crianças nesta atualização.

Na primeira gravação do formato novo, todos os perfis legados são migrados juntos; posições das antigas atividades de fala são removidas explicitamente para não serem confundidas com as novas histórias. A gravação usa as regras de mesclagem de metadados documentadas em https://clerk.com/docs/reference/backend/user/update-user-metadata.

## Sugestões da Luna

Painel com próxima etapa e revisões por tentativas registradas. Integração inicial e opcional de Transformers.js para ordenar revisões por afinidade com um tema. Não gera respostas livres, não altera a correção nem desbloqueia etapas. Download apenas por ação explícita, processamento em worker, cancelamento e alternativa por regras. Detalhes, limites de desempenho e privacidade em [IA_LOCAL.md](IA_LOCAL.md).
