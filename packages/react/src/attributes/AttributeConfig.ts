import { molecule } from 'jotai-molecules';
import { ConfigMolecule } from '../core/RaisinPropsScope';
import type { AttributeThemeMolecule } from './AttributeThemeMolecule';
import { DefaultAttributeThemeMolecule } from './DefaultAttributeThemeMolecule';

export type AttributeConfig = {
  AttributeTheme: AttributeThemeMolecule;
};

export const AttributeConfigMolecule = molecule((getMol) => {
  const config = getMol(ConfigMolecule);
  return {
    AttributeTheme: getMol(config.AttributeTheme ?? DefaultAttributeThemeMolecule),
  };
});
