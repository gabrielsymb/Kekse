import { LockClosedIcon } from "@radix-ui/react-icons";
import { ACTIVE_SKILLS, SKILL_META, SOURCE_SUMMARY } from "../learning/catalog";
import { scoreLabel } from "../learning/presentation";
import type { ActiveSkillId, SkillId } from "../learning/types";
import type { LearningSession } from "../learning/useLearningSession";

export function PathScreen({ session }: { session: LearningSession }) {
  return (
    <main
      className="screen-content path-screen"
      aria-label="Caminho até álgebra abstrata"
    >
      <span className="eyebrow">não é uma lista de aulas</span>
      <h1>Da manipulação à estrutura</h1>
      <p className="lead">
        Cada camada abre quando as ferramentas anteriores sobrevivem a contextos
        novos.
      </p>
      <section className="path-list">
        {(Object.keys(SKILL_META) as SkillId[]).map((id, index) => {
          const meta = SKILL_META[id];
          const progress = session.learner.skills[id];
          const active = ACTIVE_SKILLS.includes(id as ActiveSkillId);
          return (
            <article key={id} className={active ? "available" : "future"}>
              <span className="path-index">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <small>{meta.layer}</small>
                <strong>{meta.label}</strong>
                <p>{meta.contexts}</p>
              </div>
              <span className="path-state">
                {active ? (
                  scoreLabel(progress.mastery, progress.attempts)
                ) : (
                  <>
                    <LockClosedIcon /> em preparação
                  </>
                )}
              </span>
            </article>
          );
        })}
      </section>
      <section className="source-library">
        <span className="eyebrow">
          base local · sem vínculo com o Classroom
        </span>
        <h2>Fontes que orientam a prática</h2>
        <p>
          Os materiais ajudam a escolher relações e pré-requisitos. O app cria
          exercícios novos; não transforma PDFs em leitura obrigatória.
        </p>
        <div>
          {SOURCE_SUMMARY.map((source) => (
            <article key={source.course}>
              <div>
                <strong>{source.course}</strong>
                <span>{source.state}</span>
              </div>
              <p>{source.topics}</p>
              <small>{source.count}</small>
            </article>
          ))}
        </div>
      </section>
      <section className="engine-status-card">
        <span>geração agora</span>
        <strong>Famílias parametrizadas + FSRS + validação simbólica</strong>
        <p>
          Cortex e SymPy estão ativos. IA generativa ainda não está configurada;
          quando entrar, poderá variar contexto e pistas, mas nunca declarar se
          a matemática está correta.
        </p>
      </section>
      <section className="north-star">
        <span>destino</span>
        <strong>Reconhecer estruturas, não decorar formas.</strong>
        <p>
          Grupos, anéis, corpos e espaços vetoriais entram quando as operações
          básicas já podem ser vistas como relações.
        </p>
      </section>
    </main>
  );
}
