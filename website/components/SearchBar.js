import styled from 'styled-components';
import { FcInfo } from 'react-icons/fc';

/* TODO: make it functional */
export default function SearchBar({ setFilter, filter }) {
	return (
		<InputBox>
			<StyledInput type='text' placeholder='Search' />
			<InfoBox>
				<FcInfo size={46} />
			</InfoBox>
		</InputBox>
	);
}

const InfoBox = styled.div`
	cursor: pointer;
	border-radius: 100%;
`;

const InputBox = styled.div`
	margin: auto;
	position: relative;
	display: flex;
	justify-content: center;
	max-width: 800px;
	gap: 10px;
`;

const StyledInput = styled.input`
	background-color: #d0e0e3;
	width: 80%;
	border: 1px solid purple;
	height: 45px;
	border-radius: 25px;
	padding: 20px;
	outline: none;

	font-size: 26px;
	font-weight: bold;
`;
