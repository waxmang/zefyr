import axios from 'axios';
import React, { useState, useEffect, Fragment } from 'react';
import { useDispatch } from 'react-redux';
import { EDIT_TRIP } from '../../actions/types';

const TripInfo = ({ trip }) => {
  const dispatch = useDispatch();

  const [tripInfoBeingEdited, setTripInfoBeingEdited] = useState(false);
  const [tripInfoEditHistory, setTripInfoEditHistory] = useState({
    new: {},
    old: {},
  });

  useEffect(() => {
    if (trip !== null) {
      setTripInfoEditHistory({
        new: (({ name, description, startDate, endDate }) => ({
          name,
          description,
          startDate,
          endDate,
        }))(trip),
        old: (({ name, description, startDate, endDate }) => ({
          name,
          description,
          startDate,
          endDate,
        }))(trip),
      });
    }
  }, [trip]);

  const onToggleEditTrip = () => {
    setTripInfoBeingEdited((prevState) => !prevState);
  };

  const onChangeTripInfo = (e) => {
    setTripInfoEditHistory((prevState) => ({
      ...prevState,
      new: {
        ...prevState.new,
        [e.target.name]: e.target.value,
      },
    }));
  };

  const onSaveTripInfo = async () => {
    // Update Redux state with new trip info properties
    await axios.put(`/api/trips/${trip._id}`, tripInfoEditHistory.new);

    const res = await axios.get(`/api/trips/${trip._id}`);
    dispatch({
      type: EDIT_TRIP,
      payload: {
        trip: res.data,
      },
    });
  };

  const getTripInfo = () => {
    if (!tripInfoBeingEdited) {
      return (
        <div>
          <h1>{trip.name}</h1>
          <p>{trip.description}</p>
          <p>{trip.startDate}</p>
          <p>{trip.endDate}</p>
          <button onClick={onToggleEditTrip}>Edit</button>
        </div>
      );
    } else {
      return (
        <div>
          <input
            type="text"
            name="name"
            value={tripInfoEditHistory.new.name}
            onChange={onChangeTripInfo}
            autoComplete="off"
            data-form-type="other"
            placeholder="Trip Name"
          />
          <br />
          <input
            type="text"
            name="description"
            value={tripInfoEditHistory.new.description}
            onChange={onChangeTripInfo}
            autoComplete="off"
            data-form-type="other"
            placeholder="Description"
          />
          <br />
          <input
            type="text"
            name="startDate"
            value={tripInfoEditHistory.new.startDate}
            onChange={onChangeTripInfo}
            autoComplete="off"
            data-form-type="other"
            placeholder="Start Date"
          />
          <br />
          <input
            type="text"
            name="endDate"
            value={tripInfoEditHistory.new.endDate}
            onChange={onChangeTripInfo}
            autoComplete="off"
            data-form-type="other"
            placeholder="End Date"
          />
          <button onClick={onToggleEditTrip}>Cancel</button>
          <button
            onClick={() => {
              onSaveTripInfo();
              onToggleEditTrip();
            }}
          >
            Save
          </button>
        </div>
      );
    }
  };

  return (
    <div>
      {getTripInfo()}
      <button>Share</button>
    </div>
  );
};

export default TripInfo;
