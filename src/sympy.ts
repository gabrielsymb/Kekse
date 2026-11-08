import { ComputeEngine } from "@cortex-js/compute-engine";
import type { SymbolicAnalysis } from "./learning/types";

type WorkerResponse = { id: number; ok: true; result: unknown } | { id: number; ok: false; error: string };

const computeEngine = new ComputeEngine();
let worker: Worker | null = null;
let sequence = 0;
const pending = new Map<number, { resolve: (value: unknown) => void; reject: (reason: Error) => void }>();

function getWorker() {
  if (worker) return worker;
  worker = new Worker(new URL("./sympy.worker.ts", import.meta.url), { type: "module" });
  worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
    const response = event.data;
    const request = pending.get(response.id);
    if (!request) return;
    pending.delete(response.id);
    if (response.ok) request.resolve(response.result);
    else request.reject(new Error(response.error));
  };
  worker.onerror = (event) => {
    const error = new Error(event.message || "Não foi possível iniciar o SymPy.");
    for (const request of pending.values()) request.reject(error);
    pending.clear();
  };
  return worker;
}

function request<T>(payload: Record<string, unknown>) {
  const id = ++sequence;
  return new Promise<T>((resolve, reject) => {
    pending.set(id, { resolve: (value) => resolve(value as T), reject });
    getWorker().postMessage({ id, ...payload });
  });
}

function mathJson(latex: string) {
  return computeEngine.parse(latex).json;
}

export function warmSympy() {
  return request<{ ready: true }>({ type: "ready" });
}

export function analyzeWithSympy(latex: string) {
  return request<SymbolicAnalysis>({ type: "analyze", expression: mathJson(latex) });
}

export function equivalentWithSympy(left: string, right: string) {
  return request<{ equivalent: boolean; difference: string }>({
    type: "equivalent",
    left: mathJson(left),
    right: mathJson(right),
  });
}
