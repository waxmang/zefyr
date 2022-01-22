import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
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
import { connect } from 'react-redux';
import axios from 'axios';

import { getUserTrips, deleteUserTrip } from '../../actions/trips';

const Trips = ({ getUserTrips, deleteUserTrip, trips: { trips } }) => {
  useEffect(() => {
    getUserTrips();
  }, [getUserTrips]);

  const onAddTrip = async () => {
    await axios.post('/api/trips', { name: 'New Trip' });
    getUserTrips();
  };

  const onDeleteTrip = async (tripId) => {
    await deleteUserTrip(tripId);
  };

  return (
    <Box>
      <Heading fontSize="36px">Trips</Heading>
      {trips !== null && (
        // Trips section
        <VStack mt="20px" align="start" spacing="20px">
          {trips.map((trip) => (
            // Single Trip
            <Box
              backgroundColor="white"
              borderRadius="16px"
              boxShadow="0px 0px 30px 2px rgba(94, 94, 94, 0.22)"
              w="500px"
              p="10px"
              key={trip._id}
            >
              <Link
                fontWeight="bold"
                display="inline-block"
                w="90%"
                href={`/trips/${trip._id}`}
              >
                {trip.name}
              </Link>
              <Button colorScheme="red" onClick={onDeleteTrip}>
                <DeleteIcon />
              </Button>
            </Box>
          ))}
          <Button colorScheme="green" onClick={onAddTrip}>
            <HStack>
              <AddIcon />
              <Text>Trip</Text>
            </HStack>
          </Button>
        </VStack>
      )}
      <Outlet />
    </Box>
  );
};

Trips.propTypes = {
  getUserTrips: PropTypes.func.isRequired,
  deleteUserTrip: PropTypes.func.isRequired,
  trips: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  trips: state.trips,
});

export default connect(mapStateToProps, { getUserTrips, deleteUserTrip })(
  Trips
);
