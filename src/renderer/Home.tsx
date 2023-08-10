import React, { useEffect, useState } from 'react';
import {
  Box,
  Flex,
  Input,
  Stack,
  IconButton,
  InputGroup,
  InputRightElement,
  Divider,
  Text,
  useToast,
} from '@chakra-ui/react';
import { AddIcon, EditIcon, DeleteIcon } from '@chakra-ui/icons';
import { useNavigate, useParams } from 'react-router-dom';
import notify from './common/notify';
import Link from './common/Link';
import Simulation from './Simulation';

function ProjectList() {
  const [projects, setProjects] = useState(
    JSON.parse(window.electron.store.get('projects'))
  );
  const [newProject, setNewProject] = useState('');
  const [editIndex, setEditIndex] = useState<null | number>(null);
  const toast = useToast();
  const navigate = useNavigate();

  const handleAddProject = () => {
    if (newProject.trim() === '') return;
    if (projects.includes(newProject)) {
      notify(toast, 'error', 'Project name already in use', 'error');
      return;
    }
    setProjects([...projects, newProject]);
    setNewProject('');
  };

  const handleEditProject = (index: number) => {
    setNewProject(projects[index]);
    setEditIndex(index);
    // Unselect the project
    navigate('/');
  };

  const handleUpdateProject = () => {
    if (newProject.trim() === '') return;
    if (projects.includes(newProject)) {
      notify(toast, 'error', 'Project name already in use', 'error');
      return;
    }
    const projectData = window.electron.store.get(
      projects[editIndex as number]
    );
    window.electron.store.set(newProject, projectData);
    window.electron.store.delete(projects[editIndex as number]);
    const updatedProjects = [...projects];
    updatedProjects[editIndex as number] = newProject;
    setProjects(updatedProjects);
    setNewProject('');
    setEditIndex(null);
  };

  const handleDeleteProject = (index: number, project: string) => {
    window.electron.store.delete(project);
    const updatedProjects = projects.filter((_: any, i: number) => i !== index);
    setProjects(updatedProjects);
    navigate('/');
  };

  useEffect(() => {
    window.electron.store.set('projects', JSON.stringify(projects));
  }, [projects]);

  return (
    <Box py="2" margin="0 auto">
      <Stack spacing="4">
        <InputGroup>
          <Input
            value={newProject}
            onChange={(e) => setNewProject(e.target.value)}
            placeholder="Create a new project"
          />
          <InputRightElement>
            {editIndex === null ? (
              <IconButton
                aria-label="Add"
                colorScheme="teal"
                onClick={handleAddProject}
                icon={<AddIcon />}
              />
            ) : (
              <IconButton
                aria-label="Update"
                colorScheme="teal"
                onClick={handleUpdateProject}
                icon={<EditIcon />}
              />
            )}
          </InputRightElement>
        </InputGroup>
        <Divider />

        {projects.map((project: string, index: number) => (
          <Box
            key={project}
            display="flex"
            alignItems="center"
            justifyContent="space-between"
          >
            <Box>
              <Link to={`/${project}`}>{project}</Link>
            </Box>
            <Box>
              <IconButton
                icon={<EditIcon />}
                size="sm"
                aria-label="Edit"
                mr="2"
                onClick={() => handleEditProject(index)}
              />
              <IconButton
                icon={<DeleteIcon />}
                size="sm"
                aria-label="Delete"
                onClick={() => handleDeleteProject(index, project)}
              />
            </Box>
          </Box>
        ))}
      </Stack>
    </Box>
  );
}

export default function Home() {
  const { projectId } = useParams();
  const isProjectSelected = projectId !== undefined;
  return (
    <Flex flex="1">
      {/* Sidebar */}
      <Box maxW="400px" bg="gray.200" p="4">
        {/* Sidebar content goes here */}
        <ProjectList />
      </Box>

      {/* Main Content */}
      <Flex flex="1" p="4" flexDirection="column">
        {isProjectSelected ? (
          <Simulation projectId={projectId} />
        ) : (
          <Text>Please select a project</Text>
        )}
      </Flex>
    </Flex>
  );
}
