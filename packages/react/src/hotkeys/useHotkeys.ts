import { useAtomValue } from 'jotai';
import { useMolecule } from 'jotai-molecules';
import { HotkeysMolecule } from './HotkeysMolecule';

export function useHotkeys() {
  const { HotKeysAtom } = useMolecule(HotkeysMolecule);
  useAtomValue(HotKeysAtom);
}
