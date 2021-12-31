import React, { useState } from 'react';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGripLines } from '@fortawesome/free-solid-svg-icons';
import { connect, useDispatch } from 'react-redux';
import axios from 'axios';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import { EDIT_TRIP_LINKS } from '../../actions/types';
import { getUserTrip, editLinks } from '../../actions/trips';

const LinkContainer = styled.div`
	border: 1px solid lightgrey;
	border-radius: 4px;
	padding: 4px;
	margin: 4px;
`;

const Links = ({ links, tripId, editLinks, getUserTrip }) => {
	const [ newLink, setNewLink ] = useState({ name: '', url: '' });
	const [ linksBeingEdited, setLinksBeingEdited ] = useState([]);

	const onDragEnd = (result) => {
		const { destination, source, draggableId } = result;

		if (!destination) {
			return;
		}

		if (destination.droppableId === source.droppableId && destination.index === source.index) {
			return;
		}

		const newLinks = [ ...links ];
		newLinks.splice(source.index, 1);
		newLinks.splice(destination.index, 0, draggableId);
		editLinks(tripId, newLinks);
	};

	const onChangeNewLink = (e) => {
		setNewLink((prevState) => ({ ...prevState, [e.target.name]: e.target.value }));
	};

	const onAddLink = async () => {
		if (newLink.name === '' || newLink.url === '') {
			return;
		}

		const newLinks = [ ...links, newLink ];
		await axios.put(`/api/trips/${tripId}`, { links: newLinks });

		setNewLink({ name: '', url: '' });
		await getUserTrip(tripId);
	};

	const onDeleteLink = async (index) => {
		const { oldLink } = linksBeingEdited[index];

		const newLinks = [ ...links ];
		newLinks.splice(links.indexOf(oldLink), 1);

		editLinks(tripId, newLinks);
	};

	const onToggleEdit = (link) => {
		const index = linksBeingEdited.findIndex(({ oldLink }) => oldLink._id === link._id);

		if (index !== -1) {
			// Toggle link editing OFF
			setLinksBeingEdited((prevState) => {
				return prevState.splice(index, 1);
			});
		} else {
			setLinksBeingEdited((prevState) => {
				return [ ...prevState, { oldLink: link, newLink: link } ];
			});
		}
	};

	const assurePrefix = (url) => {
		return url.match(/^.{3,5}\:\/\//) ? url : `//${url}`;
	};

	const onChangeLink = (e, index) => {
		setLinksBeingEdited((prevState) => {
			const newState = [ ...prevState ];
			newState[index].newLink[e.target.name] = e.target.value;
			return newState;
		});
	};

	const onSaveLink = async (index) => {
		const { oldLink, newLink } = linksBeingEdited[index];
		const newLinks = [ ...links ];
		newLinks.splice(links.indexOf(oldLink), 1, newLink);

		await editLinks(tripId, newLinks);
	};

	const getLink = (link) => {
		const index = linksBeingEdited.findIndex(({ oldLink }) => oldLink === link);

		if (index === -1) {
			// Not being edited
			return (
				<Draggable key={link._id} draggableId={link._id} index={links.indexOf(link)}>
					{(provided) => (
						<LinkContainer ref={provided.innerRef} {...provided.draggableProps}>
							<span {...provided.dragHandleProps}>
								<FontAwesomeIcon icon={faGripLines} />
							</span>
							<a href={assurePrefix(link.url)} target="_blank">
								{link.name}
							</a>
							<button onClick={() => onToggleEdit(link)}>Edit</button>
						</LinkContainer>
					)}
				</Draggable>
			);
		} else {
			return (
				<LinkContainer key={link}>
					<input
						type="text"
						name="name"
						value={linksBeingEdited[index].newLink.name}
						onChange={(e) => onChangeLink(e, index)}
					/>
					<input
						type="text"
						name="url"
						value={linksBeingEdited[index].newLink.url}
						onChange={(e) => onChangeLink(e, index)}
					/>
					<button onClick={() => onToggleEdit(link)}>Cancel</button>
					<button
						onClick={() => {
							onSaveLink(index);
							onToggleEdit(link);
						}}
					>
						Save
					</button>
					<button onClick={() => onDeleteLink(index)}>Delete</button>
				</LinkContainer>
			);
		}
	};

	return (
		<DragDropContext onDragEnd={onDragEnd}>
			<div>
				<Droppable droppableId="links">
					{(provided) => (
						<div ref={provided.innerRef} {...provided.droppableProps}>
							{links.map((link) => {
								return getLink(link);
							})}
							{provided.placeholder}
						</div>
					)}
				</Droppable>
				<input type="text" name="name" placeholder="Link Name" value={newLink.name} onChange={onChangeNewLink} />
				<input type="text" name="url" placeholder="URL" value={newLink.url} onChange={onChangeNewLink} />
				<button onClick={onAddLink}>Add Link</button>
			</div>
		</DragDropContext>
	);
};

Links.propTypes = {
	editLinks: PropTypes.func.isRequired,
	getUserTrip: PropTypes.func.isRequired
};

export default connect(null, { editLinks, getUserTrip })(Links);
