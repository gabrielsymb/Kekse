export {};

type PyodideInterface = {
  loadPackage: (name: string) => Promise<unknown>;
  runPythonAsync: (code: string) => Promise<unknown>;
  runPython: (code: string) => unknown;
  globals: { set: (key: string, value: unknown) => void; delete: (key: string) => boolean };
};

type Request = {
  id: number;
  type: "ready" | "analyze" | "equivalent";
  expression?: unknown;
  left?: unknown;
  right?: unknown;
};

const PYODIDE_INDEX_URL = new URL("/pyodide/", self.location.origin).href;

const PYTHON_BRIDGE = String.raw`
import json
import re
import sympy as sp

_SAFE_SYMBOL = re.compile(r"^[A-Za-z][A-Za-z0-9_]*$")

def _build(node):
    if isinstance(node, bool):
        raise ValueError("booleanos não são expressões")
    if isinstance(node, int):
        return sp.Integer(node)
    if isinstance(node, float):
        return sp.Float(node)
    if isinstance(node, str):
        if node == "Pi":
            return sp.pi
        if node == "ExponentialE":
            return sp.E
        if not _SAFE_SYMBOL.fullmatch(node):
            raise ValueError(f"símbolo não permitido: {node}")
        return sp.Symbol(node)
    if not isinstance(node, list) or not node:
        raise ValueError("MathJSON inválido")

    op, *raw_args = node
    args = [_build(arg) for arg in raw_args]
    if op == "Add":
        return sp.Add(*args)
    if op == "Multiply":
        return sp.Mul(*args)
    if op == "Negate" and len(args) == 1:
        return -args[0]
    if op == "Power" and len(args) == 2:
        return sp.Pow(args[0], args[1])
    if op == "Rational" and len(args) == 2:
        return sp.Rational(args[0], args[1])
    if op == "Divide" and len(args) == 2:
        return args[0] / args[1]
    if op == "Subtract" and len(args) == 2:
        return args[0] - args[1]
    if op == "Sqrt" and len(args) == 1:
        return sp.sqrt(args[0])
    if op == "Sin" and len(args) == 1:
        return sp.sin(args[0])
    if op == "Cos" and len(args) == 1:
        return sp.cos(args[0])
    if op == "Tan" and len(args) == 1:
        return sp.tan(args[0])
    if op == "Exp" and len(args) == 1:
        return sp.exp(args[0])
    if op in ("Ln", "Log") and len(args) == 1:
        return sp.log(args[0])
    if op == "Abs" and len(args) == 1:
        return sp.Abs(args[0])
    raise ValueError(f"operação ainda não permitida: {op}")

def _tree(expr):
    return {
        "kind": expr.func.__name__,
        "preview": str(expr),
        "children": [_tree(arg) for arg in expr.args],
    }

def analyze_json(payload):
    expr = _build(json.loads(payload))
    return json.dumps({
        "text": str(expr),
        "latex": sp.latex(expr),
        "srepr": sp.srepr(expr),
        "tree": _tree(expr),
    }, ensure_ascii=False)

def equivalent_json(left_payload, right_payload):
    left = _build(json.loads(left_payload))
    right = _build(json.loads(right_payload))
    difference = sp.simplify(left - right)
    if difference != 0 and difference.has(sp.sin, sp.cos, sp.tan):
        difference = sp.trigsimp(difference)
    return json.dumps({
        "equivalent": bool(difference == 0),
        "difference": str(difference),
    }, ensure_ascii=False)
`;

let runtime: Promise<PyodideInterface> | null = null;

function getRuntime() {
  if (!runtime) {
    runtime = import(/* @vite-ignore */ `${PYODIDE_INDEX_URL}pyodide.mjs`).then(async ({ loadPyodide }) => {
      const pyodide = await loadPyodide({ indexURL: PYODIDE_INDEX_URL }) as PyodideInterface;
      await pyodide.loadPackage("sympy");
      await pyodide.runPythonAsync(PYTHON_BRIDGE);
      return pyodide;
    });
  }
  return runtime;
}

async function runPythonFunction(name: string, values: Record<string, string>) {
  const pyodide = await getRuntime();
  for (const [key, value] of Object.entries(values)) pyodide.globals.set(key, value);
  try {
    const args = Object.keys(values).join(", ");
    return JSON.parse(String(pyodide.runPython(`${name}(${args})`)));
  } finally {
    for (const key of Object.keys(values)) pyodide.globals.delete(key);
  }
}

self.onmessage = async (event: MessageEvent<Request>) => {
  const request = event.data;
  try {
    if (request.type === "ready") {
      await getRuntime();
      self.postMessage({ id: request.id, ok: true, result: { ready: true } });
      return;
    }
    if (request.type === "analyze") {
      const result = await runPythonFunction("analyze_json", {
        expression_payload: JSON.stringify(request.expression),
      });
      self.postMessage({ id: request.id, ok: true, result });
      return;
    }
    const result = await runPythonFunction("equivalent_json", {
      left_payload: JSON.stringify(request.left),
      right_payload: JSON.stringify(request.right),
    });
    self.postMessage({ id: request.id, ok: true, result });
  } catch (error) {
    self.postMessage({ id: request.id, ok: false, error: error instanceof Error ? error.message : String(error) });
  }
};
