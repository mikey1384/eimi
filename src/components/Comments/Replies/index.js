import React, { memo, useContext, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import LocalContext from '../Context';
import Reply from './Reply';
import LoadMoreButton from 'components/Buttons/LoadMoreButton';
import { scrollElementToCenter } from 'helpers';
import { useAppContext } from 'contexts';

Replies.propTypes = {
  comment: PropTypes.shape({
    id: PropTypes.number.isRequired,
    loadMoreButton: PropTypes.bool
  }).isRequired,
  subject: PropTypes.object,
  parent: PropTypes.object.isRequired,
  replies: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      userId: PropTypes.number.isRequired
    })
  ).isRequired,
  ReplyRefs: PropTypes.object,
  rootContent: PropTypes.object,
  userId: PropTypes.number
};

function Replies({
  replies,
  userId,
  comment,
  subject,
  parent,
  rootContent,
  ReplyRefs
}) {
  const {
    onDelete,
    onLoadMoreReplies,
    onLoadRepliesOfReply,
    onReplySubmit
  } = useContext(LocalContext);
  const {
    requestHelpers: { loadReplies }
  } = useAppContext();
  const [deleting, setDeleting] = useState(false);
  const [replying, setReplying] = useState(false);
  const [loadingMoreReplies, setLoadingMoreReplies] = useState(false);
  const prevReplies = useRef(replies);
  const ContainerRef = useRef(null);

  useEffect(() => {
    if (replies.length < prevReplies.current.length) {
      if (deleting) {
        setDeleting(false);
        if (replies.length === 0) {
          return scrollElementToCenter(ContainerRef.current);
        }
        if (
          replies[replies.length - 1].id !==
          prevReplies.current[prevReplies.current.length - 1].id
        ) {
          scrollElementToCenter(ReplyRefs[replies[replies.length - 1].id]);
        }
      }
    }
    if (replies.length > prevReplies.current.length) {
      if (replying) {
        setReplying(false);
        scrollElementToCenter(ReplyRefs[replies[replies.length - 1].id]);
      }
    }
    prevReplies.current = replies;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [replies]);

  return (
    <div ref={ContainerRef}>
      {comment.loadMoreButton && (
        <LoadMoreButton
          style={{
            marginTop: '0.5rem',
            width: '100%'
          }}
          filled
          color="lightBlue"
          loading={loadingMoreReplies}
          onClick={handleLoadMoreReplies}
        >
          Load More
        </LoadMoreButton>
      )}
      {replies.map((reply, index) => {
        return (
          <Reply
            index={index}
            innerRef={(ref) => (ReplyRefs[reply.id] = ref)}
            key={reply.id}
            comment={comment}
            reply={reply}
            userId={userId}
            deleteReply={handleDeleteReply}
            onLoadRepliesOfReply={onLoadRepliesOfReply}
            parent={parent}
            rootContent={rootContent}
            subject={subject}
            onSubmitReply={handleSubmitReply}
          />
        );
      })}
    </div>
  );

  async function handleLoadMoreReplies() {
    try {
      setLoadingMoreReplies(true);
      const lastReplyId = replies[0] ? replies[0].id : 'undefined';
      const data = await loadReplies({ lastReplyId, commentId: comment.id });
      onLoadMoreReplies({
        ...data,
        contentType: parent.contentType,
        contentId: parent.contentId
      });
      setLoadingMoreReplies(false);
    } catch (error) {
      console.error(error.response, error);
    }
  }

  function handleDeleteReply(replyId) {
    setDeleting(true);
    onDelete(replyId);
  }

  function handleSubmitReply(params) {
    setReplying(true);
    onReplySubmit(params);
  }
}

export default memo(Replies);
