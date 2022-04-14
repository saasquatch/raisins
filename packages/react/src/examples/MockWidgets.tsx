import { useAtom, useAtomValue } from 'jotai';
import { useMolecule } from 'jotai-molecules';
import React from 'react';
import { AttributeMolecule } from '../attributes';
import { Clear } from '../attributes/AttributesController.stories';

const colorStyle = {
  height: '25px',
  width: '25px',

  cursor: 'pointer',
  display: 'inline-block',
  marginLeft: '5px',
};
export const ColorWidget = () => {
  const { name, valueAtom, schemaAtom } = useMolecule(AttributeMolecule);
  const [value, setValue] = useAtom(valueAtom);
  const schema = useAtomValue(schemaAtom);
  return (
    <div>
      <b>{schema.title ?? name}</b>{' '}
      <input
        type="text"
        value={value}
        onInput={(e) => setValue((e.target as HTMLInputElement).value)}
      />
      <Clear />
      <div>
        <div
          style={{ ...colorStyle, backgroundColor: 'salmon' }}
          onClick={() => setValue('salmon')}
        ></div>
        <div
          style={{ ...colorStyle, backgroundColor: 'BlanchedAlmond' }}
          onClick={() => setValue('BlanchedAlmond')}
        ></div>
        <div
          style={{ ...colorStyle, backgroundColor: 'lime' }}
          onClick={() => setValue('lime')}
        ></div>
        <div
          style={{ ...colorStyle, backgroundColor: 'PeachPuff' }}
          onClick={() => setValue('PeachPuff')}
        ></div>
        <div
          style={{ ...colorStyle, backgroundColor: 'LemonChiffon' }}
          onClick={() => setValue('LemonChiffon')}
        ></div>
      </div>
    </div>
  );
};

export const DateRangeWidget = () => {
  const { name, valueAtom, schemaAtom } = useMolecule(AttributeMolecule);
  const [value, setValue] = useAtom(valueAtom);
  const schema = useAtomValue(schemaAtom);
  return (
    <div>
      <b>{schema.title ?? name}</b>{' '}
      <input
        type="date"
        value={value}
        onInput={(e) => setValue((e.target as HTMLInputElement).value)}
      />
    </div>
  );
};
export const ImageUpload = () => {
  const { name, valueAtom, schemaAtom } = useMolecule(AttributeMolecule);
  const [value, setValue] = useAtom(valueAtom);
  const schema = useAtomValue(schemaAtom);
  return (
    <div>
      <b>{schema.title ?? name}</b>{' '}
      <input
        type="text"
        value={value}
        onInput={(e) => setValue((e.target as HTMLInputElement).value)}
      />
    </div>
  );
};
export const StatTypeSelectWidget = () => {
  const { name, valueAtom, schemaAtom } = useMolecule(AttributeMolecule);
  const [value, setValue] = useAtom(valueAtom);
  const schema = useAtomValue(schemaAtom);

  return (
    <div>
      <b>{schema.title ?? name}</b>{' '}
      <input
        type="text"
        value={value}
        onInput={(e) => setValue((e.target as HTMLInputElement).value)}
      />
    </div>
  );
};

export type Widgets = {
  [key: string]: React.FC;
};

export const widgets: Widgets = {
  color: ColorWidget,
  DateRange: DateRangeWidget,
  StatTypeSelectWidget,
  ImageUpload,
};
