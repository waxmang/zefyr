import React, { useEffect } from 'react';
import { Box, VStack, HStack, Button, Text, Input } from '@chakra-ui/react';
import { DeleteIcon } from '@chakra-ui/icons';
import styled from 'styled-components';
import { useDispatch } from 'react-redux';

import { EDIT_CATEGORY, DELETE_CATEGORY } from '../../actions/types';
import axios from 'axios';

const Container = styled.div``;

const Category = ({ category }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      axios.put(`/api/categories/${category._id}`, category);
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
    axios.delete(`/api/categories/${category._id}`);
  };

  return (
    <HStack>
      <Input
        type="text"
        name="name"
        value={category.name}
        onChange={(e) => onChange(e)}
        autoComplete="off"
        data-form-type="other"
        placeholder="Category name"
      />
      <Button colorScheme="red" onClick={onDelete}>
        <DeleteIcon />
      </Button>
    </HStack>
  );
};

export default Category;
