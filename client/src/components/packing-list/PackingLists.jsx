import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { connect, useDispatch } from 'react-redux';

import { getPackingLists } from '../../actions/packingLists';
import { EDIT_PACKING_LIST } from '../../actions/types';
import axios from 'axios';

const PackingListsContainer = styled.div``;

const PackingLists = ({ getPackingLists, packingLists: { packingLists } }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    getPackingLists();
  }, [getPackingLists]);

  const onDeletePackingList = async (packingListId) => {
    await axios.delete(`/api/packing-lists/${packingListId}`);

    getPackingLists();
  };

  const onAddPackingList = async () => {
    const newPackingList = { name: 'New Packing List' };
    await axios.post('/api/packing-lists', newPackingList);

    getPackingLists();
  };

  return (
    <PackingListsContainer>
      <h1>Packing Lists</h1>
      {packingLists !== null && (
        // Trips section
        <div>
          {packingLists.map((packingList) => (
            // Single Trip
            <div key={packingList._id}>
              <Link to={`/packing-lists/${packingList._id}`}>
                {packingList.name}
              </Link>
              <button onClick={() => onDeletePackingList(packingList._id)}>
                Delete
              </button>
            </div>
          ))}
          <button onClick={onAddPackingList}>Add Packing List</button>
        </div>
      )}
    </PackingListsContainer>
  );
};

PackingLists.propTypes = {
  getPackingLists: PropTypes.func.isRequired,
  packingLists: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  packingLists: state.packingLists,
});

export default connect(mapStateToProps, { getPackingLists })(PackingLists);
