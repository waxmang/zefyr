import axios from 'axios';
import React, { useState, useEffect, Fragment } from 'react';
import moment from 'moment';
import { Input, VStack, HStack, Button, Text } from '@chakra-ui/react';
import DatePicker from '../date-picker/DatePicker';
import DateTimePicker from '@mui/lab/DateTimePicker';
import { useDispatch } from 'react-redux';
import styled from 'styled-components';
import { Editor } from '@tinymce/tinymce-react';

import { EDIT_TRIP } from '../../actions/types';

const DateTimePickerContainer = styled.div`
  margin-bottom: 20px !important;
`;

const CustomEditor = styled(Editor)`
  margin-top: 10px !important;
`;

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

  const onChangeEditorContent = (content, editor) => {
    setTripInfoEditHistory((prevState) => ({
      ...prevState,
      new: {
        ...prevState.new,
        description: content,
      },
    }));
  };

  const onChangeStartDate = (newStartDate) => {
    setTripInfoEditHistory((prevState) => ({
      ...prevState,
      new: {
        ...prevState.new,
        startDate: newStartDate,
      },
    }));
  };

  const onChangeEndDate = (newEndDate) => {
    setTripInfoEditHistory((prevState) => ({
      ...prevState,
      new: {
        ...prevState.new,
        endDate: newEndDate,
      },
    }));
  };

  const onSaveTripInfo = async () => {
    // Update Redux state with new trip info properties
    const newTripInfo = {
      ...tripInfoEditHistory.new,
      description: JSON.stringify(tripInfoEditHistory.new.description),
    };
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
    return (
      <div>
        <Input
          label="Name"
          value={tripInfoEditHistory.new.name}
          name="name"
          onChange={onChangeTripInfo}
          autoComplete="off"
          data-form-type="other"
          isReadOnly={!tripInfoBeingEdited}
          size="lg"
          variant={tripInfoBeingEdited ? 'outline' : 'unstyled'}
          mb="20px"
          fontSize={36}
          fontWeight="bold"
          _focus={false}
          backgroundColor={tripInfoBeingEdited ? 'white' : 'none'}
        />
        <br />
        <VStack align="start">
          <Text fontWeight="bold">Description</Text>
          <CustomEditor
            apiKey={process.env.REACT_APP_TINYMCE_KEY}
            init={{ height: 189, menubar: false }}
            value={tripInfoEditHistory.new.description}
            onEditorChange={onChangeEditorContent}
            disabled={!tripInfoBeingEdited}
          />
        </VStack>
        <br />
        <VStack spacing="20px" align="start" mb="20px">
          <VStack align="start">
            <Text fontWeight="bold">Start Time</Text>
            <DatePicker
              selectedDate={moment(tripInfoEditHistory.new.startDate).toDate()}
              onChange={onChangeStartDate}
              readOnly={!tripInfoBeingEdited}
              showTimeSelect
              dateFormat="MM/d/yyyy h:mm aa"
              style={{ backgroundColor: 'white' }}
            />
          </VStack>
          <VStack align="start">
            <Text fontWeight="bold">End Time</Text>
            <DatePicker
              selectedDate={moment(tripInfoEditHistory.new.endDate).toDate()}
              onChange={onChangeEndDate}
              readOnly={!tripInfoBeingEdited}
              showTimeSelect
              dateFormat="MM/d/yyyy h:mm aa"
            />
          </VStack>
        </VStack>
        {tripInfoBeingEdited && (
          <HStack spacing="20px">
            <Button width="80px" onClick={onToggleEditTrip}>
              Cancel
            </Button>
            <Button
              width="80px"
              colorScheme="orange"
              onClick={() => {
                onSaveTripInfo();
                onToggleEditTrip();
              }}
            >
              Save
            </Button>
          </HStack>
        )}
        {!tripInfoBeingEdited && (
          <div>
            <Button
              width="80px"
              colorScheme="orange"
              onClick={onToggleEditTrip}
            >
              Edit
            </Button>
          </div>
        )}
      </div>
    );
  };

  return <div>{getTripInfo()}</div>;
};

export default TripInfo;
