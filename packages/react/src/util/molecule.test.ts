import { atom, PrimitiveAtom } from 'jotai';
import {
  createScope,
  createStore,
  Molecule,
  molecule,
  ScopeTuple,
} from './molecule';

type BaseAtoms = {
  nameAtom: PrimitiveAtom<string>;
};
const exampleMol = molecule<BaseAtoms>((getMol, getScope) => {
  return {
    nameAtom: atom(`${Math.random()}`),
  };
});

const derivedMol = molecule((getMol, getScope) => {
  const base = getMol(exampleMol);
  return { base, ageAtom: atom(`${Math.random()}`) };
});

const doubleDerived = molecule((getMol, getScope) => {
  const base = getMol(exampleMol);
  const derived = getMol(derivedMol);
  return {
    base,
    derived,
  };
});

const UserScope = createScope<string>('bob@example.com');
const user1Scope: ScopeTuple<string> = [UserScope, 'one@example.com'];
const user2Scope: ScopeTuple<string> = [UserScope, 'two@example.com'];

const CompanyScope = createScope<string>('example.com');
const company1Scope: ScopeTuple<string> = [CompanyScope, 'example.com'];
const company2Scope: ScopeTuple<string> = [CompanyScope, 'foo.example.com'];

const userMolecule = molecule((getMol, getScope) => {
  const userId = getScope(UserScope);
  const company = getMol(companyMolecule);
  const userNameAtom = atom(userId + ' name');
  const userCountryAtom = atom(userId + ' country');
  const groupAtom = atom((get) => {
    return userId + ' in ' + get(company.companyNameAtom);
  });
  return {
    userId,
    userCountryAtom,
    userNameAtom,
    groupAtom,
    company: company.company,
  };
});

const companyMolecule = molecule((getMol, getScope) => {
  const company = getScope(CompanyScope);
  const companyNameAtom = atom(company.toUpperCase());
  return {
    company,
    companyNameAtom,
  };
});

// molecule
// useMolecule
// <MoleculeScope value="tenant-a">...

describe('Store', () => {
  it('returns the same values for dependency-free molecule', () => {
    const store = createStore();

    const firstValue = store.get(exampleMol);
    const secondValue = store.get(exampleMol);

    expect(firstValue).toBe(secondValue);
  });

  ([derivedMol, doubleDerived] as Molecule<{ base: BaseAtoms }>[]).forEach(
    (mol) => {
      it('returns the same value for derived molecule', () => {
        const store = createStore();

        const firstValue = store.get(mol);
        const secondValue = store.get(mol);
        const firstBaseValue = store.get(exampleMol);
        const secondBaseBalue = store.get(exampleMol);

        // All should be the same value
        expect(firstValue).toBe(secondValue);
        expect(firstBaseValue).toBe(secondBaseBalue);

        expect(firstValue.base).toBe(firstBaseValue);
        expect(secondValue.base).toBe(secondBaseBalue);
        expect(firstValue.base).toBe(secondBaseBalue);
        expect(secondValue.base).toBe(firstBaseValue);
      });
    }
  );

  it('two stores return different molecules', () => {
    const store1 = createStore();
    const store2 = createStore();

    const firstValue = store1.get(exampleMol);
    const secondValue = store2.get(exampleMol);

    expect(firstValue).not.toBe(secondValue);
  });

  describe('Scoping', () => {
    it('Creates one molecule per scope, if not dependent on scope', () => {
      const store = createStore();
      const firstValue = store.get(exampleMol);
      const secondValue = store.get(exampleMol, user1Scope);
      // Molecule doesn't depend on scope, should be the same
      expect(firstValue).toBe(secondValue);
    });

    it('Creates one molecule, if no scope provided', () => {
      const store = createStore();
      const firstValue = store.get(companyMolecule);
      const secondValue = store.get(companyMolecule);
      // Should be one molecule, with default scope value
      expect(firstValue).toBe(secondValue);
    });

    it('Creates one molecule per dependent scope', () => {
      //
      const store = createStore();

      const firstValue = store.get(companyMolecule, company1Scope);
      const secondValue = store.get(companyMolecule, company2Scope);
      const thirdValue = store.get(companyMolecule);

      expect(firstValue).not.toBe(secondValue);
      expect(firstValue).not.toBe(thirdValue);
      expect(thirdValue).not.toBe(secondValue);
    });

    it('Creates only one molecule per dependent scope', () => {
      //
      const store = createStore();

      const firstValue = store.get(companyMolecule, company1Scope);
      const secondValue = store.get(companyMolecule, company1Scope);

      expect(firstValue).toBe(secondValue);
    });

    it('Creates one molecule per dependent molecule that is scope dependent', () => {
      //
      const store = createStore();

      const firstValue = store.get(userMolecule, company1Scope, user1Scope);
      const secondValue = store.get(userMolecule, company2Scope, user1Scope);
      const thirdValue = store.get(userMolecule, user1Scope);

      expect(firstValue.company).toBe(company1Scope[1]);
      expect(secondValue.company).toBe(company2Scope[1]);
      expect(thirdValue.company).toBe(CompanyScope.defaultValue);

      expect(firstValue).not.toBe(secondValue);
      expect(firstValue).not.toBe(thirdValue);
      expect(secondValue).not.toBe(thirdValue);
    });

    it('Creates one molecule per dependent molecule that is scope dependent', () => {
      //
      const store = createStore();

      const firstValue = store.get(userMolecule, company1Scope, user1Scope);
      const secondValue = store.get(userMolecule, company1Scope, user2Scope);

      expect(firstValue.company).toBe(company1Scope[1]);
      expect(secondValue.company).toBe(company1Scope[1]);

      expect(firstValue).not.toBe(secondValue);

      expect(firstValue.userId).toBe(user1Scope[1]);
      expect(secondValue.userId).toBe(user2Scope[1]);
    });

    it('Creates ONLY one molecule per dependent molecule that is scope dependent', () => {
      //
      const store = createStore();

      const firstValue = store.get(userMolecule, company1Scope, user1Scope);
      const secondValue = store.get(userMolecule, company1Scope, user1Scope);

      expect(firstValue).toBe(secondValue);
    });
  });
});
