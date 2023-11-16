import { useAtomValue } from 'jotai';
import { useMolecule } from 'bunshi/react';
import { HotkeysMolecule } from './HotkeysMolecule';

export function useHotkeys() {
  const { HotKeysAtom } = useMolecule(HotkeysMolecule);
  useAtomValue(HotKeysAtom);
}
