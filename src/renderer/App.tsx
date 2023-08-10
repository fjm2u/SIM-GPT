import {
  MemoryRouter as Router,
  Routes,
  Route,
  Outlet,
} from 'react-router-dom';
import React from 'react';
import { Box, Flex, Heading } from '@chakra-ui/react';
import Home from './Home';
import Link from './common/Link';
import Settings from './Settings';

function Header() {
  return (
    <Flex
      as="header"
      align="center"
      justify="space-between"
      p="4"
      bg="teal.500"
      color="white"
    >
      {/* Logo or site title */}
      <Heading as="h1" size="lg">
        <Link to="/" style={{ textDecoration: 'none' }}>
          SIM-GPT
        </Link>
      </Heading>

      {/* Navigation links */}
      <Flex as="nav" align="center">
        <Box mr="4">
          <Link to="/" style={{ textDecoration: 'none' }}>
            Home
          </Link>
        </Box>
        <Box mr="4">
          <Link to="settings" style={{ textDecoration: 'none' }}>
            Settings
          </Link>
        </Box>

        {/* Optional action button */}
        {/* <Button colorScheme="teal" size="sm"> */}
        {/*   Login */}
        {/* </Button> */}
      </Flex>
    </Flex>
  );
}

function MainFrame() {
  return (
    <Flex direction="column" h="100vh">
      <Header />
      <Flex flex="1" p="4" flexDirection="column">
        <Outlet />
      </Flex>
    </Flex>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainFrame />}>
          <Route index element={<Home />} />
          <Route path=":projectId" element={<Home />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </Router>
  );
}
