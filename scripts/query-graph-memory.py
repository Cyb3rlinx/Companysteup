"""Read-only queries through Graphify's pinned engine; no query-stamp writes.

Scope to this project's partition so common words cannot seed unrelated projects.
Memory is rendered before symbols to keep a large code graph from hiding the handoff.
"""
import argparse
import re
from graphify.serve import _load_graph, _query_graph_text


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--graph', required=True)
    parser.add_argument('--question', required=True)
    args = parser.parse_args()
    graph = _load_graph(args.graph)
    own = [n for n, d in graph.nodes(data=True)
           if n.startswith('company-setups::') and d.get('_memory_owner') == 'company-setups-memory-v1']
    if not own:
        raise SystemExit('Company Setups todavía no está indexado; ejecutar pnpm brain:sync.')
    memory = [n for n in own if graph.nodes[n].get('_origin') != 'ast']
    code = [n for n in own if graph.nodes[n].get('_origin') == 'ast']
    for title, selected, budget in [('MEMORIA / CHECKPOINT', memory, 2200), ('CÓDIGO / REFERENCIAS', code, 800)]:
        print(f'\n=== COMPANY SETUPS: {title} ===')
        question = args.question if selected is memory else re.sub(r'company\s+setups', '', args.question, flags=re.I).strip()
        print(_query_graph_text(graph.subgraph(selected).copy(), question,
                                depth=1, token_budget=budget, graph_path=args.graph))


if __name__ == '__main__':
    main()
