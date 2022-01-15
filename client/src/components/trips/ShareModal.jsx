import React from 'react';
import {
  Box,
  Input,
  VStack,
  HStack,
  Button,
  Text,
  Checkbox,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from '@chakra-ui/react';
import { useDispatch } from 'react-redux';
import axios from 'axios';

// const style = {
//   position: 'absolute',
//   top: '50%',
//   left: '50%',
//   transform: 'translate(-50%, -50%)',
//   width: 800,
//   bgcolor: 'background.paper',
//   boxShadow: 24,
//   p: 4,
// };

const ShareModal = ({ trip, getUserTrip }) => {
  const { sharedUsers } = trip;
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [emailInput, setEmailInput] = React.useState('');

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
    <>
      <Button onClick={onOpen}>Sharing</Button>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent minW="600px">
          <ModalHeader>Sharing</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Table>
              <Thead>
                <Tr>
                  <Th>Email</Th>
                  <Th>Read</Th>
                  <Th>Write</Th>
                </Tr>
              </Thead>
              <Tbody>
                {trip &&
                  sharedUsers.map((sharedUser) => (
                    <Tr key={sharedUser._id}>
                      <Td>{sharedUser.email}</Td>
                      <Td>
                        <Checkbox
                          onChange={() => onToggleRead(sharedUser.email)}
                          isChecked={sharedUser.read}
                        />
                      </Td>
                      <Td>
                        <Checkbox
                          onChange={() => onToggleWrite(sharedUser.email)}
                          isChecked={sharedUser.write}
                        />
                      </Td>
                    </Tr>
                  ))}
              </Tbody>
            </Table>
            <Box>
              <Input
                label="Email"
                sx={{ m: 1, width: '25ch' }}
                onChange={onChangeEmailInput}
              />
              <Button onClick={onAddUser}>Add User</Button>
            </Box>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
          {/* Table for showing currently shared users */}
          {/* <TableContainer component={Paper}>
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
          </TableContainer> */}
        </ModalContent>
      </Modal>
    </>
  );
};

export default ShareModal;
