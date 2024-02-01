import MetadataConfig from 'configs/resource-metadata.json';
import MetadataNames from 'configs/metadata-standard-names.json';

/**
 * [getMetadataNameByProperty]: Given a metadata property retrieves the associated display name.
 * Searches for name in standard config, followed by transformed API config, followed by basic formatting.
 */

const MetadataNamesConfig = MetadataNames as {
  property: string;
  name: string;
}[];

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
