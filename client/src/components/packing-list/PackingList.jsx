import React, { useEffect, useState } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import { connect, useDispatch } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styled from 'styled-components';
import Button from 'react-bootstrap/Button';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import Paper from '@mui/material/Paper';

import Spinner from '../layout/Spinner';
import Category from '../closet/Category';
import {
  getCurrentCloset,
  getCurrentUserCategories,
} from '../../actions/closet';
import {
  getPackingList,
  togglePackingListItem,
} from '../../actions/packingLists';
import { EDIT_PACKING_LIST } from '../../actions/types';
import '../closet/Closet.css';

const PackingListContainer = styled.div`
  margin-top: 32px;
`;

const PackingList = ({
  getCurrentUserCategories,
  getCurrentCloset,
  getPackingList,
  togglePackingListItem,
  match: {
    params: { packingListId },
  },
  closet: { loadingCloset, loadingCategories, closet, categories, allItems },
  packingLists: { loadingPackingList, packingList },
}) => {
  const dispatch = useDispatch();

  const [packingListBeingEdited, setPackingListBeingEdited] = useState(false);

  useEffect(() => {
    getCurrentUserCategories();
    getCurrentCloset(); // Not sure if we need this
    getPackingList(packingListId);
  }, [getCurrentUserCategories, getCurrentCloset, getPackingList]);

  const onClickEdit = () => {
    if (packingListBeingEdited) {
      // Save packing list
      axios.put(`/api/packing-lists/${packingListId}`, packingList);
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
        <div>
          <h1>{packingList.name}</h1>
        </div>
      );
    } else {
      return (
        <div>
          <input
            type="text"
            name="name"
            value={packingList.name}
            onChange={onChangePackingListInfo}
            autoComplete="off"
            data-form-type="other"
            placeholder="Packing List Name"
          />
        </div>
      );
    }
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
      <Button onClick={onClickEdit} variant="primary">
        {packingListBeingEdited ? 'Done' : 'Edit'}
      </Button>
      <TableContainer component={Paper}>
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
      </TableContainer>
    </PackingListContainer>
  );
};

PackingList.propTypes = {
  getCurrentUserCategories: PropTypes.func.isRequired,
  getCurrentCloset: PropTypes.func.isRequired,
  getPackingList: PropTypes.func.isRequired,
  togglePackingListItem: PropTypes.func.isRequired,
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
})(PackingList);
