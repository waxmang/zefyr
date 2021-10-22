import React, { useEffect } from 'react';
import styled from 'styled-components';
import { useDispatch } from 'react-redux';
import Button from 'react-bootstrap/Button';

import { EDIT_CATEGORY, DELETE_CATEGORY } from '../../actions/types';
import axios from 'axios';

const Container = styled.div``;

const Category = ({ category }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      axios.put(`/api/category/${category._id}`, category);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [category]);

  const onChange = (e) => {
    const newCategory = { ...category };
    newCategory[e.target.name] = e.target.value;
    dispatch({
      type: EDIT_CATEGORY,
      payload: { category: newCategory },
    });
  };

  const onDelete = (e) => {
    dispatch({
      type: DELETE_CATEGORY,
      payload: { category: category },
    });
    axios.delete(`/api/category/${category._id}`);
  };

  return (
    <Container>
      <input
        type="text"
        name="name"
        value={category.name}
        onChange={(e) => onChange(e)}
        autoComplete="off"
        data-form-type="other"
        placeholder="Category name"
      />
      <Button variant="danger" onClick={onDelete}>
        Delete category
      </Button>
    </Container>
  );
};

export default Category;
