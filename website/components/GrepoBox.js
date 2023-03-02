import styled from 'styled-components';

export default function GrepoBox({ children }) {
	return (
		<>
			<BorderTop />
			<BorderBottom />
			<BorderLeft />
			<BorderRight />
			<Corner
				style={{
					top: -3,
					left: -3,
				}}
			/>
			<Corner
				style={{
					backgroundPosition: '-6px -10px',
					top: -3,
					right: -3,
				}}
			/>
			<Corner
				style={{
					backgroundPosition: '-6px -26px',
					bottom: -3,
					right: -3,
				}}
			/>
			<Corner
				style={{
					backgroundPosition: '0px -36px',
					bottom: -3,
					left: -3,
				}}
			/>
			{children}
		</>
	);
}
const BorderTop = styled.div`
	background: url(https://gpit.innogamescdn.com/images/game/border/border_h.png) repeat-x top
		center;
	top: -3px;
	position: absolute;
	left: 0;
	right: 0;
	height: 4px;
	z-index: 1;
`;

const BorderBottom = styled.div`
	background: url(https://gpit.innogamescdn.com/images/game/border/border_h.png) repeat-x bottom
		center;

	// position
	position: absolute;
	bottom: -3px;
	left: 0;
	right: 0;
	height: 4px;
	z-index: 1;
`;

const BorderLeft = styled.div`
	background: url(https://gpit.innogamescdn.com/images/game/border/border_v.png) repeat-y left
		center;
	// position
	position: absolute;
	left: -3px;
	top: 0;
	bottom: 0;
	width: 4px;
	z-index: 1;
`;

const BorderRight = styled.div`
	background: url(https://gpit.innogamescdn.com/images/game/border/border_v.png) repeat-y right
		center;
	// position
	position: absolute;
	right: -3px;
	top: 0;
	bottom: 0;
	width: 4px;
	z-index: 1;
`;

const Corner = styled.div`
	background: url(https://gpit.innogamescdn.com/images/game/border/edge.png) no-repeat;
	width: 4px;
	height: 4px;
	position: absolute;
`;
