// Support for responsive props in MDX components
// ex: <a href="#" bg='["orange.100", "green.100"]' px='[2, 4]'>A responsive link</a>
const responsiveProps = [
  'bg',
  'color',
  'px',
  'py',
  'fontSize',
  'mt',
  'mb',
  'ml',
  'mr',
];

/**
 * Parses a responsive prop value.
 * If the value is a string that starts with '[', it attempts to parse it as JSON.
 * Otherwise, it returns the value as is.
 *
 * @param {any} value - The value to parse.
 * @returns {any} - The parsed value or the original value if parsing fails.
 */
export function parseResponsiveProp(value: any) {
  if (typeof value === 'string' && value.trim().startsWith('[')) {
    try {
      return JSON.parse(value.replace(/'/g, '"'));
    } catch {
      return value;
    }
  }
  return value;
}

// Normalizes responsive props in a given object.
export function normalizeResponsiveProps(props: Record<string, any>) {
  const newProps = { ...props };
  responsiveProps.forEach(key => {
    if (key in newProps) {
      newProps[key] = parseResponsiveProp(newProps[key]);
    }
  });
  return newProps;
}
