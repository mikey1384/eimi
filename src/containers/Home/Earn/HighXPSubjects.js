import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { panel } from './Styles';
import { useAppContext } from 'contexts';
import Icon from 'components/Icon';
import ContentListItem from 'components/ContentListItem';
import Button from 'components/Button';
import Loading from 'components/Loading';
import localize from 'constants/localize';

const randomHighXPSubjectLabel = localize('randomHighXPSubject');

HighXPSubjects.propTypes = {
  style: PropTypes.object
};

export default function HighXPSubjects({ style }) {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const {
    requestHelpers: { loadHighXPSubjects }
  } = useAppContext();
  useEffect(() => {
    handleLoadHighXPSubjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={style} className={panel}>
      <p>{randomHighXPSubjectLabel}</p>
      <div style={{ marginTop: '1.5rem' }}>
        {loading ? (
          <Loading />
        ) : (
          <>
            {subjects.map((subject) => (
              <ContentListItem key={subject.id} contentObj={subject} />
            ))}
          </>
        )}
        <div
          style={{
            marginTop: '2rem',
            width: '100%',
            display: 'flex',
            justifyContent: 'center'
          }}
        >
          <Button skeuomorphic color="green" onClick={handleLoadHighXPSubjects}>
            <Icon icon="redo" />
            <span style={{ marginLeft: '0.7rem' }}>
              Show me another subject
            </span>
          </Button>
        </div>
      </div>
    </div>
  );

  async function handleLoadHighXPSubjects() {
    setLoading(true);
    const data = await loadHighXPSubjects();
    setSubjects(data);
    setLoading(false);
  }
}
