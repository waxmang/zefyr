import React, { Fragment, useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowAltCircleLeft } from '@fortawesome/free-solid-svg-icons';
import { useDispatch, connect } from 'react-redux';
import styled from 'styled-components';
import {
  Box,
  Input,
  VStack,
  HStack,
  Button,
  Text,
  Textarea,
  Heading,
  StackDivider,
  Link,
} from '@chakra-ui/react';
import { ChevronRightIcon } from '@chakra-ui/icons';
import { Select } from 'chakra-react-select';
import { useParams } from 'react-router-dom';
import PropTypes from 'prop-types';
import axios from 'axios';
import GPX from 'gpx-parser-builder';
import 'leaflet/dist/leaflet.css';
import { MapContainer, Polyline, TileLayer } from 'react-leaflet';
import 'react-dropdown/style.css';

import { DELETE_STEP, EDIT_STEP, EDIT_TRIP } from '../../actions/types';
import { getUserTrip } from '../../actions/trips';
import { getPackingLists } from '../../actions/packingLists';
import Links from './Links';
import TripInfo from './TripInfo';
import ShareModal from './ShareModal';

const TripContainer = styled.div`
  margin-top: 32px;
`;

const Step = styled.div`
  border: solid 1px black;
  border-radius: 8px;
  padding: 8px;
`;

const CustomFontAwesomeIcon = styled(FontAwesomeIcon)`
  margin-bottom: 16px;
`;

const jawgAccessToken =
  'wFM7G4Sb88GGSS2VLoo2cY2IGkIo8IPkcbwuXgvnzjwJYl9x8qBPUIAP7URH112a';

