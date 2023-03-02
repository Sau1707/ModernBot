import styled from 'styled-components';

export default function GrepoHr() {
	return (
		<DividerBox>
			<Divider>
				<Ornament />
			</Divider>
		</DividerBox>
	);
}

const DividerBox = styled.div`
	position: relative;
	margin-bottom: 40px;
`;

const Divider = styled.div`
	margin: 0 auto;
	max-width: 2000px;
	height: 24px;
	background: url(//gpit-glps.innogamescdn.com/media/grepo/images/divider-grepo-section-divider.7629cc48.png)
		repeat-x top;
	position: absolute;
	left: 0;
	right: 0;
	bottom: -12px;
	z-index: 2;
`;

const Ornament = styled.div`
	position: relative;
	background: url(//gpit-glps.innogamescdn.com/media/grepo/images/contentbox-grepo-light-edges.4a1371c7.png)
		no-repeat;
	width: 44px;
	height: 48px;
	background-position: -158px -62px;
	margin: 0 0 0 -22px;
	left: 50%;
	top: -8px;
	z-index: 2;
`;
