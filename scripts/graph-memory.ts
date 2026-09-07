import { createHash, randomUUID } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { existsSync, lstatSync, mkdirSync, readFileSync, readdirSync, realpathSync, renameSync, unlinkSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export type Node = { id: string; [key: string]: unknown };
export type Edge = { source: string; target: string; [key: string]: unknown };
export type Graph = { nodes: Node[]; links: Edge[]; [key: string]: unknown };
export const PREFIX = 'company-setups::';
const OWNER = 'company-setups-memory-v1';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SHARED = 'D:/Claude CODE/graphify-out/graph.json';
const OUT = path.join(ROOT, '.local', 'graphify-code');
const LOCAL_GRAPH = path.join(ROOT, '.local', 'graphify-project', 'graph.json');
const PYTHON = path.join(ROOT, '.local', 'graphify-venv', process.platform === 'win32' ? 'Scripts/python.exe' : 'bin/python');
const DOCS = ['README.md', 'docs/PROJECT_MEMORY.md', 'docs/SESSION_HANDOFF.md', 'docs/ARCHITECTURE.md'];
const CODE_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.mts', '.sql', '.py', '.json', '.yaml', '.yml', '.toml', '.ps1', '.md', '.txt']);
export const digest = (value: string | Buffer) => createHash('sha256').update(value).digest('hex');
const own = (item: Record<string, unknown>) => item._memory_owner === OWNER;
const slash = (value: string) => value.replaceAll('\\', '/');

export function safeSource(root: string, relative: string): string {
  const normalized = slash(relative);
  if (path.isAbsolute(relative) || /^[a-z]:/i.test(normalized) || normalized.startsWith('/') || normalized.split('/').some(part => part === '..' || part.startsWith('.') || ['node_modules', 'coverage', 'test-results', 'playwright-report', 'graphify-out', 'dist'].includes(part)) || /(?:secret|credential|private[-_]?key)/i.test(path.basename(normalized))) {
    throw new Error(`Fuente fuera de alcance: ${relative}`);
  }
  const absolute = path.resolve(root, relative);
  if (existsSync(absolute)) {
    const resolved = realpathSync(absolute);
    const location = path.relative(realpathSync(root), resolved);
    if (location.startsWith('..') || path.isAbsolute(location) || lstatSync(absolute).isSymbolicLink()) throw new Error(`Enlace fuera de alcance: ${relative}`);
  }
  return slash(absolute);
}

export function parseGraph(text: string): Graph {
  const graph = JSON.parse(text) as Graph & { edges?: Edge[] };
  if (!graph || !Array.isArray(graph.nodes) || !Array.isArray(graph.links ?? graph.edges)) throw new Error('Formato de grafo inválido; no sobrescribir.');
  const links = graph.links ?? graph.edges!;
  if (graph.nodes.some(n => !n || typeof n.id !== 'string') || links.some(e => !e || typeof e.source !== 'string' || typeof e.target !== 'string')) throw new Error('Nodos o enlaces inválidos.');
  if (new Set(graph.nodes.map(n => n.id)).size !== graph.nodes.length) throw new Error('IDs duplicados en el grafo.');
  return { ...graph, links };
}

export function memoryNodes(text: string, source: string): Node[] {
  // Literal excerpts only: documents cannot supply ids, paths, commands or authority.
  if (/(?:sk_(?:live|test)_|sb_secret_|ghp_)[A-Za-z0-9]{12,}|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/.test(text)) throw new Error(`Posible secreto en memoria: ${source}`);
  const result: Node[] = [];
  let heading = 'Memoria';
  text.split(/\r?\n/).forEach((line, index) => {
    if (/^#{1,6}\s/.test(line)) heading = line.replace(/^#+\s*/, '').trim();
    const excerpt = line.replace(/^(?:#{1,6}|[-*]|\d+\.)\s+/, '').trim();
    if (!excerpt || line.startsWith('```') || line.startsWith('|') || line.startsWith('  ')) return;
    const labelPrefix = `Company Setups — ${heading.slice(0, 90)}: `;
    const chunkSize = 250 - labelPrefix.length; // Graphify sanitizes labels at 256 chars.
    for (let offset = 0; offset < excerpt.length; offset += chunkSize) {
      result.push({
        id: `${PREFIX}memory:${digest(source).slice(0, 16)}:${index + 1}:${offset}`,
        label: labelPrefix + excerpt.slice(offset, offset + chunkSize),
        source_file: source, source_location: `L${index + 1}`, file_type: 'document',
        confidence: 'EXTRACTED', extraction_method: 'literal-memory-excerpt',
        _memory_owner: OWNER, repo: 'company-setups', community_name: 'Company Setups / memoria',
      });
    }
  });
  return result;
}

export function projectGraph(code: Graph, documents: { source: string; text: string }[], root: string): Graph {
  const nodes: Node[] = [];
  for (const node of code.nodes) {
    if (typeof node.source_file !== 'string' || !node.source_file) continue;
    nodes.push({ ...node, id: PREFIX + node.id, source_file: safeSource(root, node.source_file), _memory_owner: OWNER, repo: 'company-setups', community_name: 'Company Setups / código' });
  }
  const known = new Set(nodes.map(n => n.id));
  const links: Edge[] = code.links.filter(e => known.has(PREFIX + e.source) && known.has(PREFIX + e.target)).map(e => ({ ...e, source: PREFIX + e.source, target: PREFIX + e.target, ...(typeof e.source_file === 'string' && e.source_file ? { source_file: safeSource(root, e.source_file) } : {}), _memory_owner: OWNER }));
  const rootNode: Node = { id: PREFIX + 'project', label: 'Company Setups / Nexo / Company OS — agentes que preparan constitución de empresas y cumplimiento', source_file: safeSource(root, 'docs/PROJECT_MEMORY.md'), source_location: 'L1', _memory_owner: OWNER, repo: 'company-setups', community_name: 'Company Setups / memoria' };
  nodes.push(rootNode);
  for (const document of documents) {
    const snippets = memoryNodes(document.text, document.source);
    nodes.push(...snippets);
    for (const node of snippets) links.push({ source: rootNode.id, target: node.id, relation: 'documents', confidence: 'EXTRACTED', source_file: node.source_file, source_location: node.source_location, _memory_owner: OWNER });
  }
  // Attach file anchors, not every symbol, to keep queries bounded.
  const seen = new Set<string>();
  for (const node of nodes.filter(n => n._origin === 'ast')) {
    const source = String(node.source_file);
    if (seen.has(source)) continue;
    seen.add(source);
    links.push({ source: rootNode.id, target: node.id, relation: 'indexes_source', confidence: 'EXTRACTED', source_file: source, source_location: node.source_location, _memory_owner: OWNER });
  }
  return { directed: true, multigraph: false, graph: {}, nodes, links };
}

export function mergeProject(existing: Graph, project: Graph): Graph {
  for (const node of existing.nodes) {
    if (node.id.startsWith(PREFIX) !== own(node)) throw new Error('Colisión de namespace/propietario; no sobrescribir.');
  }
  if (existing.links.some(e => own(e) && (!e.source.startsWith(PREFIX) || !e.target.startsWith(PREFIX)))) throw new Error('Propietario falsificado en enlace ajeno.');
  if (project.nodes.some(n => !n.id.startsWith(PREFIX) || !own(n)) || project.links.some(e => !own(e) || !e.source.startsWith(PREFIX) || !e.target.startsWith(PREFIX))) throw new Error('Partición de proyecto no válida.');
  const nodes = [...existing.nodes.filter(n => !own(n)), ...project.nodes];
  const known = new Set(nodes.map(n => n.id));
  const kept = existing.links.filter(e => !own(e));
  if (kept.some(e => (e.source.startsWith(PREFIX) && !known.has(e.source)) || (e.target.startsWith(PREFIX) && !known.has(e.target)))) throw new Error('Un enlace ajeno usa un nodo eliminado; requiere revisión.');
  if (project.links.some(e => !known.has(e.source) || !known.has(e.target))) throw new Error('La partición contiene enlaces colgantes.');
  if (known.size !== nodes.length) throw new Error('Colisión de IDs.');
  return { ...existing, nodes, links: [...kept, ...project.links] };
}

export function repairLegacyOwnedOutboundLinks(existing: Graph, root = ROOT): { graph: Graph; removed: number } {
  const nodes = new Map(existing.nodes.map(node => [node.id, node]));
  const rootPrefix = slash(realpathSync(root)).toLowerCase() + '/';
  let removed = 0;
  const links = existing.links.filter(edge => {
    if (!own(edge) || (edge.source.startsWith(PREFIX) && edge.target.startsWith(PREFIX))) return true;
    const source = nodes.get(edge.source);
    const target = nodes.get(edge.target);
    const sourceFile = slash(String(edge.source_file ?? source?.source_file ?? '')).toLowerCase();
    const isKnownLegacyOutbound = edge.source.startsWith(PREFIX) && !edge.target.startsWith(PREFIX) &&
      Boolean(source && own(source)) && Boolean(target && !own(target)) &&
      ['imports', 'extends'].includes(String(edge.relation)) && sourceFile.startsWith(rootPrefix);
    if (!isKnownLegacyOutbound) throw new Error('Propietario falsificado en enlace ajeno; reparación automática rechazada.');
    removed += 1;
    return false;
  });
  return { graph: { ...existing, links }, removed };
}

export function commitGraph(target: string, expected: string, next: string): string | null {
  if (digest(readFileSync(target)) !== digest(expected)) throw new Error('El grafo cambió concurrentemente; reintentar sin sobrescribir.');
  if (next === expected) return null;
  const backup = `${target}.company-setups-${randomUUID()}.bak`;
  const temp = `${target}.company-setups-${randomUUID()}.tmp`;
  writeFileSync(backup, expected, { flag: 'wx' });
  try {
    writeFileSync(temp, next, { flag: 'wx' });
    parseGraph(readFileSync(temp, 'utf8'));
    if (digest(readFileSync(target)) !== digest(expected)) throw new Error('Escritura concurrente detectada; respaldo conservado y grafo intacto.');
    renameSync(temp, target);
  } finally {
    if (existsSync(temp)) unlinkSync(temp);
  }
  return backup;
}

function runPython(args: string[]): void {
  if (!existsSync(PYTHON)) throw new Error('Falta Graphify aislado. Ver docs/GRAPH_MEMORY.md; no reinstalar uv.');
  const result = spawnSync(PYTHON, args, { cwd: ROOT, stdio: 'inherit', timeout: 180_000, windowsHide: true, env: { ...process.env, PYTHONIOENCODING: 'utf-8', GRAPHIFY_QUERY_LOG: '', GRAPHIFY_FORCE: '0' } });
  if (result.error || result.status !== 0) throw new Error(`Graphify falló (${result.status}): ${result.error?.message ?? 'ver salida'}`);
}

function inputs(): { hash: string; files: string[] } {
  const git = spawnSync('git', ['ls-files', '--cached', '--others', '--exclude-standard', '-z'], { cwd: ROOT, encoding: 'utf8', windowsHide: true });
  if (git.status !== 0) throw new Error('No se pudo enumerar el repositorio.');
  const files = [...new Set(git.stdout.split('\0').filter(Boolean))].filter(file => {
    if (file === '.graphifyignore' || file === '.gitignore') return true;
    if (!CODE_EXTENSIONS.has(path.extname(file)) || file.startsWith('supabase/functions/')) return false;
    try { safeSource(ROOT, file); return existsSync(path.join(ROOT, file)); } catch { return false; }
  }).sort();
  return { hash: digest(files.map(file => `${file}\0${digest(readFileSync(path.join(ROOT, file)))}`).join('\n')), files };
}

function documents() {
  const memoryDir = path.join(ROOT, 'docs', 'memory');
  const files = [...DOCS, ...readdirSync(memoryDir).filter(n => n.endsWith('.md')).sort().map(n => `docs/memory/${n}`)];
  return files.map(relative => ({ source: safeSource(ROOT, relative), text: readFileSync(path.join(ROOT, relative), 'utf8') }));
}

async function main(): Promise<void> {
  const command = process.argv[2];
  if (command === 'query') {
    const question = process.argv.slice(3).join(' ').trim();
    if (!question || question.startsWith('-')) throw new Error('Indicar una pregunta, no opciones del CLI.');
    runPython([path.join(ROOT, 'scripts/query-graph-memory.py'), '--graph', SHARED, '--question', question]);
    return;
  }
  if (!['sync', 'status', 'repair-links'].includes(command)) throw new Error('Usar query <pregunta>, sync, status o repair-links.');
  const before = readFileSync(SHARED, 'utf8'); // Never create an empty shared graph.
  const existing = parseGraph(before);
  if (command === 'repair-links') {
    const lock = `${SHARED}.company-setups.lock`;
    writeFileSync(lock, String(process.pid), { flag: 'wx' });
    try {
      const repaired = repairLegacyOwnedOutboundLinks(existing);
      const backup = repaired.removed ? commitGraph(SHARED, before, JSON.stringify(repaired.graph, null, 2) + '\n') : null;
      console.log(JSON.stringify({ state: 'REPAIRED', removed_owned_outbound_links: repaired.removed, preserved_nodes: existing.nodes.length, preserved_foreign_links: existing.links.filter(edge => !own(edge)).length, backup }, null, 2));
    } finally { unlinkSync(lock); }
    return;
  }
  const snapshot = inputs();
  const metadata = existing.company_setups_memory as { source_digest?: string; synced_at?: string; partition_digest?: string } | undefined;
  const partition = { nodes: existing.nodes.filter(own), links: existing.links.filter(own) };
  const fresh = metadata?.source_digest === snapshot.hash && metadata.partition_digest === digest(JSON.stringify(partition));
  if (command === 'status') {
    console.log(JSON.stringify({ state: fresh ? 'SYNCED' : 'STALE', graph: SHARED, synced_at: metadata?.synced_at ?? null, nodes: partition.nodes.length, files: snapshot.files.length }, null, 2));
    return;
  }
  if (fresh) { console.log('SYNCED: sin cambios; no se reextrajo ni reescribió el grafo.'); return; }
  // The lock coordinates this bridge; optimistic hash checks also catch other writers.
  const lock = `${SHARED}.company-setups.lock`;
  writeFileSync(lock, String(process.pid), { flag: 'wx' });
  try {
    runPython(['-m', 'graphify', 'extract', ROOT, '--code-only', '--no-cluster', '--max-workers', '1', '--out', OUT]);
    const code = parseGraph(readFileSync(path.join(OUT, 'graphify-out', 'graph.json'), 'utf8'));
    const project = projectGraph(code, documents(), ROOT);
    if (inputs().hash !== snapshot.hash) throw new Error('Las fuentes cambiaron durante la extracción; reintentar.');
    const merged = mergeProject(existing, project);
    const synced_at = new Date().toISOString();
    merged.company_setups_memory = { source_digest: snapshot.hash, partition_digest: digest(JSON.stringify({ nodes: project.nodes, links: project.links })), synced_at, project_root: slash(ROOT), method: 'graphify-ast-incremental-and-literal-memory', graphify_version: '0.9.53' };
    const backup = commitGraph(SHARED, before, JSON.stringify(merged, null, 2) + '\n');
    mkdirSync(path.dirname(LOCAL_GRAPH), { recursive: true });
    writeFileSync(LOCAL_GRAPH, JSON.stringify(project, null, 2) + '\n');
    console.log(JSON.stringify({ state: 'SYNCED', graph: SHARED, project_nodes: project.nodes.length, project_edges: project.links.length, preserved_nodes: existing.nodes.filter(n => !own(n)).length, backup, synced_at }, null, 2));
  } finally { unlinkSync(lock); }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(error => { console.error(`Memoria NO sincronizada: ${error instanceof Error ? error.message : String(error)}`); process.exitCode = 1; });
}
