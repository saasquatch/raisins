import { atom, useAtom, useAtomValue } from 'jotai';
import { molecule, useMolecule } from 'jotai-molecules';
import React from 'react';
import { AttributeMolecule } from './AttributeMolecule';
import {
  AttributeField,
  AttributeTemplate,
  AttributeThemeMolecule,
  AttributeWidget,
  DefaultAttributeComponent,
} from './AttributeThemeMolecule';

export const DefaultAttributeTemplate: AttributeTemplate = (props) => {
  const { name, schemaAtom } = useMolecule(AttributeMolecule);
  const schema = useAtomValue(schemaAtom);

  return (
    <div>
      <div>{schema.title ?? name}</div>
      <div>{props.children}</div>
      {schema.description && <div>{schema.description}</div>}
    </div>
  );
};

export const DefaultAttributeField: AttributeField = () => {
  const { WidgetAtom, TemplateAtom } = useMolecule(AttributeMolecule);
  const Widget = useAtomValue(WidgetAtom);
  const Template = useAtomValue(TemplateAtom);
  return (
    <Template>
      <Widget />
    </Template>
  );
};

export const DefaultTextWidget: AttributeWidget = () => {
  const { valueAtom } = useMolecule(AttributeMolecule);
  const [value, setValue] = useAtom(valueAtom);
  return (
    <input
      type="text"
      value={value}
      onInput={(e) => setValue((e.target as HTMLInputElement).value)}
    />
  );
};

export const DefaultAttributeThemeMolecule: AttributeThemeMolecule = molecule(
  () => {
    return {
      widgets: atom({
        text: DefaultTextWidget,
        [DefaultAttributeComponent]: DefaultTextWidget,
      }),
      templates: atom({
        [DefaultAttributeComponent]: DefaultAttributeTemplate,
      }),
      fields: atom({
        [DefaultAttributeComponent]: DefaultAttributeField,
      }),
    };
  }
);
