import { Button, Card, CardFooterProps } from '@chakra-ui/react';
import { SectionButton } from 'src/components/section/components/buttons';

export const Footer = ({}: CardFooterProps) => {
  return (
    <Card.Footer justifyContent='flex-end' w='100%'>
      {/* Call to action buttons */}
      {card.footer.cta?.map((cta, index) => {
        return (
          <SectionButton
            key={index}
            asChild={!!cta.href}
            maxWidth={{ base: '225px', sm: 'unset' }}
            variant={index % 2 ? 'solid' : 'outline'}
            {...cta}
          >
            {cta.children}
          </SectionButton>
        );
      })}
    </Card.Footer>
  );
};
