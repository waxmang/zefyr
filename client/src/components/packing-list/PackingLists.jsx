import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  VStack,
  HStack,
  Button,
  Text,
  Heading,
  Link,
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon } from '@chakra-ui/icons';
import { Outlet } from 'react-router-dom';
import { connect } from 'react-redux';

import { getPackingLists } from '../../actions/packingLists';
import axios from 'axios';

const PackingLists = ({ getPackingLists, packingLists: { packingLists } }) => {
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
    <Box>
      <Heading fontSize="36px">Packing Lists</Heading>
      {packingLists !== null && (
        <VStack mt="20px" align="start" spacing="20px">
          {packingLists.map((packingList) => (
            <Box
              backgroundColor="white"
              borderRadius="16px"
              boxShadow="0px 0px 30px 2px rgba(94, 94, 94, 0.22)"
              w="500px"
              p="10px"
              key={packingList._id}
            >
              <Link
                fontWeight="bold"
                display="inline-block"
                w="90%"
                href={`/packing-lists/${packingList._id}`}
              >
                {packingList.name}
              </Link>
              <Button colorScheme="red" onClick={onDeletePackingList}>
                <DeleteIcon />
              </Button>
            </Box>
          ))}
          <Button colorScheme="green" onClick={onAddPackingList}>
            <HStack>
              <AddIcon />
              <Text>Packing List</Text>
            </HStack>
          </Button>
        </VStack>
      )}
      <Outlet />
    </Box>
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
