import { useEffect, useRef } from "react";
import { MathfieldElement } from "mathlive";

export function MathExpression({
  latex,
  className = "",
}: {
  latex: string;
  className?: string;
}) {
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!host.current) return;
    host.current.replaceChildren();
    const field = new MathfieldElement();
    field.value = latex;
    field.readOnly = true;
    field.tabIndex = -1;
    field.inert = true;
    field.style.pointerEvents = "none";
    field.setAttribute("virtual-keyboard-mode", "off");
    field.setAttribute("aria-label", latex);
    host.current.appendChild(field);
    return () => field.remove();
  }, [latex]);
  return <div className={`math-expression ${className}`} ref={host} />;
}
