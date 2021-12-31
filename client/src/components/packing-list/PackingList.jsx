import React, { useEffect, useState } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import { connect, useDispatch } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styled from 'styled-components';
import Button from 'react-bootstrap/Button';

import Spinner from '../layout/Spinner';
import Category from '../closet/Category';
import { getCurrentCloset, getCurrentUserCategories } from '../../actions/closet';
import {} from '../../actions/types';
import '../closet/Closet.css';

const PackingListContainer = styled.div`margin-top: 32px;`;

const PackingList = ({ getCurrentUserCategories, getCurrentCloset, closet: { loading, closet, categories } }) => {
	const dispatch = useDispatch();

	const [ packingListBeingEdited, setPackingListBeingEdited ] = useState(false);

	useEffect(
		() => {
			getCurrentUserCategories();
			getCurrentCloset(); // Not sure if we need this
		},
		[ getCurrentUserCategories, getCurrentCloset ]
	);

	return loading && (closet === null || categories === null) ? (
		<Spinner />
	) : (
		<PackingListContainer>asdf</PackingListContainer>
	);
};

PackingList.propTypes = {
	getCurrentUserCategories: PropTypes.func.isRequired,
	getCurrentCloset: PropTypes.func.isRequired,
	closet: PropTypes.object.isRequired
};

const mapStateToProps = (state) => ({
	closet: state.closet
});

export default connect(mapStateToProps, {
	getCurrentUserCategories,
	getCurrentCloset
})(PackingList);
