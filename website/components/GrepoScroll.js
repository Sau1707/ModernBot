import styled from 'styled-components';

export default function GrepoScroll({ }) {
    return (
        <div
            style={{
                position: 'relative',
                maxWidth: 800,
                minWidth: 415,
                margin: 'auto',
                height: 100,
            }}
        >
            <ScrollLeft />
            <ScrollRight />
            <ScrollMiddle>
                <ScrollTitle> ModernBot </ScrollTitle>
                <ScrollDescription>
                    a New modern bot for grepolis
                </ScrollDescription>
            </ScrollMiddle>
        </div>
    );
}

const ScrollLeft = styled.div`
	background-image: url(https://gpit.innogamescdn.com/images/game/scroll/large/scroll_left.png);
	width: 85px;
	height: 122px;
	left: 0;
	position: absolute;
`;

const ScrollRight = styled.div`
	background-image: url(https://gpit.innogamescdn.com/images/game/scroll/large/scroll_right.png);
	width: 85px;
	height: 122px;
	right: 0;
	position: absolute;
`;

const ScrollMiddle = styled.div`
	text-align: center;
	background-image: url(https://gpit.innogamescdn.com/images/game/scroll/large/scroll_middle.png);
	width: 197px;
	height: 122px;
	background-repeat: repeat-x;
	left: 85px;
	right: 85px;
	width: auto;
	position: absolute;
	padding: 20px;
	color: black;
`;

const ScrollTitle = styled.h2`
	border: 0;
	margin: 0;
	font-weight: bold;
`;

const ScrollDescription = styled.h5`
	border: 0;
	margin: 0;
	@media screen and (max-width: 1245px) {
		border: 0;
		margin: 0;
		font-size: 16px;
	}
`;
