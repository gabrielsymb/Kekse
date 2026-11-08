import { useState } from "react";
import { useLearningSession } from "./learning/useLearningSession";
import type { AppTab } from "./learning/types";
import { MobileScroll } from "./mobile";
import { MemoryScreen } from "./screens/MemoryScreen";
import { PathScreen } from "./screens/PathScreen";
import { PracticeScreen } from "./screens/PracticeScreen";

export default function Prototype() {
  const [tab, setTab] = useState<AppTab>("practice");
  const session = useLearningSession();

  function restartProfile() {
    session.restartProfile();
    setTab("practice");
  }

  return (
    <div className="algebra-app">
      <header className="app-header">
        <button
          className="brand"
          onClick={() => setTab("practice")}
          aria-label="Ir para praticar"
        >
          <span className="brand-mark">A</span>
          <span>
            <strong>Álgebra viva</strong>
            <small>oficina adaptativa</small>
          </span>
        </button>
        <span className={`local-pill ${session.sympyStatus}`}>
          <span />{" "}
          {session.sympyStatus === "ready"
            ? "SymPy ativo"
            : session.sympyStatus === "loading"
              ? "SymPy carregando"
              : "Cortex ativo"}
        </span>
      </header>
      <nav className="section-tabs" aria-label="Seções do aplicativo">
        <button
          className={tab === "practice" ? "active" : ""}
          onClick={() => setTab("practice")}
        >
          Praticar
        </button>
        <button
          className={tab === "memory" ? "active" : ""}
          onClick={() => setTab("memory")}
        >
          Memória
        </button>
        <button
          className={tab === "path" ? "active" : ""}
          onClick={() => setTab("path")}
        >
          Caminho
        </button>
      </nav>
      <MobileScroll className="app-screen">
        {tab === "practice" && <PracticeScreen session={session} />}
        {tab === "memory" && (
          <MemoryScreen session={session} onRestart={restartProfile} />
        )}
        {tab === "path" && <PathScreen session={session} />}
      </MobileScroll>
    </div>
  );
}
