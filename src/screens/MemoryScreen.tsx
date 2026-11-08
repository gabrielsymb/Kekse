import { ClockIcon, ResetIcon } from "@radix-ui/react-icons";
import { MathExpression } from "../components/MathExpression";
import { ACTIVE_SKILLS, SKILL_META } from "../learning/catalog";
import { formatDue, scoreLabel } from "../learning/presentation";
import type { LearningSession } from "../learning/useLearningSession";

export function MemoryScreen({
  session,
  onRestart,
}: {
  session: LearningSession;
  onRestart: () => void;
}) {
  return (
    <main
      className="screen-content memory-screen"
      aria-label="Memória de aprendizagem"
    >
      <span className="eyebrow">o app lembra do processo</span>
      <h1>Sua memória algébrica</h1>
      <p className="lead">
        A revisão é agendada por habilidade. Um erro não some quando o exercício
        termina.
      </p>
      <section className="memory-list">
        {ACTIVE_SKILLS.map((id) => {
          const progress = session.learner.skills[id];
          return (
            <article key={id}>
              <div>
                <strong>{SKILL_META[id].label}</strong>
                <span>{scoreLabel(progress.mastery, progress.attempts)}</span>
              </div>
              <div className="memory-meta">
                <span>
                  {progress.correct}/{progress.attempts || 0} tentativas
                  preservaram a equivalência
                </span>
                <span>
                  <ClockIcon /> volta {formatDue(progress.card)}
                </span>
              </div>
            </article>
          );
        })}
      </section>
      <section className="last-error">
        <span className="eyebrow">último sinal observado</span>
        {session.latestEvent ? (
          <>
            <strong>
              {session.latestEvent.correct
                ? "transformação válida"
                : session.latestEvent.errorCode?.replaceAll("-", " ")}
            </strong>
            <div className="last-error-math">
              <MathExpression latex={session.latestEvent.source} />
              <span>→</span>
              <MathExpression latex={session.latestEvent.candidate} />
            </div>
          </>
        ) : (
          <p>Faça uma tentativa para o perfil começar a aprender com você.</p>
        )}
      </section>
      <button className="reset-profile" onClick={onRestart}>
        <ResetIcon /> Reiniciar perfil local
      </button>
    </main>
  );
}
