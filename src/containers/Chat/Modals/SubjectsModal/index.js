import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import Modal from 'components/Modal';
import Button from 'components/Button';
import LoadMoreButton from 'components/Buttons/LoadMoreButton';
import SubjectItem from './SubjectItem';
import Loading from 'components/Loading';
import ConfirmModal from 'components/Modals/ConfirmModal';
import { Color } from 'constants/css';
import { useAppContext } from 'contexts';

SubjectsModal.propTypes = {
  channelId: PropTypes.number.isRequired,
  currentSubjectId: PropTypes.number,
  onHide: PropTypes.func,
  selectSubject: PropTypes.func,
  userIsOwner: PropTypes.bool
};

export default function SubjectsModal({
  channelId,
  currentSubjectId,
  onHide,
  selectSubject,
  userIsOwner
}) {
  const {
    requestHelpers: {
      deleteChatSubject,
      loadChatSubjects,
      loadMoreChatSubjects
    }
  } = useAppContext();
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [mySubjects, setMySubjects] = useState({
    subjects: [],
    loadMoreButton: false,
    loading: false
  });
  const [allSubjects, setAllSubjects] = useState({
    subjects: [],
    loadMoreButton: false,
    loading: false
  });
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    handleLoadSubjects();
    async function handleLoadSubjects() {
      try {
        const { mySubjects, allSubjects } = await loadChatSubjects({
          channelId
        });
        if (mounted.current) {
          setMySubjects(mySubjects);
          setAllSubjects(allSubjects);
          setLoaded(true);
        }
      } catch (error) {
        console.error(error.response || error);
      }
    }
    return function cleanUp() {
      mounted.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Modal onHide={onHide}>
      <header>View Subjects</header>
      <main>
        {!loaded && <Loading />}
        {mySubjects.subjects.length > 0 && (
          <div style={{ width: '100%' }}>
            <h3
              style={{
                color: Color.green(),
                marginBottom: '1rem'
              }}
            >
              My Subjects
            </h3>
            {mySubjects.subjects.map((subject) => (
              <SubjectItem
                key={subject.id}
                currentSubjectId={currentSubjectId}
                onDeleteSubject={() => setDeleteTarget(subject.id)}
                onSelectSubject={() => selectSubject(subject.id)}
                {...subject}
              />
            ))}
            {mySubjects.loadMoreButton && (
              <LoadMoreButton
                filled
                color="lightBlue"
                loading={mySubjects.loading}
                onClick={() => handleLoadMoreSubjects(true)}
              />
            )}
          </div>
        )}
        {loaded && allSubjects.subjects.length > 0 && (
          <div
            style={{
              margin: '1rem 0',
              marginTop: mySubjects.subjects.length > 0 ? '3rem' : '1rem',
              width: '100%'
            }}
          >
            <h3
              style={{
                color: Color.green()
              }}
            >
              All Subjects
            </h3>
          </div>
        )}
        {loaded && allSubjects.subjects.length === 0 && (
          <div>{`There aren't any subjects here, yet`}</div>
        )}
        {allSubjects.subjects.map((subject) => (
          <SubjectItem
            key={subject.id}
            currentSubjectId={currentSubjectId}
            onDeleteSubject={() => setDeleteTarget(subject.id)}
            onSelectSubject={() => selectSubject(subject.id)}
            userIsOwner={userIsOwner}
            {...subject}
          />
        ))}
        {allSubjects.loadMoreButton && (
          <LoadMoreButton
            filled
            color="lightBlue"
            loading={allSubjects.loading}
            onClick={() => handleLoadMoreSubjects(false)}
          />
        )}
      </main>
      <footer>
        <Button transparent onClick={onHide}>
          Close
        </Button>
      </footer>
      {deleteTarget && (
        <ConfirmModal
          modalOverModal
          onHide={() => setDeleteTarget(null)}
          onConfirm={() => handleDeleteSubject(deleteTarget)}
          title="Remove Subject"
        />
      )}
    </Modal>
  );

  async function handleDeleteSubject(subjectId) {
    await deleteChatSubject(subjectId);
    setMySubjects({
      ...mySubjects,
      subjects: mySubjects.subjects.filter(
        (subject) => subject.id !== subjectId
      )
    });
    setAllSubjects({
      ...allSubjects,
      subjects: allSubjects.subjects.filter(
        (subject) => subject.id !== subjectId
      )
    });
    setDeleteTarget(0);
  }

  async function handleLoadMoreSubjects(mineOnly) {
    if (mineOnly) {
      setMySubjects({ ...mySubjects, loading: true });
    } else {
      setAllSubjects({ ...allSubjects, loading: true });
    }
    const targetSubjects = mineOnly
      ? mySubjects.subjects
      : allSubjects.subjects;
    const lastSubject = targetSubjects[targetSubjects.length - 1];
    const { subjects, loadMoreButton } = await loadMoreChatSubjects({
      channelId,
      mineOnly,
      lastSubject
    });
    if (mineOnly) {
      setMySubjects({
        ...mySubjects,
        subjects: mySubjects.subjects.concat(subjects),
        loadMoreButton,
        loading: false
      });
    } else {
      setAllSubjects({
        ...allSubjects,
        subjects: allSubjects.subjects.concat(subjects),
        loadMoreButton,
        loading: false
      });
    }
  }
}
