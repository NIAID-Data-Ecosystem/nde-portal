import { transformString2Hash } from './helpers';
import { MDXComponents as DefaultMDXComponents } from 'src/components/mdx/components';

export default {
  img: (props: any) => {
    const styles =
      props.className === 'unstyled'
        ? {}
        : {
            border: '1px solid',
            borderColor: 'gray.100',
            my: 2,
          };

    return DefaultMDXComponents.img({
      ...styles,
      ...props,
    });
  },
  // Add anchor link to headings
  h2: (props: any) => {
    let slug =
      props.children &&
      Array.isArray(props.children) &&
      typeof props.children[0] === 'string'
        ? transformString2Hash(props.children[0])
        : '';
    return DefaultMDXComponents.h2({
      ...props,
      slug,
    });
  },
  h3: (props: any) => {
    let slug =
      props.children &&
      Array.isArray(props.children) &&
      typeof props.children[0] === 'string'
        ? transformString2Hash(props.children[0])
        : '';
    return DefaultMDXComponents.h3({
      ...props,
      slug,
    });
  },
};
