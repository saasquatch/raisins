import { useMolecule } from "bunshi/react";
import { useAtomValue } from "jotai";
import { HotkeysMolecule } from "./HotkeysMolecule.ts";

export function useHotkeys() {
  const { HotKeysAtom } = useMolecule(HotkeysMolecule);
  useAtomValue(HotKeysAtom);
}
