import {
  Box,
  Button,
  ButtonGroup,
  Divider,
  Heading,
  HStack,
  Spacer,
  useToast,
  VStack,
  Text,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  InputGroup,
  InputRightAddon,
  InputLeftAddon,
} from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { SimConf } from './SimConf';
import SimConfig from './SimConfig';
import notify from './common/notify';
import Identicon from './common/Identicon';

const { OpenAI } = require('openai');

interface Message {
  role: string;
  character: string;
  content: string;
}

function Chat({ messages }: { messages: Message[] }) {
  // console.log(messages);
  // const [inputText, setInputText] = useState<string>('');
  // const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   setInputText(e.target.value);
  // };
  // const handleSendMessage = () => {
  //   if (inputText.trim() === '') return;
  //   setMessages([...messages, { content: inputText, character: 'user' }]);
  //   setInputText('');
  // };
  return (
    <Box py={4}>
      <Box borderRadius="sm">
        {messages?.map((message, index) => {
          if (index + 1 === messages.length) {
            return (
              <Box
                // eslint-disable-next-line react/no-array-index-key
                key={index}
                border="1px"
                borderWidth="1px"
                p={2}
                m={1}
                w="100%"
              >
                {message?.content}
              </Box>
            );
          }
          return (
            // eslint-disable-next-line react/no-array-index-key
            <HStack key={index}>
              <VStack>
                <Text>{message?.character}</Text>
                <Identicon text={message?.character || ''} />
              </VStack>
              <Box border="1px" borderWidth="1px" p={2} m={1} w="100%">
                {message?.content}
              </Box>
            </HStack>
          );
        })}
      </Box>

      {/* <Input */}
      {/*  value={inputText} */}
      {/*  onChange={handleInputChange} */}
      {/*  placeholder="Type your message..." */}
      {/* /> */}
      {/* <Button onClick={handleSendMessage}>Send</Button> */}
    </Box>
  );
}

// configからシミュレーションを実行する
export default function Simulation({ projectId }: { projectId: string }) {
  const toast = useToast();
  const [project, setProject] = useState<SimConf>(
    window.electron.store.get(projectId)
      ? JSON.parse(window.electron.store.get(projectId))
      : {
          temperature: '',
          question: '',
          characters: [],
          prePrompt: '',
          postPrompt: '',
        }
  );
  const [times, setTimes] = useState<number>(2);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [apiKey] = useState<string | undefined>(
    window.electron.store.get('api-key')
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const openai = new OpenAI({
    apiKey: apiKey || '',
    dangerouslyAllowBrowser: true,
  });

  const saveChatHistory = () => {
    // eslint-disable-next-line promise/catch-or-return
    navigator.clipboard.writeText(JSON.stringify(messages)).then(
      () => notify(toast, 'success', 'Copied'),
      () => notify(toast, 'error', 'Copy failed')
    );
  };
  const run = async (continuedChat: boolean) => {
    if (
      !project ||
      !project.question ||
      !project.prePrompt ||
      !project.postPrompt ||
      !project.characters ||
      !project.characters.length
    ) {
      notify(toast, 'error', 'Please set config', 'error');
      setIsRunning(false);
      return;
    }

    // それぞれの人がN回話せるようにloop
    // 最初はsystemにpromptを入れて、questionに答えるように送る
    const continuedMessage = messages.slice(0, messages.length - 1);
    const prevAssistantMessages: Message[] = continuedChat
      ? continuedMessage
      : [];
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < times * project.characters.length + 1; i++) {
      console.log('number: ', i % project.characters.length);

      // Replace prompt
      let content = project.prePrompt;
      content = content.replaceAll(
        '{characterCount}',
        String(project?.characters?.length)
      );
      content = content.replaceAll(
        '{characterNames}',
        String(project?.characters?.map((c) => c.name).join(', '))
      );
      content = content.replaceAll('{question}', String(project?.question));
      content = content.replaceAll(
        '{characterDetails}',
        String(
          project?.characters?.map(
            (c) =>
              `
${c.name}
- 性格 ${c.personality}
- 過去 ${c.past}
- 現在の状態 ${c.status}
- 将来の計画 ${c.plan}\n`
          )
        )
      );
      content = content.replaceAll(
        '{characterName}',
        String(project?.characters?.[i % project.characters.length]?.name)
      );
      console.log(content);

      let sendMessages: Message[] = [
        {
          role: 'system',
          character: 'system',
          content,
        },
      ];
      if (i === 0 && !continuedChat) {
        sendMessages.push({
          role: 'user',
          character: 'user',
          content: `Start the discussion.`,
        });
      } else {
        sendMessages = prevAssistantMessages.map((m) => {
          if (
            project?.characters?.[i % project.characters.length]?.name ===
            m.character
          ) {
            return {
              content: m.content,
              character: m.character,
              role: 'assistant',
            };
          }
          return {
            content: m.content,
            character: m.character,
            role: m.role,
          };
        });
        if (i === times * project.characters.length) {
          sendMessages.push({
            role: 'user',
            character: 'user',
            content: project.postPrompt,
          });
        }
      }
      try {
        console.log(
          prevAssistantMessages,
          sendMessages.map((m) => {
            return {
              content: m.content,
              role: m.role,
            };
          })
        );
        // eslint-disable-next-line no-await-in-loop
        const response = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          // model: 'gpt-4-0314',
          messages: sendMessages.map((m) => ({
            content: m.content,
            role: m.role,
          })),
          temperature: Number(project.temperature),
        });
        // @Todo: 考える処理を実装する
        prevAssistantMessages.push({
          role: 'user',
          character: project.characters[i % project.characters.length].name,
          content: response?.choices?.[0]?.message.content,
        });
      } catch (e: any) {
        notify(toast, 'error', e.message, 'error');
      }
    }
    setMessages(prevAssistantMessages);
    setIsRunning(false);
  };
  useEffect(() => {
    setMessages([]);
  }, [projectId]);

  return (
    <>
      <SimConfig
        isRunning={isRunning}
        projectId={projectId}
        project={project}
        setProject={setProject}
      />
      <Divider borderWidth={2} my={4} />
      <HStack>
        <Heading size="md" py={3}>
          Simulation
        </Heading>
        <Spacer />
        <ButtonGroup variant="outline" spacing="6" size="sm">
          <Button
            isDisabled={isRunning}
            colorScheme="teal"
            onClick={() => {
              setIsRunning(true);
              setMessages(() => []);
              run(false);
            }}
          >
            {isRunning ? 'Running...' : 'Run'}
          </Button>
          <Button
            colorScheme="purple"
            isDisabled={!messages.length || isRunning}
            onClick={() => {
              setIsRunning(true);
              run(true);
            }}
          >
            Continue
          </Button>
          <Button
            colorScheme="blue"
            onClick={saveChatHistory}
            isDisabled={!messages.length || isRunning}
          >
            Save
          </Button>
        </ButtonGroup>
      </HStack>
      <InputGroup justifyContent="flex-end" size="sm">
        {/* eslint-disable-next-line react/no-children-prop */}
        <InputLeftAddon children="Run" />
        <NumberInput
          isDisabled={isRunning}
          value={times}
          max={10}
          min={1}
          maxW={20}
          clampValueOnBlur={false}
          onChange={(value) => setTimes(Number(value))}
        >
          <NumberInputField />
          <NumberInputStepper>
            <NumberIncrementStepper />
            <NumberDecrementStepper />
          </NumberInputStepper>
        </NumberInput>
        {/* eslint-disable-next-line react/no-children-prop */}
        <InputRightAddon children="times" />
      </InputGroup>
      <Chat messages={messages || []} />
    </>
  );
}
