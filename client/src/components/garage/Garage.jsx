import React, { Fragment, useEffect } from 'react';
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
  getCurrentGarage,
  getCurrentUserCategories,
} from '../../actions/garage';
import Items from './Items';
import './Garage.css';
import { EDIT_CATEGORIES, EDIT_CATEGORY } from '../../actions/types';
import Category from './Category';

const CategoriesContainer = styled.div`
  background-color: ${(props) =>
    props.isDraggingOver ? 'skyblue' : 'transparent'};
`;

const Garage = ({
  getCurrentUserCategories,
  getCurrentGarage,
  auth,
  garage: { loading, garage, categories },
}) => {
  const dispatch = useDispatch();

  useEffect(() => {
    getCurrentUserCategories();
    getCurrentGarage();
  }, [getCurrentUserCategories, getCurrentGarage]);

  const onDragEnd = (result) => {
    console.log(result);
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
      axios.put('/api/garage', { categories: newCategoryIds });
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
        axios.put(`/api/category/${destinationCategoryId}`, {
          items: newDestinationItems,
        });
      }

      // Update state and save to database
      const newSourceCategory = { ...sourceCategory, items: newSourceItems };
      dispatch({
        type: EDIT_CATEGORY,
        payload: { category: newSourceCategory },
      });
      axios.put(`/api/category/${sourceCategoryId}`, { items: newSourceItems });
    }
  };

  const onAddCategory = async () => {
    await axios.post('/api/category', { garage: garage._id });
    getCurrentUserCategories();
    getCurrentGarage();
  };

  const onAddItem = async (categoryId) => {
    await axios.post(`/api/items`, { category: categoryId });
    getCurrentUserCategories();
  };

  return loading && (garage === null || categories === null) ? (
    <Spinner />
  ) : (
    <DragDropContext onDragEnd={onDragEnd}>
      <h1 className="large text-primary">Closet</h1>
      <div className="top-garage-controls"></div>

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
      <div className="bottom-garage-controls">
        <Button variant="primary" onClick={onAddCategory}>
          + Add Category
        </Button>
      </div>
    </DragDropContext>
  );
};

Garage.propTypes = {
  getCurrentUserCategories: PropTypes.func.isRequired,
  getCurrentGarage: PropTypes.func.isRequired,
  auth: PropTypes.object.isRequired,
  garage: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  auth: state.auth,
  garage: state.garage,
});

export default connect(mapStateToProps, {
  getCurrentUserCategories,
  getCurrentGarage,
})(Garage);
