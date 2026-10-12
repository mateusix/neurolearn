# Segurança e recuperação do NeuroLearn

Revisão: 11/10/2026. Proteções básicas para o protótipo; não é certificação nem garantia de ausência de vulnerabilidades.

## Medidas no código

- API autenticada pelo Clerk; identificador da conta vem da sessão, nunca do corpo. Perfis somente da própria conta.
- POST somente com origem igual à aplicação e conteúdo JSON. Não há CORS aberto. GET exige autenticação; respostas privadas usam no-store.
- Corpo limitado a 16.000 bytes durante leitura, inclusive sem Content-Length. Limites de perfis, apelidos, etapas, posições, preferências e tamanho dos metadados.
- Apelidos sem caracteres de controle ou delimitadores HTML; conteúdo exibido como texto pelo React. Não há SQL nem execução de consultas ou HTML fornecido pelo usuário.
- Rate limit por conta e método: 60 leituras e 120 gravações por minuto. É uma proteção em memória por instância, não uma quota global distribuída. Em escala, configurar firewall/rate limit persistente.
- Cabeçalhos impedem enquadramento externo e objetos incorporados, restringem base URI, desativam câmera/microfone/geolocalização, previnem detecção incorreta de tipo e reduzem informação do referenciador. A CSP é parcial: não restringe scripts/conexões para evitar quebrar Clerk e Next.
- Logs de falha contêm somente evento/operação; não incluem crianças, tokens ou exceções. Consultar erros no painel da Vercel; não existe serviço de alertas contínuos instalado.
- Secrets somente em .env local e variáveis privadas da Vercel. NEXT_PUBLIC significa público: nunca colocar secret key nesse prefixo. Arquivos locais e pacotes de publicação estão excluídos do Git.
- Verificações automáticas no GitHub e propostas semanais de atualização com Dependabot. Alterações de dependências exigem testes e revisão antes da publicação.

## Serviços e configurações administrativas

HTTPS é oferecido pela Vercel. Senhas, sessões e fatores de autenticação são administrados pelo Clerk: o NeuroLearn não guarda nem calcula hashes de senhas. A verificação de sessão acontece na API.

MFA e tempo máximo/inatividade da sessão devem ser conferidos e configurados no Dashboard do Clerk; não foram ativados por este commit. Sugestão inicial: MFA opcional para responsáveis, obrigatório para contas administrativas dos serviços; revisar duração de sessão conforme uso em aparelhos compartilhados. Não há expiração independente no aplicativo.

Criptografia de transporte e proteção dos dados nos serviços dependem dos provedores. Não foi adicionada criptografia própria ao localStorage: isso não protegeria dados contra scripts com acesso à mesma página. Evitar nomes completos, diagnósticos e uso de conta em aparelho compartilhado; sair após uso. A cópia baixada não é criptografada.

## Backups e plano de recuperação

O responsável pode baixar uma cópia JSON dos perfis no painel. Inclui o estado local atual e indica se há alterações pendentes. Guardar fora do aparelho em local privado; não publicar no GitHub. Essa cópia é manual e não substitui backup periódico de dados. Não há restauração automática implementada.

1. Falha após atualização: no painel da Vercel, selecionar o último deployment funcional e promover/usar rollback. Isso restaura código, não metadados do Clerk.
2. Conferir login, listagem, seleção de perfil, gravação/retomada e áudio; executar os testes antes de nova tentativa.
3. Em indisponibilidade do Clerk, preservar cópias pendentes e tentar sincronizar ao voltar a conexão. Não limpar armazenamento antes de recuperar o progresso.
4. Perda de dados: usar a cópia privada como referência para restauração assistida, validando titular e estrutura. Não aceitar JSON arbitrário direto em metadados.
5. Vazamento de secret: revogar/rotacionar no Clerk, atualizar Vercel e .env, republicar e conferir o login. Nunca registrar o secret em logs.

Os metadados têm versão 1; não há banco SQL nem migrations SQL. Uma futura mudança de formato precisa de transformação testada, cópia prévia e leitura compatível. Rollback do deployment sozinho não desfaz transformações nos dados.

## Referências administrativas

- https://clerk.com/docs/guides/secure/session-options
- https://clerk.com/docs/guides/configure/auth-strategies/sign-up-sign-in-options
- https://vercel.com/docs/security

## Auditoria de dependências nesta revisão

Next atualizado para 16.3.8 e correções compatíveis aplicadas ao lockfile. A auditoria npm sem dependências de desenvolvimento retornou zero alertas conhecidos nesta execução. Permanecem nove alertas altos no conjunto de ferramentas de desenvolvimento (cadeia de glob/braces de ESLint e shadcn), sem correção compatível indicada pela auditoria. O CLI shadcn foi classificado como ferramenta de desenvolvimento; seu CSS continua presente no build. Não usar npm audit fix --force sem revisão: a proposta alteraria versões de forma incompatível. A auditoria é um retrato dos avisos conhecidos, não prova de segurança total.
