import React, { Fragment, useState } from 'react';
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
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { login } from '../../actions/auth';

const Login = ({ login, isAuthenticated }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const { email, password } = formData;

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

  const onSubmit = async (e) => {
    e.preventDefault();

    login({ email, password });
  };

  // Redirect if logged in
  if (isAuthenticated) {
    return <Navigate replace to="/trips" />;
  }

  return (
    <Fragment>
      <Heading mb="20px" fontSize="36px">
        Sign In
      </Heading>
      <Formik
        initialValues={formData}
        onSubmit={async (values, actions) => {
          await login({ email, password });
          actions.setSubmitting(false);
        }}
        validate={() => ({})}
      >
        {(props) => (
          <Form style={{ width: '400px' }}>
            <VStack align="start">
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
                  } else if (password.length < 8) {
                    return 'Password must be at least 8 characters long';
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
            </VStack>
            <Button isLoading={props.isSubmitting} mt="20px" type="submit">
              Sign In
            </Button>
          </Form>
        )}
      </Formik>
      <Text mt="15px">
        Don't have an account? <Link href="/register">Register</Link>
      </Text>
    </Fragment>
  );
};

Login.propTypes = {
  login: PropTypes.func.isRequired,
  isAuthenticated: PropTypes.bool,
};

const mapStateToProps = (state) => ({
  isAuthenticated: state.auth.isAuthenticated,
});

export default connect(mapStateToProps, { login })(Login);