const Trip = ({
  trips: { trip, gpxFiles },
  packingLists: { packingLists },
  auth: { user },
  getUserTrip,
  getPackingLists,
}) => {
  const [filesToUpload, setFilesToUpload] = useState({});
  const [newFileStepId, setNewFileStepId] = useState('');
  const [stepsBeingEdited, setStepsBeingEdited] = useState([]);

  const dispatch = useDispatch();
  const params = useParams();
  const reader = new FileReader();
  reader.addEventListener('load', async (e) => {
    const result = e.target.result.split(',')[1];
    await axios.put(`/api/trips/${params.tripId}/steps/${newFileStepId}`, {
      gpxFile: result,
    });
    setNewFileStepId('');
    getUserTrip(params.tripId);
  });

  useEffect(() => {
    getUserTrip(params.tripId);
    getPackingLists();
  }, [getUserTrip, getPackingLists, params.tripId]);

  const onFileChange = (stepId, e) => {
    setFilesToUpload((prevState) => ({
      ...prevState,
      [stepId]: e.target.files[0],
    }));
    setNewFileStepId(stepId);
  };

  const onFileUpload = async (stepId) => {
    const formData = new FormData();
    formData.append('gpxFile', filesToUpload[stepId]);
    const config = {
      headers: {
        'content-type': 'multipart/form-data',
      },
    };
    axios.put(
      `/api/trips/${params.tripId}/steps/${stepId}/gpx`,
      formData,
      config
    );

    getUserTrip(params.tripId);
  };

  const onChangeStep = (e, step) => {
    const newStep = { ...step };
    newStep[e.target.name] = e.target.value;
    dispatch({
      type: EDIT_STEP,
      payload: { step: newStep },
    });
  };

  const onChangeTravelMode = (e, step) => {};

  const onSaveStep = async (step) => {
    const newStep = { ...step };
    delete newStep.gpxFile;
    await axios.put(`/api/trips/${params.tripId}/steps/${step._id}`, newStep);
  };

  const onAddStep = async () => {
    console.log('addStep for ', params.tripId);
    const res = await axios.post(`/api/trips/${params.tripId}/steps`, {});
    console.log(res);
    getUserTrip(params.tripId);
  };

  const onDeleteStep = async (stepId) => {
    await axios.delete(`/api/trips/${params.tripId}/steps/${stepId}`);
    getUserTrip(params.tripId);
  };

  const toggleEditStep = (stepId) => {
    if (!stepsBeingEdited.includes(stepId)) {
      setStepsBeingEdited((prevState) => [...prevState, stepId]);
    } else {
      const stepsCopy = [...stepsBeingEdited];
      stepsCopy.splice(stepsCopy.indexOf(stepId), 1);
      setStepsBeingEdited(stepsCopy);
    }
  };

  const getMapForStep = (stepId) => {
    if (stepId in gpxFiles) {
      try {
        const gpx = GPX.parse(gpxFiles[stepId]);
        let positions = [];

        if ('rte' in gpx) {
          const route = gpx.rte[0].rtept;
          positions = route.map((p) => [p.$.lat, p.$.lon]);
        } else {
          const track = gpx.trk[0].trkseg[0].trkpt;
          positions = track.map((p) => [p.$.lat, p.$.lon]);
        }

        return (
          <MapContainer
            center={positions[0]}
            zoom={12}
            style={{ height: '400px', width: '600px' }}
          >
            <TileLayer
              url={`https://{s}.tile.jawg.io/jawg-terrain/{z}/{x}/{y}{r}.png?access-token=${jawgAccessToken}`}
            />
            <Polyline
              pathOptions={{ fillColor: 'red', color: 'blue' }}
              positions={[positions]}
            />
          </MapContainer>
        );
      } catch (err) {
        console.error(`GPX file for step ${stepId} could not be parsed.`);
        return <div>Map goes here</div>;
      }
    } else {
      return <p>No map uploaded</p>;
    }
  };

  const getStep = (step) => {
    if (!stepsBeingEdited.includes(step._id)) {
      return (
        <VStack
          minWidth="600px"
          m="24px 0"
          p="24px"
          borderRadius="10px"
          boxShadow="0px 0px 30px 2px rgba(94, 94, 94, 0.22)"
          align="start"
          key={step._id}
        >
          <Heading size="lg">{step.name}</Heading>
          <Box>
            <Text fontWeight="bold">Description</Text>
            <Text whiteSpace="pre">{step.description}</Text>
          </Box>
          <Box>
            <Text fontWeight="bold">Start Time</Text>
            <Text>{step.startTime}</Text>
          </Box>
          <Box>
            <Text fontWeight="bold">End Time</Text>
            <Text>{step.endTime}</Text>
          </Box>
          <Box>
            <Text fontWeight="bold">Travel Mode</Text>
            <Text>{step.travelMode}</Text>
          </Box>
          {getMapForStep(step._id)}
          <Button onClick={(e) => toggleEditStep(step._id)}>Edit</Button>
        </VStack>
      );
    } else {
      // Editing step
      return (
        <VStack
          minWidth="600px"
          m="24px 0"
          p="24px"
          borderRadius="10px"
          boxShadow="0px 0px 30px 2px rgba(94, 94, 94, 0.22)"
          align="start"
          key={step._id}
        >
          <Input
            size="lg"
            fontSize="30px"
            fontWeight="bold"
            type="text"
            name="name"
            value={step.name}
            onChange={(e) => onChangeStep(e, step)}
            autoComplete="off"
            data-form-type="other"
            placeholder="Step Name"
          />
          <Box w="100%">
            <Text fontWeight="bold">Description</Text>
            <Textarea
              minH="150px"
              type="text"
              name="description"
              value={step.description}
              onChange={(e) => onChangeStep(e, step)}
              autoComplete="off"
              data-form-type="other"
              placeholder="Description"
            />
          </Box>
          <Box>
            <Text fontWeight="bold">Start Time</Text>
            <Input
              type="text"
              name="startTime"
              value={step.startTIme}
              onChange={(e) => onChangeStep(e, step)}
              placeholder="Start Time"
            />
          </Box>
          <Box>
            <Text fontWeight="bold">End Time</Text>
            <Input
              type="text"
              name="endTime"
              value={step.endTime}
              onChange={(e) => onChangeStep(e, step)}
              placeholder="End Time"
            />
          </Box>
          <Box>
            <Text fontWeight="bold">Travel Mode</Text>
            <Input
              type="text"
              name="travelMode"
              value={step.travelMode}
              onChange={(e) => onChangeStep(e, step)}
              placeholder="Travel Mode"
            />
          </Box>
          <Box w="300px">
            <Select
              value={step.travelMode}
              options={[
                {
                  label: 'Manual',
                  options: [
                    { value: 'Walk', label: 'Walk' },
                    { value: 'Run', label: 'Run' },
                    { value: 'Hike', label: 'Hike' },
                    { value: 'Bike', label: 'Bike' },
                    { value: 'Swim', label: 'Swim' },
                    { value: 'Climb', label: 'Climb' },
                  ],
                },
                {
                  label: 'Transit',
                  options: [
                    { value: 'Car', label: 'Car' },
                    { value: 'Bus', label: 'Bus' },
                    { value: 'Plane', label: 'Plane' },
                    { value: 'Train', label: 'Train' },
                  ],
                },
              ]}
              onChange={(e) => onChangeTravelMode(e, step)}
              placeholder="Select a Travel Mode"
            />
          </Box>
          <Input
            type="file"
            onChange={(e) => {
              onFileChange(step._id, e);
            }}
            accept=".gpx"
          />
          <Button
            onClick={() => {
              onFileUpload(step._id);
              toggleEditStep(step._id);
            }}
          >
            Upload
          </Button>
          <HStack marginTop="24px !important">
            <Button onClick={(e) => toggleEditStep(step._id)}>Cancel</Button>
            <Button onClick={(e) => onDeleteStep(step._id)}>Delete</Button>
            <Button
              onClick={(e) => {
                onSaveStep(step);
                toggleEditStep(step._id);
              }}
            >
              Save
            </Button>
          </HStack>
        </VStack>
      );
    }
  };

  const getUsersSelectedPackingList = () => {
    const packingList = trip.packingLists.find(
      (packingList) => packingList.user === user._id
    );

    return packingList !== undefined
      ? { value: packingList._id, label: packingList.name }
      : null;
  };

  const onChangePackingList = async (e) => {
    const { value } = e;
    const newPackingLists = [...trip.packingLists];
    if (!value) {
      // Remove user's selected packing list
      const existingPackingList = getUsersSelectedPackingList();
      if (existingPackingList === null) {
        return;
      }

      const index = trip.packingLists.indexOf(
        trip.packingLists.find(
          (packingList) => packingList._id === existingPackingList.value
        )
      );
      newPackingLists.splice(index, 1);
    } else {
      const newPackingList = packingLists.find(
        (packingList) => packingList._id === value
      );
      const existingPackingList = getUsersSelectedPackingList();
      if (existingPackingList === null) {
        // User has not selected a packing list
        newPackingLists.push(newPackingList);
      } else {
        // Replace existing list with new one
        const index = trip.packingLists.indexOf(
          trip.packingLists.find(
            (packingList) => packingList._id === existingPackingList.value
          )
        );
        newPackingLists.splice(index, 1, newPackingList);
      }
    }

    const newTrip = { ...trip, packingLists: newPackingLists };
    await axios.put(`/api/trips/${trip._id}`, {
      packingLists: newPackingLists,
    });
    dispatch({
      type: EDIT_TRIP,
      payload: {
        trip: newTrip,
      },
    });
  };

  return (
    <TripContainer>
      <Link to="/trips">
        <CustomFontAwesomeIcon icon={faArrowAltCircleLeft} size="2x" />
      </Link>
      {trip !== null && (
        <VStack
          align="start"
          spacing="24px"
          // divider={<StackDivider borderColor="gray.200" />}
        >
          <TripInfo trip={trip} />
          <Box>
            <Text fontWeight="bold" mb="10px">
              Links
            </Text>
            <Links links={trip.links} tripId={params.tripId} />
          </Box>
          <Box minW="240px">
            <Text fontWeight="bold" mb="10px">
              Packing Lists
            </Text>
            {/* Dropdown for selecting Packing List */}
            <Select
              value={getUsersSelectedPackingList()}
              options={packingLists.map((packingList) => ({
                value: packingList._id,
                label: packingList.name,
              }))}
              onChange={onChangePackingList}
              placeholder="Select a Packing List"
            />
            <VStack mt="10px" alignItems="start">
              {trip.packingLists.map((packingList) => (
                <Box
                  padding="8px 8px 8px 16px"
                  backgroundColor="#EEEEEE"
                  boxShadow="0px 0px 30px 2px rgba(94, 94, 94, 0.22)"
                  borderRadius="8px"
                  w="100%"
                  key={packingList._id}
                  _hover={{ backgroundColor: '#dd6b20', color: 'white' }}
                >
                  <Link
                    _hover={{ textDecoration: 'none' }}
                    fontWeight="semibold"
                    width="100%"
                    display="inline-block"
                    href={`/packing-lists/${packingList._id}`}
                  >
                    <Box display="inline-block" width="90%">
                      {packingList.name}
                    </Box>{' '}
                    <ChevronRightIcon />
                  </Link>
                </Box>
              ))}
            </VStack>
          </Box>
          <ShareModal trip={trip} getUserTrip={getUserTrip} />
          <div>
            {/* Steps */}
            {trip.steps.map((step) => {
              return getStep(step);
            })}
            <button onClick={(e) => onAddStep()}>Add Step</button>

            {JSON.stringify()}
          </div>
        </VStack>
      )}
    </TripContainer>
  );
};

Trip.propTypes = {
  getUserTrip: PropTypes.func.isRequired,
  getPackingLists: PropTypes.func.isRequired,
  trips: PropTypes.object.isRequired,
  packingLists: PropTypes.object.isRequired,
  auth: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  trips: state.trips,
  packingLists: state.packingLists,
  auth: state.auth,
});

export default connect(mapStateToProps, { getUserTrip, getPackingLists })(Trip);
