import React, { Fragment, useState } from 'react';
import { connect } from 'react-redux';
import {
  Box,
  VStack,
  HStack,
  Button,
  Input,
  Text,
  Heading,
  Link,
  FormControl,
  FormLabel,
  FormErrorMessage,
  FormHelperText,
} from '@chakra-ui/react';
import { Formik, Form, Field } from 'formik';
import { Navigate } from 'react-router-dom';
import { setAlert } from '../../actions/alert';
import { register } from '../../actions/auth';
import PropTypes from 'prop-types';

const Register = ({ setAlert, register, isAuthenticated }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password2: '',
  });

  const { name, email, password, password2 } = formData;

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const validateEmail = () => {
    if (!email) {
      return 'Required';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)) {
      return 'Invalid email address';
    }
    return null;
  };

  // Redirect if registration successful
  if (isAuthenticated) {
    return <Navigate replace to="/trips" />;
  }

  return (
    <Box>
      <Heading mb="20px" fontSize="36px">
        Register
      </Heading>
      <Formik
        initialValues={formData}
        onSubmit={async (values, actions) => {
          await register({ name, email, password });
          actions.setSubmitting(false);
        }}
        validate={() => ({})}
      >
        {(props) => (
          <Form style={{ width: '400px' }}>
            <VStack align="start">
              <Field
                name="name"
                validate={() => {
                  if (!name) {
                    return 'Required';
                  }
                  return null;
                }}
              >
                {({ field, form }) => (
                  <FormControl
                    isInvalid={form.errors.name && form.touched.name}
                  >
                    <FormLabel htmlFor="name">Name</FormLabel>
                    <Input
                      backgroundColor="white"
                      {...field}
                      value={name}
                      onChange={(e) => onChange(e)}
                      id="name"
                      placeholder="Name"
                    />
                    <FormErrorMessage>{form.errors.name}</FormErrorMessage>
                  </FormControl>
                )}
              </Field>
              <Field name="email" validate={validateEmail}>
                {({ field, form }) => (
                  <FormControl
                    isInvalid={form.errors.email && form.touched.email}
                  >
                    <FormLabel htmlFor="email">Email</FormLabel>
                    <Input
                      backgroundColor="white"
                      {...field}
                      value={email}
                      onChange={(e) => onChange(e)}
                      id="email"
                      placeholder="Email"
                    />
                    <FormErrorMessage>{form.errors.email}</FormErrorMessage>
                  </FormControl>
                )}
              </Field>
              <Field
                name="password"
                validate={() => {
                  if (!password) {
                    return 'Required';
                  } else {
                    return null;
                  }
                }}
              >
                {({ field, form }) => (
                  <FormControl
                    isInvalid={form.errors.password && form.touched.password}
                  >
                    <FormLabel htmlFor="password">Password</FormLabel>
                    <Input
                      backgroundColor="white"
                      type="password"
                      {...field}
                      value={password}
                      onChange={(e) => onChange(e)}
                      id="password"
                      placeholder="Password"
                    />
                    <FormErrorMessage>{form.errors.password}</FormErrorMessage>
                  </FormControl>
                )}
              </Field>
              <Field
                name="password2"
                validate={() => {
                  if (password !== password2) {
                    return 'Passwords do not match';
                  } else {
                    return null;
                  }
                }}
              >
                {({ field, form }) => (
                  <FormControl
                    isInvalid={form.errors.password2 && form.touched.password2}
                  >
                    <FormLabel htmlFor="password2">Confirm Password</FormLabel>
                    <Input
                      backgroundColor="white"
                      type="password"
                      {...field}
                      value={password2}
                      onChange={(e) => onChange(e)}
                      id="password2"
                      placeholder="Confirm Password"
                    />
                    <FormErrorMessage>{form.errors.password2}</FormErrorMessage>
                  </FormControl>
                )}
              </Field>
            </VStack>
            <Button isLoading={props.isSubmitting} mt="20px" type="submit">
              Register
            </Button>
          </Form>
        )}
      </Formik>
      <Text mt="15px">
        Already have an account? <Link href="/login">Sign In</Link>
      </Text>
    </Box>
  );
};

Register.propTypes = {
  setAlert: PropTypes.func.isRequired,
  register: PropTypes.func.isRequired,
  isAuthenticated: PropTypes.bool,
};

const mapStateToProps = (state) => ({
  isAuthenticated: state.auth.isAuthenticated,
});

export default connect(mapStateToProps, { setAlert, register })(Register);
