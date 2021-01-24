type JSONSchema = Record<string, any>;

export interface ComponentType {
  title: string;
  tagName: string;
  childTags?: string[];
  attributes?: JSONSchema;
  slots?: SlotType[];
}

export interface SlotType {
  title: string;
  key: string;
}
