# NeuroLearn

Aplicação web de apoio à alfabetização infantil desenvolvida no contexto de um Trabalho de Conclusão de Curso. O projeto considera a diversidade de ritmos e preferências das crianças, com atenção à experiência de crianças com TEA e TDAH.

**Aplicação:** https://neurolearn-beige.vercel.app

## Funcionalidades

- Histórias em trechos, associação de imagens e jogos de memória sem cronômetro.
- Bichinhos e acessórios desbloqueáveis, adesivos, favoritos e tamanho de leitura.
- Relatórios por criança com tentativas e taxa de acerto registrada a partir desta versão.
- Trilha com 26 etapas e 96 exercícios de letras, sílabas, palavras, frases e escuta.
- Liberação gradual das etapas e retomada das atividades.
- Escolha de bichinho, tema das atividades e quatro paletas de cores.
- Demonstrações de uso, dicas e feedback de incentivo com a mascote Luna.
- Narração opcional em português, efeitos sonoros e controle de animações.
- Conquistas e painel do responsável com até cinco perfis infantis separados.
- Progresso local para visitantes e sincronização na conta para perfis autenticados.
- Layout responsivo para computadores e celulares.

## Tecnologias

Next.js, React, TypeScript, CSS Modules, Tailwind CSS e Clerk. Os ícones usam Lucide. A interface usa a fonte Nunito. A narração usa arquivos MP3 previamente gerados com a voz Nina no ElevenLabs; não depende de uma API de geração de voz durante os exercícios.

## Executar localmente

É necessário ter Node.js e npm instalados. Para reproduzir o ambiente de desenvolvimento, use Node.js 22.

```bash
npm ci
cp .env.example .env.local
```

Preencha as duas variáveis com as chaves do seu próprio aplicativo no Clerk. Nunca publique a chave secreta. Depois:

```bash
npm run dev
```

Abra http://localhost:3000. Se essa porta estiver ocupada, confira a porta informada pelo servidor.

## Verificação

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

Os testes verificam respostas, montagem de palavras, retomada, personalização, orientações, efeitos sonoros, isolamento de perfis e tratamento de falhas no carregamento e salvamento. Alguns testes usam serviços simulados; não substituem testes com crianças nem testes de integração com uma conta real.

## Progresso e perfis

O responsável autentica com o Clerk. Os perfis e o progresso são armazenados nos metadados privados da conta, acessados pelo servidor em `/api/family`. O navegador guarda a seleção do perfil e uma cópia das alterações ainda não sincronizadas. No modo visitante, as preferências e o progresso ficam neste navegador e não são transferidos automaticamente para outro aparelho.

## Publicação

O projeto está hospedado na Vercel. Configure nela as mesmas variáveis do arquivo de exemplo. Uma atualização local só chega ao site após uma nova publicação; a integração automática com o GitHub precisa ser configurada na Vercel.

## Estado do projeto

Esta é uma versão de protótipo acadêmico. As atividades de reconhecimento de fala estão desativadas. A configuração atual do Clerk usa o ambiente de desenvolvimento. A adequação pedagógica e a usabilidade precisam ser avaliadas com os participantes e profissionais envolvidos na pesquisa.

## Referências e recursos

O Duolingo e o projeto `AntonioErdeljac/lingo-early-access` foram referências de interface. O NeuroLearn tem atividades e identidade próprias voltadas à alfabetização. Bibliotecas e serviços citados mantêm seus próprios termos e licenças; os áudios do ElevenLabs também estão sujeitos aos termos do plano usado para sua geração.
