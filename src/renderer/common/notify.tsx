import { useToast } from '@chakra-ui/react';
import { AlertStatus } from '@chakra-ui/alert';

export default function notify(
  toast: ReturnType<typeof useToast>,
  title: string,
  description: string,
  status: AlertStatus = 'success',
  duration = 4000,
  isClosable = true
) {
  toast({
    title,
    description,
    status,
    duration,
    isClosable,
  });
}
