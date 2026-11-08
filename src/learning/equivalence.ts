import { simplify } from "@cortex-js/compute-engine";

export function equivalentLocally(source: string, candidate: string): boolean {
  try {
    return simplify(`(${source})-(${candidate})`).is(0);
  } catch {
    return false;
  }
}
