import { atom } from 'jotai';
import { molecule } from 'jotai-molecules';
import { ConfigMolecule } from '../core/RaisinPropsScope';
import type { AttributeThemeMoleculeValue } from './AttributeThemeMolecule';
import { DefaultAttributeThemeMolecule } from './DefaultAttributeThemeMolecule';

export type AttributeConfig = {
  AttributeTheme: Partial<AttributeThemeMoleculeValue>;
};

export const AttributeConfigMolecule = molecule((getMol) => {
  const config = getMol(ConfigMolecule);
  const defaultTheme = getMol(DefaultAttributeThemeMolecule);
  const providedTheme = config.AttributeTheme
    ? { ...defaultTheme, ...config.AttributeTheme }
    : defaultTheme;

  return {
    AttributeTheme: {
      widgets: atom((get) => ({
        ...get(defaultTheme.widgets),
        ...get(providedTheme.widgets),
      })),
      fields: atom((get) => ({
        ...get(defaultTheme.fields),
        ...get(providedTheme.fields),
      })),
      templates: atom((get) => ({
        ...get(defaultTheme.templates),
        ...get(providedTheme.templates),
      })),
    },
  };
});
