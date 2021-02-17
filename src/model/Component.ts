type JSONSchema = Record<string, any>;

export interface ComponentType {
  title: string;
  tagName: string;
  attributes?: JSONSchema;
  slots?: SlotType[];
}

export interface SlotType {
  title: string;
  key: string;
  /**
   * Layout of the slot. Used for UI hints on layout
   */
  orientation?: 'up-down' | 'left-right' | 'right-left' | 'down-up';
  childTags?: string[];
}
