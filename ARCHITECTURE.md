# Arquitetura do Álgebra Viva

O aplicativo separa apresentação, sessão pedagógica e matemática simbólica. Uma mudança visual não deve alterar geração, agendamento ou verificação de equivalência.

## Camadas

```text
Prototype.tsx (casca e navegação)
        |
        v
screens/ + components/ (interface)
        |
        v
learning/useLearningSession.ts (API da interface)
        |
        +--> learning/model.ts + persistence.ts (memória e FSRS)
        +--> learning/generators.ts + catalog.ts (conteúdo parametrizado)
        +--> learning/equivalence.ts + sympy.ts (verdade matemática)
                                      |
                                      v
                                sympy.worker.ts
```

## Regra de dependência

- A interface pode ler tipos, catálogo e seletores de apresentação, mas não chama FSRS, Cortex, SymPy, `localStorage` ou geradores diretamente.
- As telas chamam somente ações expostas por `useLearningSession`, como `selectChoice`, `testCandidate`, `nextExercise` e `toggleHint`.
- A camada `learning/` nunca importa telas, componentes ou CSS.
- `sympy.worker.ts` não conhece React nem estado de interface.
- A verdade matemática vem dos motores simbólicos; texto gerado por IA nunca decide se uma resposta está correta.

## Onde mexer

### Interface

- `src/Prototype.tsx`: cabeçalho, abas e composição das telas.
- `src/screens/`: estrutura visual de cada tela.
- `src/components/`: componentes visuais reutilizáveis, inclusive campos matemáticos.
- `src/prototype.css`: aparência, espaçamento, estados visuais e responsividade.

### Motor e conteúdo

- `src/learning/useLearningSession.ts`: transições e ações disponíveis para a interface.
- `src/learning/model.ts`: FSRS, domínio de memória e seleção adaptativa.
- `src/learning/generators.ts`: famílias parametrizadas de exercícios.
- `src/learning/equivalence.ts`, `src/sympy.ts` e `src/sympy.worker.ts`: verificação simbólica.
- `src/learning/persistence.ts`: armazenamento local.
- `src/learning/catalog.ts`: mapa de habilidades, fontes e proveniência.
- `src/learning/presentation.ts`: formatação de dados do domínio para leitura nas telas.
- `src/learning/types.ts`: contratos compartilhados.

## Regras para novas funcionalidades

1. JSX não calcula domínio, agenda revisões nem valida matemática.
2. Eventos visuais chamam uma ação do controlador; não editam o estado pedagógico diretamente.
3. Geradores recebem habilidade e semente e devolvem um exercício; não acessam React, navegador ou armazenamento.
4. Persistência só recebe e devolve `LearnerState`.
5. Toda nova família precisa ter resposta e transformações verificáveis pelo motor simbólico.
6. Alterar um rótulo, ícone, botão ou layout deve exigir mudanças apenas em `screens/`, `components/` ou CSS.

`npm run check:architecture` fiscaliza essas fronteiras e também roda antes de desenvolvimento e build.
