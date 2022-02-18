import { useAtomsSnapshot } from 'jotai/devtools';
import { RaisinScope } from '../src/core/RaisinScope';

export const RegisteredAtoms = () => {
  const atoms = useAtomsSnapshot(RaisinScope);

  return (
    <div>
      <p>Atom count: {atoms.size}</p>
      <table>
        <thead></thead>
        <tbody>
          {Array.from(atoms)
            .sort((a, b) => `${a[0]}`.localeCompare(`${b[0]}`))
            .map(([atom, atomValue]) => {
              let strValue;
              try {
                strValue = JSON.stringify(atomValue, null, 2);
              } catch (e) {
                strValue = typeof strValue;
              }
              return (
                <tr key={`${atom}`}>
                  <td>{`${atom} - ${atom.debugLabel??""}`}</td>
                  <td>
                    <details>
                      <summary>{typeof atomValue}</summary>
                      <pre>{strValue}</pre>
                    </details>
                  </td>
                </tr>
              );
            })}
        </tbody>
      </table>
    </div>
  );
};
