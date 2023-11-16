import { molecule, useMolecule } from 'bunshi/react';
import { atom, useAtom, useAtomValue } from 'jotai';
import React from 'react';
import { AttributeMolecule } from './AttributeMolecule';
import {
  AttributeField,
  AttributeTemplate,
  AttributeThemeMoleculeValue,
  AttributeWidget,
  DefaultAttributeComponent,
} from './AttributeThemeMolecule';

export const DefaultAttributeTemplate: AttributeTemplate = props => {
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
      onInput={e => setValue((e.target as HTMLInputElement).value)}
    />
  );
};

export const DefaultBooleanWidget: AttributeWidget = () => {
  const { booleanValueAtom } = useMolecule(AttributeMolecule);
  const [value, setValue] = useAtom(booleanValueAtom);
  return (
    <input
      type="checkbox"
      checked={value}
      onChange={e => setValue((e.target as HTMLInputElement).checked)}
    />
  );
};

export const DefaultNumberWidget: AttributeWidget = () => {
  const { numberValueAtom } = useMolecule(AttributeMolecule);
  const [value, setValue] = useAtom(numberValueAtom);
  return (
    <input
      type="number"
      value={value}
      onInput={e => setValue(+(e.target as HTMLInputElement).value)}
    />
  );
};

export const DefaultSelectWidget: AttributeWidget = () => {
  const { valueAtom, schemaAtom } = useMolecule(AttributeMolecule);
  const [value, setValue] = useAtom(valueAtom);

  const schema = useAtomValue(schemaAtom);

  return (
    <select value={value} onChange={e => setValue(e.target.value)}>
      {schema.enum?.map((key, idx) => (
        <option value={key}>{schema.enumNames?.[idx] ?? key}</option>
      ))}
    </select>
  );
};

export const DefaultAttributeThemeMolecule = molecule<
  AttributeThemeMoleculeValue
>(() => {
  return {
    widgets: atom<{}>({
      text: DefaultTextWidget,
      boolean: DefaultBooleanWidget,
      number: DefaultNumberWidget,
      select: DefaultSelectWidget,
      [DefaultAttributeComponent]: DefaultTextWidget,
    }),
    templates: atom({
      [DefaultAttributeComponent]: DefaultAttributeTemplate,
    }),
    fields: atom({
      [DefaultAttributeComponent]: DefaultAttributeField,
    }),
  };
});
