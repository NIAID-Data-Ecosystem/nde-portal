import type { RecipeVariantProps } from '@chakra-ui/react';
import {
  Icon,
  IconProps,
  Link,
  LinkProps as ChakraLinkProps,
} from '@chakra-ui/react';
import { FaArrowUpRightFromSquare } from 'react-icons/fa6';
import linkRecipe from 'src/theme/recipes/link.recipe';

// Styles based on: https://designsystem.niaid.nih.gov/components/atoms)
type LinkVariantProps = RecipeVariantProps<typeof linkRecipe>;

// Extending Chakra LinkProps to include our custom variants and isExternal prop: https://www.chakra-ui.com/docs/theming/recipes#typescript-1
export interface LinkProps extends Omit<ChakraLinkProps, 'variant'> {
  variant?: LinkVariantProps['variant'];
  isExternal?: boolean;
  iconProps?: IconProps;
}

const CustomLink = ({
  isExternal,
  children,
  iconProps,
  variant,
  ...props
}: LinkProps) => {
  return (
    <Link
      target={isExternal ? '_blank' : undefined}
      rel={isExternal ? 'noopener noreferrer' : undefined}
      // @ts-ignore
      variant={variant}
      {...props}
    >
      {children}
      {/* Add an external link icon when [isExternal] prop is true */}
      {isExternal && (
        <Icon boxSize={3} m={0.5} ml={1} mb={1} {...iconProps}>
          <FaArrowUpRightFromSquare />
        </Icon>
      )}
    </Link>
  );
};

export { CustomLink as Link };
