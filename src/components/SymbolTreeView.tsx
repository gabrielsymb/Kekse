import type { SymbolicTree } from "../learning/types";

export function SymbolTreeView({ node }: { node: SymbolicTree }) {
  return (
    <li>
      <span>
        <strong>{node.kind}</strong>
        {node.children.length === 0 ? <small>{node.preview}</small> : null}
      </span>
      {node.children.length > 0 ? (
        <ul>
          {node.children.map((child, index) => (
            <SymbolTreeView key={`${child.kind}-${index}`} node={child} />
          ))}
        </ul>
      ) : null}
    </li>
  );
}
