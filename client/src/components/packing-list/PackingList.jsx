import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Box,
  Input,
  VStack,
  HStack,
  Button,
  Text,
  Checkbox,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import { connect, useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';

import Spinner from '../layout/Spinner';
import {
  getCurrentCloset,
  getCurrentUserCategories,
} from '../../actions/closet';
import {
  getPackingList,
  togglePackingListItem,
  toggleAllPackingListItems,
} from '../../actions/packingLists';
import { EDIT_PACKING_LIST } from '../../actions/types';

const PackingListContainer = styled.div`
  margin-top: 32px;
`;

const PackingList = ({
  getCurrentUserCategories,
  getCurrentCloset,
  getPackingList,
  togglePackingListItem,
  toggleAllPackingListItems,
  closet: { loadingCloset, loadingCategories, closet, categories, allItems },
  packingLists: { loadingPackingList, packingList },
}) => {
  const dispatch = useDispatch();
  const params = useParams();

  const [packingListBeingEdited, setPackingListBeingEdited] = useState(false);
  const [categoriesMap, setCategoriesMap] = useState({});

  useEffect(() => {
    getCurrentUserCategories();
    getCurrentCloset(); // Not sure if we need this
    getPackingList(params.packingListId);
  }, [getCurrentUserCategories, getCurrentCloset, getPackingList]);

  useEffect(() => {
    const newCategoriesMap = {};

    categories.forEach((category) => {
      newCategoriesMap[category._id] = category.name;
    });

    setCategoriesMap(newCategoriesMap);
  }, [categories]);

  const allItemsChecked =
    packingList !== null &&
    allItems !== null &&
    packingList.items.length === allItems.length;
  const isIndeterminate =
    packingList !== null && packingList.items.length !== 0 && !allItemsChecked;

  const onClickEdit = () => {
    if (packingListBeingEdited) {
      // Save packing list
      axios.put(`/api/packing-lists/${params.packingListId}`, packingList);
    }
    setPackingListBeingEdited((prevState) => !prevState);
  };

  const onRowClick = (e, item) => {
    if (!packingListBeingEdited) {
      return;
    }

    // Add/remove the item from the current packing list in redux
    togglePackingListItem(packingList, item);
  };

  const isItemInPackingList = (itemToFind) => {
    if (packingList === null) {
      return false;
    }

    const item = packingList.items.find((item) => item._id === itemToFind._id);
    return item !== undefined;
  };

  const onChangePackingListInfo = (e) => {
    const newPackingList = { ...packingList, [e.target.name]: e.target.value };
    dispatch({
      type: EDIT_PACKING_LIST,
      payload: {
        packingList: newPackingList,
      },
    });
  };

  const getPackingListInfo = () => {
    if (!packingListBeingEdited) {
      return (
        <Box>
          <Heading fontSize="36px">{packingList.name}</Heading>
        </Box>
      );
    } else {
      return (
        <Box>
          <Input
            size="lg"
            fontSize="36px"
            fontWeight="bold"
            type="text"
            name="name"
            value={packingList.name}
            onChange={onChangePackingListInfo}
            autoComplete="off"
            data-form-type="other"
            placeholder="Packing List Name"
          />
        </Box>
      );
    }
  };

  const getCategoryName = (categoryId) => {
    const category = category;
  };

  return (loadingCloset || loadingCategories || loadingPackingList) &&
    (packingList === null ||
      closet === null ||
      categories === null ||
      allItems === null) ? (
    <Spinner />
  ) : (
    <PackingListContainer>
      {getPackingListInfo()}
      <Button mt="15px" onClick={onClickEdit}>
        {packingListBeingEdited ? 'Done' : 'Edit'}
      </Button>

      <Table mt="20px">
        <Thead>
          <Tr>
            {packingListBeingEdited && (
              <Th w="20px">
                <Checkbox
                  isChecked={allItemsChecked}
                  isIndeterminate={isIndeterminate}
                  onChange={() =>
                    toggleAllPackingListItems(
                      packingList,
                      allItems,
                      allItemsChecked
                    )
                  }
                />
              </Th>
            )}
            <Th>Name</Th>
            <Th>Description</Th>
            <Th>Category</Th>
            <Th isNumeric>Weight</Th>
          </Tr>
        </Thead>
        <Tbody>
          {allItems.map((item) => {
            return (
              (packingListBeingEdited ||
                (!packingListBeingEdited && isItemInPackingList(item))) && (
                <Tr key={item._id}>
                  {packingListBeingEdited && (
                    <Td w="20px">
                      <Checkbox
                        onChange={(e) => onRowClick(e, item)}
                        isChecked={isItemInPackingList(item)}
                      />
                    </Td>
                  )}
                  <Td>{item.name}</Td>
                  <Td>{item.description}</Td>
                  <Td>{categoriesMap[item.category]}</Td>
                  <Td isNumeric>{item.weight}</Td>
                </Tr>
              )
            );
          })}
          <Tr></Tr>
        </Tbody>
      </Table>

      {/* <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="packing-list table">
          <TableHead>
            <TableRow>
              {packingListBeingEdited && <Checkbox />}
              <TableCell>Name</TableCell>
              <TableCell align="right">Description</TableCell>
              <TableCell align="right">Category</TableCell>
              <TableCell align="right">Weight (oz)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {allItems.map((item) => {
              return (
                (packingListBeingEdited ||
                  (!packingListBeingEdited && isItemInPackingList(item))) && (
                  <TableRow
                    key={item._id}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    hover
                    role="checkbox"
                    onClick={(e) => onRowClick(e, item)}
                    selected={isItemInPackingList(item)}
                  >
                    {packingListBeingEdited && (
                      <TableCell padding="checkbox">
                        <Checkbox checked={isItemInPackingList(item)} />
                      </TableCell>
                    )}
                    <TableCell component="th" scope="row">
                      {item.name}
                    </TableCell>
                    <TableCell align="right">{item.description}</TableCell>
                    <TableCell align="right">{item.category}</TableCell>
                    <TableCell align="right">{item.weight}</TableCell>
                  </TableRow>
                )
              );
            })}
          </TableBody>
        </Table>
      </TableContainer> */}
    </PackingListContainer>
  );
};

PackingList.propTypes = {
  getCurrentUserCategories: PropTypes.func.isRequired,
  getCurrentCloset: PropTypes.func.isRequired,
  getPackingList: PropTypes.func.isRequired,
  togglePackingListItem: PropTypes.func.isRequired,
  toggleAllPackingListItems: PropTypes.func.isRequired,
  closet: PropTypes.object.isRequired,
  packingLists: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  closet: state.closet,
  packingLists: state.packingLists,
});

export default connect(mapStateToProps, {
  getCurrentUserCategories,
  getCurrentCloset,
  getPackingList,
  togglePackingListItem,
  toggleAllPackingListItems,
})(PackingList);
