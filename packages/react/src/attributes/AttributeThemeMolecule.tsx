import React from 'react';
import { Atom } from 'jotai';
import { Molecule } from 'bunshi/react';

export type AttributeThemeMoleculeValue = {
  widgets: Atom<Record<string, AttributeWidget>>;
  templates: Atom<Record<string, AttributeTemplate>>;
  fields: Atom<Record<string, AttributeField>>;
};

/**
 * Molecule to be provided for Raisins to render attributes editors
 */
export type AttributeThemeMolecule = Molecule<AttributeThemeMoleculeValue>;

export const DefaultAttributeComponent = 'default';

export type AttributeTemplateProps = { children: React.ReactNode };
export type AttributeTemplate = React.ComponentType<AttributeTemplateProps>;

export type AttributeWidgetProps = {
  // None, use context?
};
export type AttributeWidget = React.ComponentType<AttributeWidgetProps>;

export type AttributeFieldProps = {
  // None, use context?
};
export type AttributeField = React.ComponentType<AttributeFieldProps>;
