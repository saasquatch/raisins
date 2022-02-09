import type { NPMRegistry } from '../../util/NPMRegistry';
import { ResizeObserverModule } from './ResizeObserverModule';
import { onLoadScript } from './onLoad';

export const childApiSrc = (registry: NPMRegistry, selector: string) => `
<style>
body{ margin: 0 }
</style>
<script src="${registry.resolvePath(
  {
    name: 'penpal',
    version: '6.2.1',
  },
  'dist/penpal.min.js'
)}"></script>
<script type="module">
import { init, classModule, propsModule, attributesModule, styleModule, datasetModule, h } from "${registry.resolvePath(
  {
    name: 'snabbdom',
    version: '3.1.0',
  },
  'build/index.js'
)}"

const patch = init([
  // Init patch function with chosen modules
  (${ResizeObserverModule})(),
  propsModule, // Handles props, for demo states
  classModule, // makes it easy to toggle classes
  attributesModule, // for setting attributes on DOM elements
  styleModule, // handles styling on elements with support for animations
  datasetModule,
]);

let prev = document.body;
function patchAndCache(next){
	patch(prev, next);
	prev = next;
}
const selector = '${selector}';
window.addEventListener('DOMContentLoaded',${onLoadScript});
</script>
`;
