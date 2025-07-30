import { useState, useEffect, useMemo } from 'react';
import {
  SearchableListItem,
  SearchableListProps,
  UseSearchableListHook,
  Primitive,
} from './@types';

const defaults: SearchableListProps = {
  clearOnEmpty: false,
  firstLetterCheck: true,
  debounce: true,
  delay: 300,
};

export const useSearchableList = <T extends SearchableListItem>(
  property: keyof T,
  props: SearchableListProps = defaults,
): UseSearchableListHook<T> => {
  const { clearOnEmpty, firstLetterCheck, debounce, delay } = useMemo(
    () => ({ ...defaults, ...props }),
    [props],
  );

  if (!isPrimitive(property)) {
    throw new Error('Invalid property used to filter. Only primitive types are allowed.');
  }

  const [origin, setOrigin] = useState<T[]>([]);
  const [state, setState] = useState<T[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [initialized, setInitialized] = useState<boolean>(false);

  const setValue = (value: T[]): void => {
    setOrigin(value);
    setState(value);
  };

  const filter = (value: Primitive): void => {
    setSearchTerm(value.toString());
  };

  useEffect(() => {
    if (initialized) {
      if (debounce) {
        const delayTimeout = setTimeout(() => {
          applyFilter();
        }, delay);

        return () => clearTimeout(delayTimeout);
      }
      applyFilter();
    } else {
      setState(origin);
      setInitialized(true);
    }
  }, [searchTerm]);

  const applyFilter = (): void => {
    if (searchTerm === '' || searchTerm === undefined) {
      reset();
    } else if (searchTerm.length === 1 && firstLetterCheck) {
      const filteredList = origin.filter((element: T) => {
        const propertyValue = element[property];
        return (
          isPrimitive(propertyValue) &&
          propertyValue.toString().toLowerCase().startsWith(searchTerm.toLowerCase())
        );
      });
      setState(filteredList);
    } else {
      const filteredList = origin.filter((element: T) => {
        const propertyValue = element[property];
        return (
          isPrimitive(propertyValue) &&
          propertyValue.toString().toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
      setState(filteredList);
    }
  };

  const reset = (): void => {
    if (clearOnEmpty) {
      setState([]);
    } else {
      setState(origin);
    }
  };

  return [state, setValue, filter];
};

const isPrimitive = (value: unknown): value is Primitive => {
  return typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean';
};

export * from './@types/index';
