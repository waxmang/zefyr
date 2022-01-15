import React, { useEffect } from 'react';
import axios from 'axios';
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
import { DragHandleIcon, DeleteIcon } from '@chakra-ui/icons';
import { Select } from 'chakra-react-select';
import { useDispatch } from 'react-redux';
import Dropdown from 'react-dropdown';
import { Draggable } from 'react-beautiful-dnd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGripLines, faTrash } from '@fortawesome/free-solid-svg-icons';

import { DELETE_ITEM, EDIT_ITEM } from '../../actions/types';

const Item = ({ item, index }) => {
  const dispatch = useDispatch();
  const { _id, name, description, weight, unit } = item;

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      axios.put(`/api/items/${item._id}`, item);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [item]);

  const onChange = (e) => {
    const newItem = { ...item };
    newItem[e.target.name] = e.target.value;
    dispatch({
      type: EDIT_ITEM,
      payload: { item: newItem },
    });
  };

  const onSelectUnit = (e) => {
    const newItem = { ...item };
    newItem.unit = e.value;
    dispatch({
      type: EDIT_ITEM,
      payload: { item: newItem },
    });
  };

  const onDeleteItem = () => {
    dispatch({
      type: DELETE_ITEM,
      payload: { item: item },
    });
    axios.delete(`/api/items/${item._id}`);
  };

  return (
    <Draggable draggableId={item._id} index={index}>
      {(provided, snapshot) => (
        <HStack
          p="4px"
          backgroundColor="white"
          borderRadius="8px"
          {...provided.draggableProps}
          ref={provided.innerRef}
        >
          <Box mb="2px" {...provided.dragHandleProps}>
            <DragHandleIcon />
          </Box>
          <Input
            flex="1"
            type="text"
            name="name"
            value={name}
            onChange={(e) => onChange(e)}
            autoComplete="off"
            data-form-type="other"
            placeholder="Item name"
          />
          <Input
            w="auto"
            type="text"
            name="description"
            value={description}
            onChange={(e) => onChange(e)}
            autoComplete="off"
            data-form-type="other"
            className="description-input"
            placeholder="Description"
          />
          <HStack ml="30px">
            <Input
              maxW="100px"
              type="number"
              name="weight"
              value={weight}
              onChange={(e) => onChange(e)}
              autoComplete="off"
              data-form-type="other"
              placeholder="Weight"
            />
            <Box w="120px">
              <Select
                value={{ value: unit, label: unit }}
                options={[
                  { value: 'oz', label: 'oz' },
                  { value: 'lb', label: 'lb' },
                  { value: 'g', label: 'g' },
                  { value: 'kg', label: 'kg' },
                ]}
                onChange={onSelectUnit}
                placeholder="unit"
              />
            </Box>
          </HStack>
          <Button colorScheme="red" onClick={onDeleteItem}>
            <DeleteIcon />
          </Button>
          {provided.placeholder}
        </HStack>
      )}
    </Draggable>
  );
};

export default Item;
