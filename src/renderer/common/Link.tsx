import React from 'react';
import { Link as ChakraLink } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';

type LinkProps = React.ComponentProps<typeof ChakraLink> &
  React.ComponentProps<typeof RouterLink>;

export default function Link({ children, ...props }: LinkProps) {
  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <ChakraLink as={RouterLink} {...props}>
      {children}
    </ChakraLink>
  );
}
