import React, { Fragment, useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowAltCircleLeft } from '@fortawesome/free-solid-svg-icons';
import { useDispatch, connect } from 'react-redux';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import axios from 'axios';
import GPX from 'gpx-parser-builder';
import 'leaflet/dist/leaflet.css';
import { MapContainer, Polyline, TileLayer } from 'react-leaflet';
import Dropdown from 'react-dropdown';
import 'react-dropdown/style.css';

import { DELETE_STEP, EDIT_STEP, EDIT_TRIP } from '../../actions/types';
import { getUserTrip } from '../../actions/trips';
import { getPackingLists } from '../../actions/packingLists';
import Links from './Links';
import TripInfo from './TripInfo';

const TripContainer = styled.div`
  margin-top: 32px;
`;

const Step = styled.div`
  border: solid 1px black;
  border-radius: 8px;
  padding: 8px;
`;

const jawgAccessToken =
  'wFM7G4Sb88GGSS2VLoo2cY2IGkIo8IPkcbwuXgvnzjwJYl9x8qBPUIAP7URH112a';

const Trip = ({
  match,
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
  const reader = new FileReader();
  reader.addEventListener('load', async (e) => {
    const result = e.target.result.split(',')[1];
    await axios.put(
      `/api/trips/${match.params.tripId}/steps/${newFileStepId}`,
      {
        gpxFile: result,
      }
    );
    setNewFileStepId('');
    getUserTrip(match.params.tripId);
  });

  useEffect(() => {
    getUserTrip(match.params.tripId);
    getPackingLists();
  }, [getUserTrip, getPackingLists, match.params.tripId]);

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
      `/api/trips/${match.params.tripId}/steps/${stepId}/gpx`,
      formData,
      config
    );

    getUserTrip(match.params.tripId);
  };

  const onChangeStep = (e, step) => {
    const newStep = { ...step };
    newStep[e.target.name] = e.target.value;
    dispatch({
      type: EDIT_STEP,
      payload: { step: newStep },
    });
  };

  const onSaveStep = async (step) => {
    const newStep = { ...step };
    delete newStep.gpxFile;
    await axios.put(
      `/api/trips/${match.params.tripId}/steps/${step._id}`,
      newStep
    );
  };

  const onAddStep = async () => {
    console.log('addStep for ', match.params.tripId);
    const res = await axios.post(`/api/trips/${match.params.tripId}/steps`, {});
    console.log(res);
    getUserTrip(match.params.tripId);
  };

  const onDeleteStep = async (stepId) => {
    await axios.delete(`/api/trips/${match.params.tripId}/steps/${stepId}`);
    getUserTrip(match.params.tripId);
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
            style={{ height: '400px' }}
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
        <Step key={step._id}>
          <h3>{step.name}</h3>
          <p>Description: {step.description}</p>
          <p>Start Time: {step.startTime}</p>
          <p>End Time: {step.endTime}</p>
          <p>Travel Mode: {step.travelMode}</p>
          {getMapForStep(step._id)}
          <button onClick={(e) => toggleEditStep(step._id)}>Edit</button>
        </Step>
      );
    } else {
      // Editing step
      return (
        <Step key={step._id}>
          <input
            type="text"
            name="name"
            value={step.name}
            onChange={(e) => onChangeStep(e, step)}
            autoComplete="off"
            data-form-type="other"
            placeholder="Step Name"
          />
          <br />
          <input
            type="text"
            name="description"
            value={step.description}
            onChange={(e) => onChangeStep(e, step)}
            autoComplete="off"
            data-form-type="other"
            placeholder="Description"
          />
          <br />
          <input
            type="text"
            name="startTime"
            value={step.startTIme}
            onChange={(e) => onChangeStep(e, step)}
            placeholder="Start Time"
          />
          <input
            type="text"
            name="endTime"
            value={step.endTime}
            onChange={(e) => onChangeStep(e, step)}
            placeholder="End Time"
          />
          <br />
          <input
            type="text"
            name="travelMode"
            value={step.travelMode}
            onChange={(e) => onChangeStep(e, step)}
            placeholder="Travel Mode"
          />
          <br />
          <input
            type="file"
            onChange={(e) => {
              onFileChange(step._id, e);
            }}
            accept=".gpx"
          />
          <button
            onClick={() => {
              onFileUpload(step._id);
              toggleEditStep(step._id);
            }}
          >
            Upload
          </button>
          <button
            onClick={(e) => {
              onSaveStep(step);
              toggleEditStep(step._id);
            }}
          >
            Save
          </button>
          <button onClick={(e) => onDeleteStep(step._id)}>Delete</button>
          <button onClick={(e) => toggleEditStep(step._id)}>Cancel</button>
        </Step>
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
        <FontAwesomeIcon icon={faArrowAltCircleLeft} size="2x" />
      </Link>
      {trip !== null && (
        <div>
          <TripInfo trip={trip} />
          <div>
            <p>
              <b>Links:</b>
            </p>
            <Links links={trip.links} tripId={match.params.tripId} />
          </div>
          <div>
            <p>
              <b>Packing Lists:</b>
            </p>
            {/* Dropdown for selecting Packing List */}
            <Dropdown
              value={getUsersSelectedPackingList()}
              options={packingLists.map((packingList) => ({
                value: packingList._id,
                label: packingList.name,
              }))}
              onChange={onChangePackingList}
              placeholder="Select a Packing List"
            />
            {trip.packingLists.map((packingList) => (
              <Link to={`/packing-lists/${packingList._id}`}>
                {packingList.name}
              </Link>
            ))}
          </div>
          <div>
            {/* Steps */}
            {trip.steps.map((step) => {
              return getStep(step);
            })}
            <button onClick={(e) => onAddStep()}>Add Step</button>

            {JSON.stringify()}
          </div>
        </div>
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
