import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { connect, useDispatch } from 'react-redux';

import { getUserTrips } from '../../actions/trips';

const TripsContainer = styled.div``;

const Trips = ({ getUserTrips, trips: { trips } }) => {
	useEffect(
		() => {
			getUserTrips();
		},
		[ getUserTrips ]
	);

	return (
		<TripsContainer>
			<h1>Trips</h1>
			{trips !== null && (
				// Trips section
				<div>
					{trips.map((trip) => (
						// Single Trip
						<div key={trip._id}>
							<Link to={`/trips/${trip._id}`}>{trip.name}</Link>
							<button>Delete</button>
						</div>
					))}
					<button>Add Trip</button>
				</div>
			)}
		</TripsContainer>
	);
};

Trips.propTypes = {
	getUserTrips: PropTypes.func.isRequired,
	trips: PropTypes.object.isRequired
};

const mapStateToProps = (state) => ({
	trips: state.trips
});

export default connect(mapStateToProps, { getUserTrips })(Trips);
