import { promises as fs } from "node:fs";
import path from "node:path";

const root = process.cwd();
const sourcesRoot = path.join(root, "content_sources");
const outputPath = path.join(sourcesRoot, "content-index.json");
const publicOutputPath = path.join(root, "public", "content-index.json");

const TOPIC_RULES = [
  ["manipulação algébrica", ["fatora", "expoente", "potência", "radical", "completando quadrado", "completar quadrado"]],
  ["funções", ["função", "domínio", "imagem", "composição", "inversa"]],
  ["limites e continuidade", ["limite", "continuidade", "contínua", "assíntota"]],
  ["derivadas", ["derivada", "regra da cadeia", "taxa de variação", "máximo local", "mínimo local"]],
  ["integrais", ["integral", "riemann", "antiderivada", "teorema fundamental", "área entre"]],
  ["trigonometria", ["seno", "cosseno", "tangente", "trigonométr"]],
  ["vetores e coordenadas", ["vetor", "coordenada cartesiana", "reta", "plano cartesiano"]],
  ["sistemas lineares", ["sistema linear", "eliminação gauss", "escalonamento", "conjunto solução"]],
  ["matrizes e determinantes", ["matriz", "determinante", "regra de cramer", "posto"]],
  ["produto interno", ["produto interno", "produto escalar", "ortogonal"]],
  ["projeção e mínimos quadrados", ["projeção", "mínimos quadrados", "quadrados mínimos", "gram-schmidt"]],
  ["teoria de conjuntos", ["teoria dos conjuntos", "união", "interseção", "produto cartesiano", "partição"]],
  ["contagem", ["combinatória", "arranjo", "permutação", "combinação", "coeficiente binomial"]],
  ["probabilidade condicional", ["probabilidade condicional", "teorema de bayes", "probabilidade total", "independência"]],
  ["variáveis aleatórias", ["variável aleatória", "função de distribuição", "função de probabilidade"]],
  ["esperança e variância", ["esperança", "variância", "desvio-padrão", "momento"]],
  ["distribuições discretas", ["bernoulli", "binomial", "poisson", "geométrica", "hipergeométrica"]],
  ["estruturas algébricas", ["grupo", "anel", "corpo", "espaço vetorial", "subespaço"]],
];

async function walk(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(absolute));
    else files.push(absolute);
  }
  return files;
}

function normalize(value) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function classify(title, content) {
  const haystack = normalize(`${title}\n${content}`);
  return TOPIC_RULES.map(([topic, terms]) => {
    const score = terms.reduce((total, term) => {
      const needle = normalize(term);
      return total + Math.min(20, haystack.split(needle).length - 1);
    }, 0);
    return { topic, score };
  }).filter((item) => item.score > 0).sort((a, b) => b.score - a.score).slice(0, 6);
}

const files = (await walk(sourcesRoot))
  .filter((file) => file.includes(`${path.sep}text${path.sep}`) && file.endsWith(".txt"))
  .sort();

const documents = [];
for (const file of files) {
  const content = await fs.readFile(file, "utf8");
  const relative = path.relative(sourcesRoot, file).split(path.sep).join("/");
  const [collection] = relative.split("/");
  const title = path.basename(file, ".txt").replaceAll("-", " ");
  documents.push({
    id: relative.replace(/\.txt$/, ""),
    collection,
    title,
    text_path: relative,
    characters: content.length,
    topics: classify(title, content),
  });
}

const topicCounts = Object.fromEntries(TOPIC_RULES.map(([topic]) => [topic, 0]));
for (const document of documents) {
  for (const { topic } of document.topics) topicCounts[topic] += 1;
}

const index = {
  version: 1,
  generated_at: new Date().toISOString(),
  method: "local deterministic keyword index; mathematical generation remains symbolic and validated",
  document_count: documents.length,
  topic_counts: topicCounts,
  documents,
};

const serialized = `${JSON.stringify(index, null, 2)}\n`;
await fs.writeFile(outputPath, serialized);
await fs.writeFile(publicOutputPath, serialized);
console.log(`Indexed ${documents.length} searchable documents across ${TOPIC_RULES.length} topic families.`);
