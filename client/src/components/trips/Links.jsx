import React, { useState } from 'react';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGripLines } from '@fortawesome/free-solid-svg-icons';
import { HStack, Button, Input, Flex, Box, Link } from '@chakra-ui/react';
import {
  AddIcon,
  ExternalLinkIcon,
  CheckIcon,
  CloseIcon,
  DeleteIcon,
  EditIcon,
} from '@chakra-ui/icons';
import { connect } from 'react-redux';
import axios from 'axios';
import PropTypes from 'prop-types';

import { getUserTrip, editLinks } from '../../actions/trips';

const Links = ({ links, tripId, editLinks, getUserTrip }) => {
  const [newLink, setNewLink] = useState({ name: '', url: '' });
  const [linksBeingEdited, setLinksBeingEdited] = useState([]);

  const onDragEnd = (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) {
      return;
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const link = links.find((link) => link._id === draggableId);
    const newLinks = [...links];
    newLinks.splice(source.index, 1);
    newLinks.splice(destination.index, 0, link);
    editLinks(tripId, newLinks);
  };

  const onChangeNewLink = (e) => {
    setNewLink((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const onAddLink = async () => {
    if (newLink.name === '' || newLink.url === '') {
      return;
    }

    const newLinks = [...links, newLink];
    await axios.put(`/api/trips/${tripId}`, { links: newLinks });

    setNewLink({ name: '', url: '' });
    await getUserTrip(tripId);
  };

  const onDeleteLink = async (index) => {
    const { oldLink } = linksBeingEdited[index];

    const newLinks = [...links];
    newLinks.splice(links.indexOf(oldLink), 1);

    editLinks(tripId, newLinks);
  };

  const onToggleEdit = (link) => {
    const index = linksBeingEdited.findIndex(
      ({ oldLink }) => oldLink._id === link._id
    );

    if (index !== -1) {
      // Toggle link editing OFF
      setLinksBeingEdited((prevState) => {
        return prevState.splice(index, 1);
      });
    } else {
      setLinksBeingEdited((prevState) => {
        return [...prevState, { oldLink: link, newLink: link }];
      });
    }
  };

  const assurePrefix = (url) => {
    return url.match(/^.{3,5}\:\/\//) ? url : `//${url}`;
  };

  const onChangeLink = (e, index) => {
    setLinksBeingEdited((prevState) => {
      const newState = [...prevState];
      newState[index].newLink[e.target.name] = e.target.value;
      return newState;
    });
  };

  const onSaveLink = async (index) => {
    const { oldLink, newLink } = linksBeingEdited[index];
    const newLinks = [...links];
    newLinks.splice(links.indexOf(oldLink), 1, newLink);

    await editLinks(tripId, newLinks);
  };

  const getLink = (link) => {
    const index = linksBeingEdited.findIndex(({ oldLink }) => oldLink === link);

    if (index === -1) {
      // Not being edited
      return (
        <Draggable
          key={link._id}
          draggableId={link._id}
          index={links.indexOf(link)}
        >
          {(provided) => (
            <Box
              backgroundColor="#EEEEEE"
              boxShadow="2px 2px 30px 2px rgba(94, 94, 94, 0.22)"
              borderRadius="8px"
              mb="8px"
              p="10px 10px 10px 16px"
              w="700px"
              ref={provided.innerRef}
              {...provided.draggableProps}
            >
              <Flex>
                <Box w="40px" display="flex" alignItems="center">
                  <span {...provided.dragHandleProps}>
                    <FontAwesomeIcon icon={faGripLines} />
                  </span>
                </Box>
                <Box flex="1" display="flex" alignItems="center">
                  <Link
                    href={assurePrefix(link.url)}
                    target="_blank"
                    fontWeight="semibold"
                    isExternal
                  >
                    {link.name} <ExternalLinkIcon mx="2px" />
                  </Link>
                </Box>
                <Box>
                  <Button onClick={() => onToggleEdit(link)}>
                    <EditIcon mx="2px" />
                  </Button>
                </Box>
              </Flex>
            </Box>
          )}
        </Draggable>
      );
    } else {
      return (
        <Box
          backgroundColor="#EEEEEE"
          boxShadow="2px 2px 30px 2px rgba(94, 94, 94, 0.22)"
          borderRadius="8px"
          mb="8px"
          p="10px 10px 10px 16px"
          key={link._id}
        >
          <HStack>
            <Input
              maxW="250px"
              type="text"
              name="name"
              value={linksBeingEdited[index].newLink.name}
              onChange={(e) => onChangeLink(e, index)}
              autoComplete="off"
              data-form-type="other"
            />
            <Input
              maxW="250px"
              type="text"
              name="url"
              value={linksBeingEdited[index].newLink.url}
              onChange={(e) => onChangeLink(e, index)}
              autoComplete="off"
              data-form-type="other"
            />
            <Button width="120px" onClick={() => onToggleEdit(link)}>
              <CloseIcon mx="2px" />
            </Button>

            <Button colorScheme="red" onClick={() => onDeleteLink(index)}>
              <DeleteIcon mx="2px" />
            </Button>
            <Button
              colorScheme="green"
              onClick={() => {
                onSaveLink(index);
                onToggleEdit(link);
              }}
            >
              <CheckIcon mx="2px" />
            </Button>
          </HStack>
        </Box>
      );
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div>
        <Droppable droppableId="links">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps}>
              {links.map((link) => {
                return getLink(link);
              })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
        <HStack mt="20px">
          <Input
            type="text"
            name="name"
            placeholder="Link Name"
            value={newLink.name}
            onChange={onChangeNewLink}
          />
          <Input
            type="text"
            name="url"
            placeholder="URL"
            value={newLink.url}
            onChange={onChangeNewLink}
          />
          <Button colorScheme="green" onClick={onAddLink}>
            <AddIcon mx="2px" />
          </Button>
        </HStack>
      </div>
    </DragDropContext>
  );
};

Links.propTypes = {
  editLinks: PropTypes.func.isRequired,
  getUserTrip: PropTypes.func.isRequired,
};

export default connect(null, { editLinks, getUserTrip })(Links);
