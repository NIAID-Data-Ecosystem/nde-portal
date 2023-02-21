import MetadataConfig from 'configs/resource-metadata.json';

type ConfigProps = typeof MetadataConfig;

/**
 * [getPropertyInConfig]: Recursive function that searches for nested
 * properties when provided a dot notation string.
 */

export const getPropertyInConfig = (
  property: string,
  dictionary: ConfigProps | ConfigProps[number]['items'],
): ConfigProps[number] | null => {
  if (!dictionary || !property) {
    return null;
  }
  // if property has a dot notation, use recursion to get the most nested/accurate element.
  if (property.includes('.')) {
    const splitProperty = property.split('.');
    // first element is the first key to accessing the data.
    const current_accessor = splitProperty.shift();
    // rest of accessors to access the data.
    const accessors = splitProperty.join('.');
    const obj =
      Array.isArray(dictionary) &&
      dictionary.find(item => item.property === current_accessor);
    if (!obj) {
      return null;
    }
    // Some properties have a name field that doesn't have a description but the parent description is sufficient.
    if (
      current_accessor &&
      accessors === 'name' &&
      (!obj.items || (obj.items && !obj?.items.name))
    ) {
      return getPropertyInConfig(current_accessor, dictionary);
    }

    return getPropertyInConfig(accessors, obj.items);
  }

  if (Array.isArray(dictionary)) {
    const item = dictionary.find(item => item.property === property);
    return item || null;
  }

  const key = property as keyof typeof dictionary;
  if (dictionary[key]) {
    const item = dictionary[key];
    if (!item || Object.keys(item).length === 0) {
      return null;
    } else {
      return item as ConfigProps[number];
    }
  }

  return null;
};
