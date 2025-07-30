export type Primitive = string | number | boolean;

export type SearchableListProps = {
  clearOnEmpty?: boolean;
  firstLetterCheck?: boolean;
  debounce?: boolean;
  delay?: number;
};

export type SearchableListItem = Record<string, Primitive | unknown | any>;

export type UseSearchableListHook<T extends SearchableListItem> = [
  T[],
  (value: T[]) => void,
  (value: Primitive) => void,
];
