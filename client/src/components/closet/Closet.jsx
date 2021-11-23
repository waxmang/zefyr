import React, { useEffect } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import { connect, useDispatch } from 'react-redux';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGripLines } from '@fortawesome/free-solid-svg-icons';
import styled from 'styled-components';
import Button from 'react-bootstrap/Button';

import Spinner from '../layout/Spinner';
import {
  getCurrentCloset,
  getCurrentUserCategories,
} from '../../actions/closet';
import Items from './Items';
import './Closet.css';
import { EDIT_CATEGORIES, EDIT_CATEGORY } from '../../actions/types';
import Category from './Category';

const CategoriesContainer = styled.div`
  background-color: ${(props) =>
    props.isDraggingOver ? 'skyblue' : 'transparent'};
`;

const Closet = ({
  getCurrentUserCategories,
  getCurrentCloset,
  auth,
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
      console.log('goodbye');
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
      <h1 className="large text-primary">Closet</h1>
      <div className="top-closet-controls"></div>

      {/* Droppable container for all the categories */}
      {categories !== null && (
        <div className="items-container">
          <Droppable droppableId="droppable" type="categories">
            {(provided, snapshot) => (
              <CategoriesContainer
                ref={provided.innerRef}
                {...provided.droppableProps}
                isDraggingOver={snapshot.isDraggingOver}
              >
                {categories.map((category, index) => (
                  <Draggable
                    key={category._id}
                    draggableId={category._id}
                    index={index}
                  >
                    {(provided, snapshot) => (
                      <div
                        className="category"
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                      >
                        <span {...provided.dragHandleProps}>
                          <FontAwesomeIcon icon={faGripLines} />
                        </span>
                        <Category category={category} />
                        <Items
                          items={category.items}
                          categoryId={category._id}
                        />
                        <Button
                          variant="primary"
                          onClick={() => {
                            onAddItem(category._id);
                          }}
                        >
                          + Add Item
                        </Button>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </CategoriesContainer>
            )}
          </Droppable>
        </div>
      )}
      <div className="bottom-closet-controls">
        <Button variant="primary" onClick={onAddCategory}>
          + Add Category
        </Button>
      </div>
    </DragDropContext>
  );
};

Closet.propTypes = {
  getCurrentUserCategories: PropTypes.func.isRequired,
  getCurrentCloset: PropTypes.func.isRequired,
  auth: PropTypes.object.isRequired,
  closet: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  auth: state.auth,
  closet: state.closet,
});

export default connect(mapStateToProps, {
  getCurrentUserCategories,
  getCurrentCloset,
})(Closet);
