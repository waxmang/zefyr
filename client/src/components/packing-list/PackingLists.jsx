import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { connect, useDispatch } from 'react-redux';

import { getPackingLists } from '../../actions/packingLists';

const PackingListsContainer = styled.div``;

const PackingLists = ({ getPackingLists, packingLists: { packingLists } }) => {
  useEffect(() => {
    getPackingLists();
  }, [getPackingLists]);

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
              <button>Delete</button>
            </div>
          ))}
          <button>Add Packing List</button>
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