import React, { useEffect } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import { Box, HStack, Button, Text, Heading } from '@chakra-ui/react';
import { AddIcon, DragHandleIcon } from '@chakra-ui/icons';
import { connect, useDispatch } from 'react-redux';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

import Spinner from '../layout/Spinner';
import Items from '../closet/Items';
import Category from '../closet/Category';
import {
  getCurrentCloset,
  getCurrentUserCategories,
} from '../../actions/closet';
import { EDIT_CATEGORIES, EDIT_CATEGORY } from '../../actions/types';

const Closet = ({
  getCurrentUserCategories,
  getCurrentCloset,
  closet: { loading, closet, categories },
}) => {
  const dispatch = useDispatch();

  useEffect(() => {
    getCurrentUserCategories();
    getCurrentCloset();
  }, [getCurrentUserCategories, getCurrentCloset]);

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

    if (result.type === 'categories') {
      const category = categories.filter(
        (category) => category._id === draggableId
      )[0];
      const newCategories = [...categories];
      newCategories.splice(source.index, 1);
      newCategories.splice(destination.index, 0, category);

      const newCategoryIds = newCategories.map((category) => category._id);

      // Update state and save to database
      dispatch({
        type: EDIT_CATEGORIES,
        payload: { categories: newCategories },
      });
      axios.put('/api/closet', { categories: newCategoryIds });
    } else if (result.type === 'items') {
      const sourceCategoryId = result.source.droppableId.split('-')[0];
      const sourceCategory = categories.find(
        (category) => category._id === sourceCategoryId
      );
      const destinationCategoryId = result.destination.droppableId.split(
        '-'
      )[0];
      const destinationCategory = categories.find(
        (category) => category._id === destinationCategoryId
      );

      const newSourceItems = [...sourceCategory.items];
      const item = newSourceItems.find(
        (item) => item._id === result.draggableId
      );
      item.category = destinationCategoryId;
      newSourceItems.splice(source.index, 1);

      if (result.source.droppableId === result.destination.droppableId) {
        newSourceItems.splice(destination.index, 0, item);
      } else {
        const newDestinationItems = [...destinationCategory.items];
        newDestinationItems.splice(destination.index, 0, item);

        const newDestinationCategory = {
          ...destinationCategory,
          items: newDestinationItems,
        };
        dispatch({
          type: EDIT_CATEGORY,
          payload: {
            category: newDestinationCategory,
          },
        });
        axios.put(`/api/categories/${destinationCategoryId}`, {
          items: newDestinationItems,
        });
      }

      // Update state and save to database
      const newSourceCategory = { ...sourceCategory, items: newSourceItems };
      dispatch({
        type: EDIT_CATEGORY,
        payload: { category: newSourceCategory },
      });
      axios.put(`/api/categories/${sourceCategoryId}`, {
        items: newSourceItems,
      });
    }
  };

  const onAddCategory = async () => {
    await axios.post('/api/categories', { closet: closet._id });
    getCurrentUserCategories();
    getCurrentCloset();
  };

  const onAddItem = async (categoryId) => {
    await axios.post(`/api/items`, { category: categoryId });
    getCurrentUserCategories();
  };

  return loading && (closet === null || categories === null) ? (
    <Spinner />
  ) : (
    <DragDropContext onDragEnd={onDragEnd}>
      <Heading fontSize="36px">Closet</Heading>

      {/* Droppable container for all the categories */}
      {categories !== null && (
        <Box
          backgroundColor="white"
          borderRadius="16px"
          boxShadow="0px 0px 30px 2px rgba(94, 94, 94, 0.22)"
          height="75vh"
          padding="20px"
          mt="20px"
          overflow="scroll"
          className="items-container"
        >
          <Droppable droppableId="droppable" type="categories">
            {(provided, snapshot) => (
              <Box ref={provided.innerRef} {...provided.droppableProps}>
                {categories.map((category, index) => (
                  <Draggable
                    key={category._id}
                    draggableId={category._id}
                    index={index}
                  >
                    {(provided, snapshot) => (
                      <Box
                        mb="30px"
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                      >
                        <HStack>
                          <Box mb="2px" {...provided.dragHandleProps}>
                            <DragHandleIcon />
                          </Box>
                          <Category category={category} />
                        </HStack>
                        <Items
                          items={category.items}
                          categoryId={category._id}
                        />
                        <Button
                          colorScheme="green"
                          onClick={() => {
                            onAddItem(category._id);
                          }}
                        >
                          <HStack>
                            <AddIcon />
                            <Text>Item</Text>
                          </HStack>
                        </Button>
                      </Box>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </Box>
            )}
          </Droppable>
        </Box>
      )}
      <Box mt="20px">
        <Button colorScheme="green" onClick={onAddCategory}>
          <HStack>
            <AddIcon />
            <Text>Category</Text>
          </HStack>
        </Button>
      </Box>
    </DragDropContext>
  );
};

Closet.propTypes = {
  getCurrentUserCategories: PropTypes.func.isRequired,
  getCurrentCloset: PropTypes.func.isRequired,
  closet: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  closet: state.closet,
});

export default connect(mapStateToProps, {
  getCurrentUserCategories,
  getCurrentCloset,
})(Closet);
