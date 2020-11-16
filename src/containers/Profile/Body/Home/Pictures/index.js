import React from 'react';
import PropTypes from 'prop-types';
import SectionPanel from 'components/SectionPanel';
import ButtonGroup from 'components/Buttons/ButtonGroup';
import Carousel from 'components/Carousel';
import Frame from './Frame';
import Icon from 'components/Icon';
import { mobileMaxWidth } from 'constants/css';
import { css } from 'emotion';

Pictures.propTypes = {
  numFrames: PropTypes.number,
  pictures: PropTypes.array,
  selectedTheme: PropTypes.string
};

export default function Pictures({ numFrames, pictures, selectedTheme }) {
  return pictures ? (
    <SectionPanel
      button={
        <ButtonGroup
          style={{ marginLeft: 'auto' }}
          buttons={[
            {
              label: (
                <>
                  <Icon icon="plus" />
                  <span style={{ marginLeft: '0.7rem' }}>
                    Add Picture ({numFrames})
                  </span>
                </>
              ),
              onClick: () => console.log('clicked'),
              skeuomorphic: true,
              color: 'darkerGray'
            },
            {
              label: <Icon icon="ellipsis-h" />,
              onClick: () => console.log('clicked too'),
              skeuomorphic: true,
              color: 'darkerGray'
            }
          ]}
        />
      }
      customColorTheme={selectedTheme}
      loaded
      title="Pictures"
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          marginTop: '-1rem'
        }}
      >
        <Carousel
          className={css`
            width: 80%;
            @media (max-width: ${mobileMaxWidth}) {
              width: 100%;
            }
          `}
          allowDrag={false}
          slidesToShow={3}
          slidesToScroll={1}
        >
          {pictures.map((picture, index) => (
            <Frame key={index} picture={picture} />
          ))}
        </Carousel>
      </div>
    </SectionPanel>
  ) : (
    <div>No Pictures</div>
  );
}
