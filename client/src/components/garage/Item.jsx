import React, { useEffect } from 'react';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import Dropdown from 'react-dropdown';
import { Draggable } from 'react-beautiful-dnd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGripLines, faTrash } from '@fortawesome/free-solid-svg-icons';
import styled from 'styled-components';
import Button from 'react-bootstrap/Button';

import { DELETE_ITEM, EDIT_ITEM } from '../../actions/types';
import './Item.css';

const ItemContainer = styled.div`
  padding-left: 16px;
  background-color: ${(props) =>
    props.isDragging ? 'lightgreen' : 'transparent'};
`;

const Item = ({ item, index }) => {
  const dispatch = useDispatch();
  const { _id, name, description, weight, unit } = item;
  const unitDropdownOptions = ['oz', 'lb', 'g', 'kg'];

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

  const onSelect = (e) => {
    dispatch({
      type: EDIT_ITEM,
      payload: { id: _id, key: 'unit', value: e.value },
    });
  };

  const onDeleteItem = () => {
    dispatch({
      type: DELETE_ITEM,
      payload: { item: item },
    });
    axios.delete(`/api/itemS/${item._id}`);
  };

  return (
    <Draggable draggableId={item._id} index={index}>
      {(provided, snapshot) => (
        <ItemContainer
          className="item-container"
          {...provided.draggableProps}
          ref={provided.innerRef}
          isDragging={snapshot.isDragging}
        >
          <span {...provided.dragHandleProps}>
            <FontAwesomeIcon icon={faGripLines} />
          </span>
          <input
            type="text"
            name="name"
            value={name}
            onChange={(e) => onChange(e)}
            autoComplete="off"
            data-form-type="other"
            placeholder="Item name"
          />
          <input
            type="text"
            name="description"
            value={description}
            onChange={(e) => onChange(e)}
            autoComplete="off"
            data-form-type="other"
            className="description-input"
            placeholder="Description"
          />
          <div className="weight-container">
            <input
              type="number"
              name="weight"
              value={weight}
              onChange={(e) => onChange(e)}
              autoComplete="off"
              data-form-type="other"
              placeholder="Weight"
            />
            <Dropdown
              options={unitDropdownOptions}
              value={unit}
              onChange={onSelect}
            />
          </div>
          <Button variant="danger" onClick={onDeleteItem}>
            <FontAwesomeIcon icon={faTrash} />
          </Button>
          {provided.placeholder}
        </ItemContainer>
      )}
    </Draggable>
  );
};

export default Item;
