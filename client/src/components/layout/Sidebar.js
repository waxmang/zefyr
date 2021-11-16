import React, { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { logout } from '../../actions/auth';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faRoute,
  faWarehouse,
  faSignOutAlt,
  faMap,
} from '@fortawesome/free-solid-svg-icons';
import styled from 'styled-components';

const SidebarContainer = styled.div`
  height: 50vh;
  width: 220px;
  min-width: 200px;
  padding: 20px;
  margin: 20px;
  position: fixed;
  z-index: 1;
  top: 0;
  left: 0;
  overflow-x: hidden;
  background-color: #558b70;
  border-radius: 20px;
`;

const Sidebar = styled.nav``;

const Navbar = ({ auth: { isAuthenticated, loading }, logout }) => {
  const authLinks = (
    <ul>
      <li>
        <Link to="/trips">
          <FontAwesomeIcon icon={faMap} />{' '}
          <span className="hide-sm">Trips</span>
        </Link>
      </li>
      <li>
        <Link to="/closet">
          <FontAwesomeIcon icon={faWarehouse} />{' '}
          <span className="hide-sm">Closet</span>
        </Link>
      </li>
      <li>
        <a onClick={logout} href="#!">
          <FontAwesomeIcon icon={faSignOutAlt} />{' '}
          <span className="hide-sm">Logout</span>
        </a>
      </li>
    </ul>
  );

  const guestLinks = (
    <ul>
      <li>
        <a href="#!">Developers</a>
      </li>
      <li>
        <Link to="/register">Register</Link>
      </li>
      <li>
        <Link to="/login">Login</Link>
      </li>
    </ul>
  );

  return (
    <SidebarContainer>
      <Sidebar>
        <h1>
          <Link to="/">
            <FontAwesomeIcon icon={faRoute} /> Zephyr
          </Link>
        </h1>
        {!loading && (
          <Fragment>{isAuthenticated ? authLinks : guestLinks}</Fragment>
        )}
      </Sidebar>
    </SidebarContainer>
  );
};

Navbar.propTyes = {
  logout: PropTypes.func.isRequired,
  auth: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  auth: state.auth,
});

export default connect(mapStateToProps, { logout })(Navbar);
