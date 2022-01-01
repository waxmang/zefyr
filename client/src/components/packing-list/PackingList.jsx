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
import Paper from '@mui/material/Paper';

import Spinner from '../layout/Spinner';
import Category from '../closet/Category';
import {
  getCurrentCloset,
  getCurrentUserCategories,
} from '../../actions/closet';
import { getPackingList } from '../../actions/packingLists';
import {} from '../../actions/types';
import '../closet/Closet.css';

const PackingListContainer = styled.div`
  margin-top: 32px;
`;

const PackingList = ({
  getCurrentUserCategories,
  getCurrentCloset,
  getPackingList,
  match: {
    params: { packingListId },
  },
  closet: { loading, closet, categories },
  packingLists: { packingList },
}) => {
  const dispatch = useDispatch();

  const [packingListBeingEdited, setPackingListBeingEdited] = useState(false);

  useEffect(() => {
    getCurrentUserCategories();
    getCurrentCloset(); // Not sure if we need this
    getPackingList(packingListId);
  }, [getCurrentUserCategories, getCurrentCloset, getPackingList]);

  return loading && (packingList === null || categories === null) ? (
    <Spinner />
  ) : (
    <PackingListContainer>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-lable="packing-list table">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell align="right">Description</TableCell>
              <TableCell align="right">Category</TableCell>
              <TableCell align="right">Weight (oz)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {packingList.items.map((item) => (
              <TableRow
                key={item._id}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  {item.name}
                </TableCell>
                <TableCell align="right">{item.description}</TableCell>
                <TableCell align="right">{item.category}</TableCell>
                <TableCell align="right">{item.weight}</TableCell>
              </TableRow>
            ))}
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
})(PackingList);
