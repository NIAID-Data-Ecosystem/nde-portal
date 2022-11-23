import MetadataConfig from 'configs/resource-metadata.json';
import MetadataNames from 'configs/metadata-standard-names.json';

type ConfigProps = typeof MetadataConfig;

const MetadataNamesConfig = MetadataNames as {
  property: string;
  name: string;
}[];

/**
 * [findPropertyInfo]: Recursive function that searches for nested
 * properties when provided a dot notation string.
 */

export const findPropertyInfo = (
  property: string,
  dictionary: ConfigProps | ConfigProps[number]['items'],
): ConfigProps[number] | null | { title: string; description: string } => {
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
      return findPropertyInfo(current_accessor, dictionary);
    }

    return findPropertyInfo(accessors, obj.items);
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
      return item as { title: string; description: string };
    }
  }

  return null;
};

/**
 * [getMetadataNameByProperty]: Given a metadata property retrieves the associated display name.
 * Searches for name in standard config, followed by transformed API config, followed by basic formatting.
 */

export const getMetadataNameByProperty = (property: string) => {
  const standardized_name = MetadataNamesConfig.find(
    item => item.property === property,
  );
  const config_name = MetadataConfig.find(item => item.property === property);
  let name = '';
  if (standardized_name) {
    name = standardized_name.name;
  } else if (config_name) {
    name = config_name.title;
  } else {
    // apply some basic formatting.
    name = property
      .split('.')
      .join(' ')
      .split(/(?=[A-Z])/)
      .join(' ');
  }

  return name.charAt(0).toUpperCase() + name.slice(1);
};

// [formatPropertyInfo]:Retrieve name and description from config object for a metadata property.
export const formatPropertyInfo = (property: string) => {
  const formattedProperty = {
    name: property,
    description: '',
  };
  const propertyInfo = findPropertyInfo(property, MetadataConfig) as {
    title: string;
    description?: string;
    abstract?: string;
  };
  const name = propertyInfo?.title || getMetadataNameByProperty(property);
  formattedProperty.name = name.charAt(0).toUpperCase() + name.slice(1);

  if (!propertyInfo) {
    return formattedProperty;
  }
  formattedProperty.description =
    propertyInfo?.abstract || propertyInfo?.description || '';

  if (typeof formattedProperty.description === 'object') {
    formattedProperty.description = Object.values(
      formattedProperty.description,
    ).join(' or ');
  }

  return formattedProperty;
};
