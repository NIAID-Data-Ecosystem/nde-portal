import {
  Box,
  Flex,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Icon,
  Text,
} from 'nde-design-system';
import { FaRegRectangleList } from 'react-icons/fa6';

interface StepCardProps {
  title: string;
  description: string;
  icon?: string;
  step?: string;
  children?: React.ReactNode;
}

export const StepCard = ({
  title,
  children,
  description,
  icon,
  step,
}: StepCardProps) => {
  return (
    <Box border='1px solid' borderColor='gray.100' borderRadius='semi' my={2}>
      <Flex p={4} textAlign='left' position='relative'>
        {icon && (
          <Flex
            p={1}
            bg='page.alt'
            borderRadius='semi'
            mr={2}
            w='50px'
            h='50px'
            justifyContent='center'
            alignItems='center'
          >
            {icon}
          </Flex>
        )}
        <Box ml={2} flex={1}>
          <Heading as='h4' size='sm' fontWeight='semibold'>
            {title}
          </Heading>
          <Text fontSize='sm'>{description}</Text>
        </Box>
        {step && (
          <Text color='niaid.placeholder' lineHeight='normal' fontSize='sm'>
            {step}
          </Text>
        )}
      </Flex>
      {children}
    </Box>
  );
};
