import React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import Paper from '@mui/material/Paper';
import { useDispatch } from 'react-redux';
import axios from 'axios';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 800,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
};

const ShareModal = ({ trip, getUserTrip }) => {
  const { sharedUsers } = trip;
  const [open, setOpen] = React.useState(false);
  const [emailInput, setEmailInput] = React.useState('');

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const onToggleRead = async (email) => {
    const newSharedUsers = [...sharedUsers];
    const sharedUser = sharedUsers.find(
      (sharedUser) => sharedUser.email === email
    );
    const newSharedUser = { ...sharedUser, read: !sharedUser.read };
    const index = sharedUsers.indexOf(sharedUser);
    newSharedUsers.splice(index, 1, newSharedUser);

    await axios.put(`/api/trips/${trip._id}`, { sharedUsers: newSharedUsers });

    getUserTrip(trip._id);
  };

  const onToggleWrite = async (email) => {
    const newSharedUsers = [...sharedUsers];
    const sharedUser = sharedUsers.find(
      (sharedUser) => sharedUser.email === email
    );
    const newSharedUser = { ...sharedUser, write: !sharedUser.write };
    const index = sharedUsers.indexOf(sharedUser);
    newSharedUsers.splice(index, 1, newSharedUser);

    await axios.put(`/api/trips/${trip._id}`, { sharedUsers: newSharedUsers });

    getUserTrip(trip._id);
  };

  const onChangeEmailInput = (e) => {
    setEmailInput(e.target.value);
  };

  const onAddUser = async () => {
    console.log('onAddUser');
    const newSharedUsers = [
      ...sharedUsers,
      { email: emailInput, read: true, write: false },
    ];
    await axios.put(`/api/trips/${trip._id}`, { sharedUsers: newSharedUsers });

    setEmailInput('');
    getUserTrip(trip._id);
  };

  return (
    <div>
      {/* <Button onClick={handleOpen}>Sharing</Button> */}
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Sharing
          </Typography>
          {/* Table for showing currently shared users */}
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 600 }} aria-label="sharing table">
              <TableHead>
                <TableRow>
                  <TableCell>Email</TableCell>
                  <TableCell align="right">Read</TableCell>
                  <TableCell align="right">Write</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {trip &&
                  sharedUsers.map((sharedUser) => (
                    <TableRow
                      key={sharedUser._id}
                      sx={{
                        '&:last-child td, &:last-child th': { padding: 2 },
                      }}
                    >
                      <TableCell>{sharedUser.email}</TableCell>
                      <TableCell
                        padding="checkbox"
                        onClick={() => onToggleRead(sharedUser.email)}
                      >
                        <Checkbox checked={sharedUser.read} />
                      </TableCell>
                      <TableCell
                        padding="checkbox"
                        onClick={() => onToggleWrite(sharedUser.email)}
                      >
                        <Checkbox checked={sharedUser.write} />
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
          <div>
            <TextField
              label="Email"
              id="outlined-start-adornment"
              sx={{ m: 1, width: '25ch' }}
              onChange={onChangeEmailInput}
            />
            {/* <Button onClick={onAddUser}>Add User</Button> */}
          </div>
        </Box>
      </Modal>
    </div>
  );
};

export default ShareModal;
