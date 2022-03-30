import { Getter, Molecule, MoleculeContext, ContextGetter, MoleculeGetter } from '../Molecule.stories';

export function discoverDependencies(m: { getter: Getter<unknown>; }) {
    const dependentMolecules = new Set<Molecule<unknown>>();
    const dependentContexts = new Set<MoleculeContext<unknown>>();

    const fakeGetContext: ContextGetter = (ctx) => {
        dependentContexts.add(ctx);
        return ctx.defaultValue;
    };
    const fakeGetMolecule: MoleculeGetter = (mol) => {
        dependentMolecules.add(mol);
        return mol.getter(fakeGetMolecule, fakeGetContext);
    };
    // Determines dependencies
    m.getter(fakeGetMolecule, fakeGetContext);

    const contexts = Array.from(dependentContexts.entries()).map((ctx) => ctx[0]);
    const molecules = Array.from(dependentMolecules.entries()).map(
        (entry) => entry[0]
    );

    return { contexts, molecules };
}
