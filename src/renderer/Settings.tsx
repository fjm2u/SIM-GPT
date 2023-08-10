import React, { useState } from 'react';
import {
  Box,
  Container,
  FormControl,
  FormLabel,
  Heading,
  Input,
} from '@chakra-ui/react';

export default function Settings() {
  const [apiKey, setKey] = useState(window.electron.store.get('api-key'));
  const handleKeyChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const inputValue = e.target.value;
    window.electron.store.set('api-key', inputValue);
    setKey(inputValue);
  };
  return (
    <Box p="4">
      <Heading textAlign="center" p={2} size="md">
        Config
      </Heading>
      <Container maxW="lg">
        <FormControl>
          <FormLabel>OpenAI API Key</FormLabel>
          {/* @ts-ignore */}
          <Input name="api_key" value={apiKey} onChange={handleKeyChange} />
        </FormControl>
      </Container>
    </Box>
  );
}
