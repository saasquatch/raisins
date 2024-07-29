import type { NPMRegistry } from '../../util/NPMRegistry';
import { ChildAPIModule } from './RaisinsChildAPI';

export type Props = {
  selector: string;
  events: string[];
};
export const childApiSrc = (
  registry: NPMRegistry,
  selector: string,
  events: Set<string>
) => {
  const props: Props = { selector, events: Array.from(events.values()) };
  return `<style>
  body{ margin: 0 }
  </style>
  <script src="${registry.resolvePath(
    {
      package: 'penpal',
      version: '6.2.2',
    },
    'dist/penpal.min.js'
  )}"></script>
  <script type="module">
  import * as snabbdom from "${registry.resolvePath(
    {
      package: 'snabbdom',
      version: '3.6.2',
    },
    '+esm'
  )}"
  const props = ${JSON.stringify(props)};
  (${ChildAPIModule})();
  </script>
  `;
};
