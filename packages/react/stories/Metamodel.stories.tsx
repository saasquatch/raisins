import { Meta, Story } from '@storybook/react';
import { useComponentModel } from '../src/hooks/useComponentModel';

const meta: Meta = {
  title: 'Metamodel',
  component: Editor,
};
export default meta;

const PACKAGES = [
  '@saasquatch/component-boilerplate',
  '@saasquatch/mint-components',
  '@saasquatch/vanilla-components',
  '@saasquatch/bedrock-components',
];
export function Editor() {
  const props = useComponentModel();

  return (
    <div>
      <div>Loading: {props.loadingModules}</div>
      Modules:
      <ul>
        {props.modules.map((m) => (
          <li>
            {m.name} @ {m.version} for {m.filePath}
          </li>
        ))}
      </ul>
      Details:
      <ul>
        {props.moduleDetails.map((m) => (
          <li>
            <b>{m['package.json'].description}</b>
            <br />
            <div style={{ fontSize: '0.8em', color: 'grey' }}>
              {m['package.json'].name} @ {m['package.json'].version}
            </div>
          </li>
        ))}
      </ul>
      <h2>Add</h2>
      <ul>
        {PACKAGES.map((m) => {
          return (
            <li>
              <a
                href=""
                onClick={(e) => {
                  props.addModule({
                    name: m,
                  });
                  e.preventDefault();
                }}
              >
                {m}
              </a>
            </li>
          );
        })}
      </ul>
      <h2>Remove</h2>
      {PACKAGES.map((m) => {
        return (
          <button onClick={() => props.removeModuleByName(m)}>
            Remove {m}
          </button>
        );
      })}
    </div>
  );
}
