import { DefaultAttributeComponent } from './AttributeThemeMolecule';
import { Attribute } from '@raisins/schema/schema';

const FormatToComponent: Record<string, string> = {
  color: 'text',
  email: 'text',
  'date-time': 'text',
  date: 'text',
  time: 'text',
  duration: 'text',
};
const TypeToComponent: Record<string, string> = {
  string: 'text',
  boolean: 'boolean',
  number: 'number',
};

const DEFAULT_ENUM = 'select';

export function resolveComponent<T>(
  attribute: Attribute,
  components: Record<string, T>
): T {
  if (attribute.uiWidget) {
    const found = components[attribute.uiWidget];
    if (found) return found;
  }
  if (attribute.format) {
    const widgetName = FormatToComponent[attribute.format];
    if (widgetName) {
      const found = components[widgetName];
      if (found) return found;
    }
  }
  if (attribute.enum) {
    const found = components[DEFAULT_ENUM];
    if (found) return found;
  }
  if (attribute.type) {
    const widgetName = TypeToComponent[attribute.type];
    if (widgetName) {
      const found = components[widgetName];
      if (found) return found;
    }
  }
  return components[DefaultAttributeComponent];
}
