import React, { Fragment } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { HStack, Text } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import { logout } from '../../actions/auth';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faRoute,
  faWarehouse,
  faSignOutAlt,
  faMap,
  faClipboardList,
  faUserPlus,
  faSignInAlt,
} from '@fortawesome/free-solid-svg-icons';
import styled, { css } from 'styled-components';

const SidebarContainer = styled.div`
  height: 50vh;
  width: 240px;
  min-width: 200px;
  padding: 20px;
  margin: 20px;
  position: fixed;
  z-index: 1;
  top: 0;
  left: 0;
  overflow-x: hidden;
  /* background-color: #8d8741; */
  border-radius: 20px;
  font-weight: bold;
`;

const LinkContainer = styled.div`
  margin-bottom: 10px;
  margin-left: 12px;
`;

const IconContainer = styled.div`
  width: 24px;
  display: inline-block;
`;

const CustomLink = styled(Link)`
  color: #cbcaca;

  &:hover {
    color: #cc5737;
  }

  ${(props) =>
    props.active &&
    css`
      color: var(--link-color);
    `}
`;

const Sidebar = styled.nav``;

const Navbar = ({ auth: { isAuthenticated, loading }, logout }) => {
  const urlPath = useLocation().pathname;

  const authLinks = (
    <ul>
      <li>
        <LinkContainer>
          <CustomLink to="/trips" active={urlPath.startsWith('/trips')}>
            <IconContainer>
              <FontAwesomeIcon icon={faMap} />
            </IconContainer>{' '}
            <span className="hide-sm">Trips</span>
          </CustomLink>
        </LinkContainer>
      </li>
      <li>
        <LinkContainer>
          <CustomLink to="/closet" active={urlPath.startsWith('/closet')}>
            <IconContainer>
              <FontAwesomeIcon icon={faWarehouse} />
            </IconContainer>{' '}
            <span className="hide-sm">Closet</span>
          </CustomLink>
        </LinkContainer>
      </li>
      <li>
        <LinkContainer>
          <CustomLink
            to="/packing-lists"
            active={urlPath.startsWith('/packing-lists')}
          >
            <IconContainer>
              <FontAwesomeIcon icon={faClipboardList} />
            </IconContainer>{' '}
            <span className="hide-sm">Packing Lists</span>
          </CustomLink>
        </LinkContainer>
      </li>
      <li>
        <LinkContainer>
          <CustomLink onClick={logout} to="#!">
            <IconContainer>
              <FontAwesomeIcon icon={faSignOutAlt} />
            </IconContainer>{' '}
            <span className="hide-sm">Logout</span>
          </CustomLink>
        </LinkContainer>
      </li>
    </ul>
  );

  const guestLinks = (
    <ul>
      <li>
        <LinkContainer>
          <CustomLink to="/login" active={urlPath.startsWith('/login')}>
            <IconContainer>
              <FontAwesomeIcon icon={faSignInAlt} />
            </IconContainer>{' '}
            <span className="hide-sm">Sign In</span>
          </CustomLink>
        </LinkContainer>
      </li>
      <li>
        <LinkContainer>
          <CustomLink to="/register" active={urlPath.startsWith('/register')}>
            <IconContainer>
              <FontAwesomeIcon icon={faUserPlus} />
            </IconContainer>{' '}
            <span className="hide-sm">Register</span>
          </CustomLink>
        </LinkContainer>
      </li>
    </ul>
  );

  return (
    <SidebarContainer>
      <Sidebar>
        <Link to="/">
          <HStack mb="24px">
            <FontAwesomeIcon
              icon={faRoute}
              style={{ color: '#318E87' }}
              size="2x"
            />{' '}
            <Text fontSize="3xl">Zefyr</Text>
          </HStack>
        </Link>
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
