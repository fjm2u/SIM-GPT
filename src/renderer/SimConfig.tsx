import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Button,
  ButtonGroup,
  Card,
  CardBody,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  IconButton,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  SimpleGrid,
  Slider,
  SliderFilledTrack,
  SliderThumb,
  SliderTrack,
  Spacer,
  Text,
  Textarea,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { AddIcon, EditIcon } from '@chakra-ui/icons';
import { SubmitHandler, useForm } from 'react-hook-form';
import notify from './common/notify';
import { SimConf } from './SimConf';

interface CharacterFormData {
  name: string;
  personality: string;
  past: string;
  status: string;
  plan: string;
}

export default function SimConfig({
  projectId,
  project,
  setProject,
  isRunning,
}: {
  projectId: string;
  project: SimConf;
  setProject: (project: SimConf) => void;
  isRunning: boolean;
}) {
  const toast = useToast();
  const [question, setQuestion] = React.useState('');
  const [temperature, setTemp] = React.useState(0.5);
  const [prePrompt, setPrePrompt] = React.useState(
    window.electron.store.get(projectId)
      ? JSON.parse(window.electron.store.get(projectId))?.prePrompt
      : ''
  );
  const [postPrompt, setPostPrompt] = React.useState(
    window.electron.store.get(projectId)
      ? JSON.parse(window.electron.store.get(projectId))?.postPrompt
      : ''
  );
  const [actionType, setActionType] = useState<'add' | 'edit' | null>(null);
  const [editCharacterIndex, setEditCharacterIndex] = React.useState(0);

  useEffect(() => {
    setProject(
      window.electron.store.get(projectId)
        ? JSON.parse(window.electron.store.get(projectId))
        : {}
    );
  }, [projectId]);

  const createCharacterModal = useDisclosure();
  const { handleSubmit, register, reset } = useForm<CharacterFormData>();

  const handleQuestionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const inputValue = e.target.value;
    setProject({ ...project, question: inputValue });
    setQuestion(inputValue);
  };
  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const inputValue = e.target.value;
    setProject({ ...project, prePrompt: inputValue });
    setPrePrompt(inputValue);
  };
  const handlePostPromptChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const inputValue = e.target.value;
    setProject({ ...project, postPrompt: inputValue });
    setPostPrompt(inputValue);
  };

  const handleTemperatureChange = (temp: number) => {
    setProject({ ...project, temperature: String(temp) });
    setTemp(temp);
  };

  const handleCharacterEdit = (index: number) => {
    setEditCharacterIndex(index);
    setActionType('edit');
  };
  const onSubmit: SubmitHandler<CharacterFormData> = (data) => {
    if (!data.name || !data.personality || !data.past || !data.status) return;
    const characters = project.characters || [];
    // @Todo: Check if same name exists
    const updatedCharacters = [...characters];
    if (actionType === 'edit') {
      updatedCharacters[editCharacterIndex] = {
        name: data.name,
        personality: data.personality,
        past: data.past,
        status: data.status,
        plan: data.plan,
      };
    } else {
      updatedCharacters.push({
        name: data.name,
        personality: data.personality,
        past: data.past,
        status: data.status,
        plan: data.plan,
      });
    }
    setProject({ ...project, characters: updatedCharacters });
    notify(
      toast,
      'success',
      actionType
        ? 'Character created successfully'
        : 'Character updated successfully'
    );
    createCharacterModal.onClose();
    setActionType(null);
  };
  const exportConfig = () => {
    // eslint-disable-next-line promise/catch-or-return
    navigator.clipboard.writeText(JSON.stringify(project)).then(
      () => notify(toast, 'success', 'Copied'),
      () => notify(toast, 'error', 'Copy failed')
    );
  };
  const importConfig = () => {
    // eslint-disable-next-line promise/catch-or-return
    navigator.clipboard.readText().then((clipText) => {
      // eslint-disable-next-line promise/always-return
      try {
        const clip = JSON.parse(clipText);
        if (
          clip.question !== undefined &&
          clip.prePrompt !== undefined &&
          clip.postPrompt !== undefined &&
          clip.characters !== undefined &&
          clip.temperature !== undefined
        ) {
          if (clip.characters.length > 0) {
            clip.characters.forEach((character: any) => {
              if (
                !character.name ||
                !character.personality ||
                !character.past ||
                !character.status
              ) {
                notify(toast, 'error', 'Invalid JSON');
              }
            });
          }
          setProject(clip);
          window.electron.store.set(projectId, JSON.stringify(clip));
          setQuestion(clip.question);
          setPrePrompt(clip.prePrompt);
          setPostPrompt(clip.postPrompt);
        }
      } catch (e) {
        notify(toast, 'error', 'Invalid JSON');
      }
    });
  };

  useEffect(() => {
    window.electron.store.set(projectId, JSON.stringify(project));
    console.log(project);
    setQuestion(project.question || '');
    setPrePrompt(project.prePrompt || '');
    setPostPrompt(project.postPrompt || '');

    if (project.prePrompt === '' || project.prePrompt === undefined) {
      setProject({
        ...project,
        prePrompt: `ここに {characterCount} 名のキャラクターがいます。
{characterNames} です。
あなたは {characterName} です。
必ず {characterName} としてのみ振舞ってください。
{characterNames} は {question} について話し合っています。
以下はそれぞれのキャラクターの名前、性格、過去、現在の状態、そして将来の計画です。\n
{characterDetails}\n
これらのキャラクターは、互いのことをあまり知りません。
あなたの返答の最大文字数は２８０字です。
必ず {characterName} が話すことのみを返してください。
鍵括弧をつけないでください`,
      });
    }
  }, [project, projectId]);

  useEffect(() => {
    if (actionType !== null) createCharacterModal.onOpen();
    reset();
  }, [actionType]);

  return (
    <>
      <Heading textAlign="center" size="lg" p={3}>
        {projectId}
      </Heading>

      <HStack>
        <Heading size="md" py={3}>
          Config
        </Heading>
        <Spacer />
        <ButtonGroup variant="outline" spacing="6" size="sm">
          <Button colorScheme="purple" onClick={importConfig}>
            Import
          </Button>
          <Button colorScheme="teal" onClick={exportConfig}>
            Export
          </Button>
        </ButtonGroup>
      </HStack>
      <Accordion defaultIndex={[0, 1]} allowMultiple>
        <AccordionItem>
          <h2>
            <AccordionButton>
              <Box as="span" flex="1" textAlign="left">
                <Heading size="sm">Characters</Heading>
              </Box>
              <AccordionIcon />
            </AccordionButton>
          </h2>
          <AccordionPanel pb={4}>
            <SimpleGrid
              spacing={4}
              templateColumns="repeat(auto-fill, minmax(150px, 1fr))"
            >
              <Card>
                <CardBody>
                  <Text>Each character is an agent.</Text>
                  <IconButton
                    m={1}
                    isDisabled={isRunning}
                    colorScheme="teal"
                    aria-label="Add character"
                    size="sm"
                    onClick={() => setActionType('add')}
                    icon={<AddIcon />}
                  />
                </CardBody>
              </Card>
              {project.characters?.map((character, index) => (
                <Card key={character.name} fontSize="lg">
                  <CardBody>
                    <Text>{character.name}</Text>
                    <IconButton
                      m={1}
                      isDisabled={isRunning}
                      colorScheme="teal"
                      aria-label="Edit character"
                      size="sm"
                      onClick={() => handleCharacterEdit(index)}
                      icon={<EditIcon />}
                    />
                  </CardBody>
                </Card>
              ))}
            </SimpleGrid>
          </AccordionPanel>
        </AccordionItem>
        <AccordionItem>
          <h2>
            <AccordionButton>
              <Box as="span" flex="1" textAlign="left">
                <Heading size="sm">Question (Topic)</Heading>
              </Box>
              <AccordionIcon />
            </AccordionButton>
          </h2>
          <AccordionPanel pb={4}>
            <Textarea
              isDisabled={isRunning}
              value={question}
              onChange={handleQuestionChange}
              placeholder="Here is a question."
              size="sm"
            />
          </AccordionPanel>
        </AccordionItem>
        <AccordionItem>
          <h2>
            <AccordionButton>
              <Box as="span" flex="1" textAlign="left">
                <Heading size="sm">Pre-prompt (role=system)</Heading>
              </Box>
              <AccordionIcon />
            </AccordionButton>
          </h2>
          <AccordionPanel pb={4}>
            <Textarea
              value={prePrompt}
              isDisabled={isRunning}
              onChange={handlePromptChange}
              placeholder="Here is a prompt template."
              size="md"
            />
          </AccordionPanel>
        </AccordionItem>
        <AccordionItem>
          <h2>
            <AccordionButton>
              <Box as="span" flex="1" textAlign="left">
                <Heading size="sm">Post-prompt (role=user)</Heading>
              </Box>
              <AccordionIcon />
            </AccordionButton>
          </h2>
          <AccordionPanel pb={4}>
            <Textarea
              value={postPrompt}
              isDisabled={isRunning}
              onChange={handlePostPromptChange}
              placeholder="Here is a prompt template."
              size="md"
            />
          </AccordionPanel>
        </AccordionItem>
        <AccordionItem>
          <h2>
            <AccordionButton>
              <Box as="span" flex="1" textAlign="left">
                <Heading size="sm">Temperature</Heading>
              </Box>
              <AccordionIcon />
            </AccordionButton>
          </h2>
          <AccordionPanel pb={4}>
            <Slider
              value={temperature}
              min={0}
              max={1}
              step={0.1}
              isDisabled={isRunning}
              onChange={handleTemperatureChange}
            >
              <SliderTrack bg="red.100">
                <SliderFilledTrack bg="tomato" />
              </SliderTrack>
              <SliderThumb boxSize={6} />
            </Slider>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
      {/* Modal */}
      <Modal
        size="xl"
        scrollBehavior="outside"
        isCentered
        isOpen={createCharacterModal.isOpen}
        onClose={() => {
          setActionType(null);
          createCharacterModal.onClose();
        }}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {actionType === 'add' ? 'Create a character' : 'Edit a character'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Box textAlign="center" p={1}>
              <form>
                <FormControl isRequired mt={4}>
                  <FormLabel>Name</FormLabel>
                  <Input
                    defaultValue={
                      actionType === 'edit'
                        ? project.characters[editCharacterIndex]?.name
                        : ''
                    }
                    type="text"
                    /* eslint-disable-next-line react/jsx-props-no-spreading */
                    {...register('name')}
                  />
                </FormControl>
                <FormControl isRequired mt={4}>
                  <FormLabel>Personality</FormLabel>
                  <Textarea
                    /* eslint-disable-next-line react/jsx-props-no-spreading */
                    {...register('personality')}
                    defaultValue={
                      actionType === 'edit'
                        ? project.characters[editCharacterIndex]?.personality
                        : ''
                    }
                  />
                </FormControl>
                <FormControl isRequired mt={4}>
                  <FormLabel>Past</FormLabel>
                  <Textarea
                    /* eslint-disable-next-line react/jsx-props-no-spreading */
                    {...register('past')}
                    defaultValue={
                      actionType === 'edit'
                        ? project.characters[editCharacterIndex]?.past
                        : ''
                    }
                  />
                </FormControl>
                <FormControl isRequired mt={4}>
                  <FormLabel>Current status</FormLabel>
                  <Textarea
                    /* eslint-disable-next-line react/jsx-props-no-spreading */
                    {...register('status')}
                    defaultValue={
                      actionType === 'edit'
                        ? project.characters[editCharacterIndex]?.status
                        : ''
                    }
                  />
                </FormControl>
                <FormControl isRequired mt={4}>
                  <FormLabel>Future plan</FormLabel>
                  <Textarea
                    /* eslint-disable-next-line react/jsx-props-no-spreading */
                    {...register('plan')}
                    defaultValue={
                      actionType === 'edit'
                        ? project.characters[editCharacterIndex]?.plan
                        : ''
                    }
                  />
                </FormControl>
              </form>
            </Box>
          </ModalBody>

          <ModalFooter>
            <Button
              variant="ghost"
              mr={3}
              onClick={() => {
                setActionType(null);
                createCharacterModal.onClose();
              }}
            >
              Close
            </Button>
            <Spacer />
            <Button colorScheme="teal" onClick={handleSubmit(onSubmit)}>
              {actionType === 'add' ? 'Create' : 'Update'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
