import React from 'react';
import axios from 'axios';
import { connect, useDispatch } from 'react-redux';
import { Droppable } from 'react-beautiful-dnd';
import styled from 'styled-components';

import Item from './Item';

const Container = styled.div`
  display: flex;
  flex-direction: column;
`;

const ItemsContainer = styled.div`
  background-color: ${(props) =>
    props.isDraggingOver ? 'green' : 'transparent'};
  flex-grow: 1;
  min-height: 20px;
`;

const Items = ({ items, categoryId }) => {
  return (
    <Container>
      <Droppable droppableId={categoryId + '-items'} type="items">
        {(provided, snapshot) => (
          <ItemsContainer
            ref={provided.innerRef}
            isDraggingOver={snapshot.isDraggingOver}
          >
            {items.map((item, index) => {
              return <Item item={item} index={index} key={item._id} />;
            })}
            {provided.placeholder}
          </ItemsContainer>
        )}
      </Droppable>
    </Container>
  );
};

export default Items;
