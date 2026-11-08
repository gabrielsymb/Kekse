import { useEffect, useRef } from "react";
import { MathfieldElement } from "mathlive";

export function EditableMath({
  onChange,
}: {
  onChange: (value: string) => void;
}) {
  const host = useRef<HTMLDivElement>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  useEffect(() => {
    if (!host.current) return;
    const field = new MathfieldElement();
    field.setAttribute("virtual-keyboard-mode", "off");
    field.setAttribute("placeholder", "Escreva sua transformação");
    field.setAttribute("aria-label", "Escreva sua transformação algébrica");
    const handleInput = () => onChangeRef.current(field.value);
    field.addEventListener("input", handleInput);
    host.current.replaceChildren(field);
    return () => {
      field.removeEventListener("input", handleInput);
      field.remove();
    };
  }, []);
  return <div className="editable-math" ref={host} />;
}
