import { useEffect, useState } from 'react';

import Card from 'react-bootstrap/Card';
import GrepoBox from './GrepoBox';
import GrepoButton from './GrepoButton';
import styled from 'styled-components';
import GrepoModal from './GrepoModal';

const ToolGrid = styled.div`
	display: flex;
	flex-wrap: wrap;
	flex-direction: row;
	justify-content: center;
	gap: 10px;
	margin-left: 10%;
	margin-right: 10%;
`;

/* 
    color: green | orange | red;
*/
function Tool({ title, version, id, url, description, markdown }) {
    const [open, setOpen] = useState(false);

    const handleClickOpen = (e) => {
        if (e.target.nodeName == 'A') return;
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    return (
        <>
            <StyledCard
                style={{ width: 350, backgroundColor: 'rgb(255 225 161)', cursor: 'pointer' }}
                onClick={handleClickOpen}
            >
                <GrepoBox>
                    <Card.Body>
                        <Card.Title>
                            <BoldTitle>{title}</BoldTitle>
                            <Version>Version {version}</Version>
                        </Card.Title>
                        <Description>{description}</Description>
                    </Card.Body>
                </GrepoBox>
            </StyledCard>
            <GrepoModal open={open} onClose={handleClose}>
                <div dangerouslySetInnerHTML={{ __html: markdown }} />
            </GrepoModal>
        </>
    );
}

const StyledCard = styled(Card)`
    @keyframes shake-rotate {
      0% {
        transform: rotate(0deg);
      }
      25% {
        transform: rotate(5deg);
      }
      50% {
        transform: rotate(0deg);
      }
      75% {
        transform: rotate(-5deg);
      }
      100% {
        transform: rotate(0deg);
      }
    }

    transition: transform 0.1s ease-in-out;

    &:hover {
        transform: rotate(5deg);
        //animation: shake-rotate 0.5s forwards;
    }

    &:hover:active {
        transform: rotate(-5deg);
    }
`
const BoldTitle = styled.h2`
	font-weight: bold;
	color: #000;
	margin: 0;
`;

const Version = styled.h6`
	color: #000;
	font-weight: bold;
`;

const Description = styled.p`
	margin-top: 30px;
	margin-bottom: 30px;
	color: #000;
	font-weight: bold;
	min-height: 72px;
`;

export { Tool, ToolGrid };
