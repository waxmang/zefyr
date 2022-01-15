import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Button,
  Input,
  Text,
  Heading,
  Link,
} from '@chakra-ui/react';
import { Droppable } from 'react-beautiful-dnd';

import Item from './Item';

const Items = ({ items, categoryId }) => {
  return (
    <Box m="10px 0 10px 25px">
      <Droppable droppableId={categoryId + '-items'} type="items">
        {(provided, snapshot) => (
          <Box ref={provided.innerRef}>
            {items.map((item, index) => {
              return <Item item={item} index={index} key={item._id} />;
            })}
            {provided.placeholder}
          </Box>
        )}
      </Droppable>
    </Box>
  );
};

export default Items;
