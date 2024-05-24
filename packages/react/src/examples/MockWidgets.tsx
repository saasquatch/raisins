import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { useMolecule } from 'bunshi/react';
import React from 'react';
import { AttributeMolecule } from '../attributes';

const colorStyle = {
  height: '25px',
  width: '25px',

  cursor: 'pointer',
  display: 'inline-block',
  marginLeft: '5px',
};
export const ColorWidget = () => {
  const { valueAtom } = useMolecule(AttributeMolecule);
  const [value, setValue] = useAtom(valueAtom);
  return (
    <div>
      <input
        type="text"
        value={value}
        onInput={e => setValue((e.target as HTMLInputElement).value)}
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
  const { valueAtom } = useMolecule(AttributeMolecule);
  const [value, setValue] = useAtom(valueAtom);
  return (
    <div>
      <input
        type="date"
        value={value}
        onInput={e => setValue((e.target as HTMLInputElement).value)}
      />
    </div>
  );
};
export const ImageUpload = () => {
  const { valueAtom } = useMolecule(AttributeMolecule);
  const [value, setValue] = useAtom(valueAtom);

  return (
    <div>
      <input
        type="text"
        value={value}
        onInput={e => setValue((e.target as HTMLInputElement).value)}
      />
    </div>
  );
};
export const StatTypeSelectWidget = () => {
  const { valueAtom } = useMolecule(AttributeMolecule);
  const [value, setValue] = useAtom(valueAtom);

  return (
    <div>
      <input
        value={value}
        list="stats"
        onInput={e => setValue((e.target as HTMLInputElement).value)}
      />
      <datalist id="stats">
        <option value="/referralsCount" />
        <option value="/rewardsCount" />
      </datalist>
    </div>
  );
};

export type Widgets = {
  [key: string]: React.FC;
};

export const Clear = () => {
  const { clearAtom } = useMolecule(AttributeMolecule);
  const clear = useSetAtom(clearAtom);
  return <button onClick={clear}>x</button>;
};

export const widgets: Widgets = {
  color: ColorWidget,
  DateRange: DateRangeWidget,
  StatTypeSelectWidget,
  ImageUpload,
};
