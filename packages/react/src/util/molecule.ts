import { createMemoizeAtom } from './weakCache';

type Deps = {
  scopes: AnyScope[];
  transientScopes: AnyScope[];
  molecules: AnyMolecule[];
};

type AnyMolecule = Molecule<unknown>;
type AnyValue = unknown;
type AnyScope = MoleculeScope<unknown>;
type AnyScopeTuple = ScopeTuple<unknown>;

type Mounted = {
  deps: Deps;
  value: AnyValue;
};

export function createStore() {
  const deepCache = createMemoizeAtom();
  const shallowCache = new WeakMap<AnyMolecule, Mounted>();

  function mountMolecule(
    m: AnyMolecule,
    getScopeValue: ScopeGetter,
    scopes: AnyScopeTuple[]
  ): Mounted {
    const dependentMolecules = new Set<AnyMolecule>();
    const dependentScopes = new Set<AnyScope>();
    const transientScopes = new Set<AnyScope>();
    const trackingScopeGetter: ScopeGetter = (s) => {
      dependentScopes.add(s);
      return getScopeValue(s);
    };
    const trackingGetter: MoleculeGetter = (m) => {
      dependentMolecules.add(m);
      const mol = getInternal(m, ...scopes);
      Array.from(mol.deps.scopes.values()).forEach((s) =>
        transientScopes.add(s)
      );
      return mol.value as any;
    };
    const value = m.getter(trackingGetter, trackingScopeGetter);
    return {
      deps: {
        molecules: Array.from(dependentMolecules.values()),
        scopes: Array.from(dependentScopes.values()),
        transientScopes: Array.from(transientScopes.values()),
      },
      value,
    };
  }

  function getInternal<T>(m: Molecule<T>, ...scopes: AnyScopeTuple[]): Mounted {
    const getScopeValue: ScopeGetter = (scope) => {
      const found = scopes.find((providedScope) => providedScope[0] === scope);
      if (found) return found[1] as any;
      return scope.defaultValue;
    };
    const mounted = mountMolecule(m, getScopeValue, scopes);

    // const relatedScopes = mounted.deps.scopes
    //   .map((s) => {
    //     return scopes.find((ss) => ss[0] === s);
    //   })
    //   .filter((x) => x !== undefined) as AnyScopeTuple[];
    const relatedScopes = scopes.filter((s) => {
      const scope = s[0];
      return mounted.deps.scopes.includes(scope);
    });
    const transientRelatedScopes = scopes.filter((s) => {
      const scope = s[0];
      return mounted.deps.transientScopes.includes(scope);
    });

    if (relatedScopes.length > 0) {
      // TODO: Need to properly cache based on transient scope dependencies
      return deepCache(() => mounted, [
        ...relatedScopes,
        ...transientRelatedScopes,
      ]);
    }
    const cached = shallowCache.get(m);
    if (cached) {
      return cached;
    }
    shallowCache.set(m, mounted);
    return mounted;
  }

  function get<T>(m: Molecule<T>, ...scopes: AnyScopeTuple[]): T {
    return getInternal(m).value as T;
  }
  return {
    get,
  };
}

export type ScopeTuple<T> = [MoleculeScope<T>, T];

export type MoleculeScope<T> = {
  defaultValue: T;
};

export function createScope<T>(defaultValue: T): MoleculeScope<T> {
  return {
    defaultValue,
  };
}

type ScopeGetter = {
  <Value>(scope: MoleculeScope<Value>): Value;
};

type MoleculeGetter = {
  <Value>(mol: Molecule<Value>): Value;
};

export type Getter<T> = (
  getMolecule: MoleculeGetter,
  getScope: ScopeGetter
) => T;

export type Molecule<T> = {
  getter: Getter<T>;
  displayName?: string;
};

export function molecule<T>(getter: Getter<T>): Molecule<T> {
  return { getter };
}
