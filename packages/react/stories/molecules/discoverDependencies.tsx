import {
  Getter,
  Molecule,
  MoleculeScope,
  ScopeGetter,
  MoleculeGetter,
} from '../Molecule.stories';

export function discoverDependencies(m: { getter: Getter<unknown> }) {
  const dependentMolecules = new Set<Molecule<unknown>>();
  const dependentScopes = new Set<MoleculeScope<unknown>>();

  const fakeGetContext: ScopeGetter = (ctx) => {
    dependentScopes.add(ctx);
    return ctx.defaultValue;
  };
  const fakeGetMolecule: MoleculeGetter = (mol) => {
    dependentMolecules.add(mol);
    return mol.getter(fakeGetMolecule, fakeGetContext);
  };
  // Determines dependencies
  m.getter(fakeGetMolecule, fakeGetContext);

  const scopes = Array.from(dependentScopes.entries()).map((ctx) => ctx[0]);
  const molecules = Array.from(dependentMolecules.entries()).map(
    (entry) => entry[0]
  );

  return { scopes, molecules };
}
