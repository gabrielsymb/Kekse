import {
  CheckCircledIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ClockIcon,
  CrossCircledIcon,
  LockClosedIcon,
  Pencil2Icon,
  ReloadIcon,
  ResetIcon,
} from "@radix-ui/react-icons";
import { EditableMath } from "../components/EditableMath";
import { MathExpression } from "../components/MathExpression";
import { SymbolTreeView } from "../components/SymbolTreeView";
import { SKILL_META } from "../learning/catalog";
import type { LearningSession } from "../learning/useLearningSession";

export function PracticeScreen({ session }: { session: LearningSession }) {
  const {
    exercise,
    dueCount,
    currentProgress,
    reviewReason,
    structureOpen,
    structure,
    structureError,
    sympyStatus,
    freeMode,
    selectedChoice,
    candidate,
    feedback,
    selected,
    verifying,
    engineUsed,
    hintOpen,
  } = session;
  return (
    <main
      className="screen-content practice-screen"
      aria-label="Oficina de prática algébrica"
    >
      <section className="session-strip">
        <div>
          <span className="eyebrow">sessão adaptativa</span>
          <strong>
            {dueCount > 0
              ? `${dueCount} habilidades pedindo revisão`
              : "transferência e consolidação"}
          </strong>
        </div>
        <span className="review-chip">
          <ClockIcon /> {currentProgress.attempts ? "revisão" : "diagnóstico"}
        </span>
      </section>
      <section className="workbench">
        <div className="lesson-meta">
          <span>{exercise.area}</span>
          <span>{SKILL_META[exercise.skillId].label}</span>
        </div>
        <div className="exercise-origin">
          <span>{reviewReason}</span>
          <span>{exercise.sourceRef}</span>
        </div>
        <h1>Teste o seu passo</h1>
        <p className="prompt">{exercise.prompt}</p>
        <div className="source-expression">
          <MathExpression latex={exercise.source} className="source-math" />
        </div>
        <section
          className={structureOpen ? "symbolic-lens open" : "symbolic-lens"}
        >
          <button
            onClick={session.toggleStructure}
            aria-expanded={structureOpen}
          >
            <span>ver como objeto simbólico</span>
            {structureOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
          </button>
          {structureOpen && (
            <div className="symbolic-body">
              {sympyStatus === "loading" && (
                <p>Carregando o laboratório Python na sua máquina…</p>
              )}
              {sympyStatus === "error" && (
                <p>
                  O Cortex continua verificando; o SymPy precisa de conexão no
                  primeiro carregamento.
                </p>
              )}
              {structureError && <p>{structureError}</p>}
              {structure && (
                <>
                  <div className="symbolic-caption">
                    <span>SymPy enxerga</span>
                    <code>{structure.srepr}</code>
                  </div>
                  <ul className="symbol-tree">
                    <SymbolTreeView node={structure.tree} />
                  </ul>
                </>
              )}
            </div>
          )}
        </section>
        <div className="transform-arrow" aria-hidden="true">
          ↓
        </div>
        {!freeMode ? (
          <div className="choice-area">
            <div className="choice-label">
              <span>Monte o próximo passo</span>
              <button onClick={session.startFreeMode}>
                <Pencil2Icon /> escrever livremente
              </button>
            </div>
            <div className="math-choices">
              {exercise.choices.map((choice) => (
                <button
                  key={choice.id}
                  className={
                    selectedChoice === choice.id
                      ? "math-choice selected"
                      : "math-choice"
                  }
                  onClick={() => session.selectChoice(choice.id)}
                  aria-pressed={selectedChoice === choice.id}
                >
                  <span className="grab-dots">⠿</span>
                  <MathExpression latex={choice.latex} />
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="free-entry">
            <div className="choice-label">
              <span>Sua transformação</span>
              <button onClick={session.stopFreeMode}>usar peças</button>
            </div>
            <EditableMath onChange={session.updateFreeValue} />
            <p>O motor compara a expressão, não apenas o texto digitado.</p>
          </div>
        )}
        <button
          className="primary-action"
          disabled={!candidate || feedback === "correct" || verifying}
          onClick={session.testCandidate}
        >
          <ReloadIcon />{" "}
          {verifying ? "Verificando com SymPy…" : exercise.actionLabel}
        </button>
        {feedback && (
          <section className={`feedback-panel ${feedback}`} aria-live="polite">
            <div className="feedback-title">
              {feedback === "correct" ? (
                <CheckCircledIcon />
              ) : (
                <CrossCircledIcon />
              )}
              <strong>
                {feedback === "correct"
                  ? "Equivalência preservada"
                  : feedback === "goal"
                    ? "Verdadeiro, mas a ferramenta ainda não apareceu"
                    : "A equivalência quebrou neste passo"}
              </strong>
            </div>
            {feedback === "wrong" && selected && (
              <>
                <div className="comparison">
                  <div>
                    <span>antes</span>
                    <MathExpression latex={exercise.source} />
                  </div>
                  <div>
                    <span>seu passo</span>
                    <MathExpression latex={selected.candidate} />
                  </div>
                </div>
                <p>{selected.feedback}</p>
              </>
            )}
            {feedback === "goal" && (
              <p>Transforme a forma, não apenas reescreva a mesma expressão.</p>
            )}
            {feedback === "correct" && (
              <>
                <div className="tool-unlocked">
                  <CheckCircledIcon /> ferramenta descoberta:{" "}
                  <strong>{exercise.tool}</strong>
                </div>
                <p>{exercise.transfer}</p>
                {engineUsed && (
                  <span className="engine-proof">
                    equivalência confirmada por {engineUsed}
                  </span>
                )}
                <button className="next-action" onClick={session.nextExercise}>
                  Próxima revisão
                </button>
              </>
            )}
            {feedback !== "correct" && (
              <button className="retry-action" onClick={session.retry}>
                <ResetIcon /> Tentar de novo
              </button>
            )}
          </section>
        )}
        {feedback !== "correct" && (
          <section className={hintOpen ? "tool-drawer open" : "tool-drawer"}>
            <button onClick={session.toggleHint} aria-expanded={hintOpen}>
              <span>
                <LockClosedIcon /> Ferramentas disponíveis
              </span>
              {hintOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
            </button>
            {hintOpen && (
              <div className="tool-hint">
                <span>{exercise.tool}</span>
                <p>
                  Use a ferramenta e depois reexpanda: se voltar à expressão
                  inicial, o passo é válido.
                </p>
              </div>
            )}
          </section>
        )}
      </section>
    </main>
  );
}
