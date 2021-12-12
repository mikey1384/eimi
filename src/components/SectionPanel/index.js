import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import LoadMoreButton from 'components/Buttons/LoadMoreButton';
import Body from './Body';
import SearchInput from 'components/Texts/SearchInput';
import Input from 'components/Texts/Input';
import Icon from 'components/Icon';
import Loading from 'components/Loading';
import { addEmoji, stringIsEmpty } from 'helpers/stringHelpers';
import { borderRadius, Color, mobileMaxWidth } from 'constants/css';
import { css } from '@emotion/css';
import { useMyState, useOutsideClick } from 'helpers/hooks';
import localize from 'constants/localize';

const editLabel = localize('edit');

SectionPanel.propTypes = {
  canEdit: PropTypes.bool,
  title: PropTypes.node,
  button: PropTypes.node,
  emptyMessage: PropTypes.string,
  innerRef: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
  inverted: PropTypes.bool,
  isEmpty: PropTypes.bool,
  isSearching: PropTypes.bool,
  loaded: PropTypes.bool,
  onLoadMore: PropTypes.func,
  children: PropTypes.node,
  loadMoreButtonShown: PropTypes.bool,
  onEditTitle: PropTypes.func,
  onSearch: PropTypes.func,
  placeholder: PropTypes.string,
  searchPlaceholder: PropTypes.string,
  searchQuery: PropTypes.string,
  style: PropTypes.object,
  customColorTheme: PropTypes.string,
  innerStyle: PropTypes.object
};

export default function SectionPanel({
  button,
  canEdit,
  children,
  customColorTheme,
  emptyMessage,
  innerRef,
  inverted,
  isEmpty,
  isSearching,
  loaded,
  loadMoreButtonShown,
  onEditTitle,
  onLoadMore,
  onSearch,
  placeholder = 'Enter Title',
  searchPlaceholder,
  searchQuery = '',
  style,
  innerStyle = {},
  title
}) {
  const { profileTheme } = useMyState();
  const [loading, setLoading] = useState(false);
  const [onEdit, setOnEdit] = useState(false);
  const [editedTitle, setEditedTitle] = useState(title);
  const themeColor = customColorTheme || profileTheme;
  const TitleInputRef = useRef(null);
  useOutsideClick(TitleInputRef, () => {
    setOnEdit(false);
    setEditedTitle(title);
  });

  return (
    <div
      style={style}
      className={css`
        border: 1px solid ${Color.borderGray()};
        width: 100%;
        background: #fff;
        border-radius: ${borderRadius};
        margin-bottom: 1rem;
        > header {
          display: grid;
          width: 100%;
          grid-template-areas: 'title search buttons';
          grid-template-columns: auto ${onSearch ? '40%' : 'auto'} auto;
          background: #fff;
          color: ${Color[themeColor]()};
          border-top-left-radius: ${borderRadius};
          border-top-right-radius: ${borderRadius};
          padding: 1rem;
          padding-top: ${inverted ? '1.7rem' : '1rem'};
          font-weight: bold;
          font-size: 2.5rem;
          align-items: center;
        }
        > main {
          position: relative;
          display: flex;
          flex-direction: column;
          padding: 1rem;
          width: 100%;
          justify-content: center;
          min-height: 15rem;
        }
        @media (max-width: ${mobileMaxWidth}) {
          border-radius: 0;
          border-left: 0;
          border-right: 0;
          > header {
            font-size: 2rem;
            border-radius: 0;
          }
        }
      `}
    >
      <header ref={innerRef}>
        <div
          style={{
            gridArea: 'title',
            marginRight: '1rem',
            display: 'flex'
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              width: '100%'
            }}
          >
            {onEdit ? (
              <Input
                inputRef={TitleInputRef}
                maxLength={100}
                placeholder={placeholder}
                autoFocus
                onChange={(text) => setEditedTitle(addEmoji(text))}
                onKeyPress={(event) => {
                  if (!stringIsEmpty(editedTitle) && event.key === 'Enter') {
                    onChangeTitle(editedTitle);
                  }
                }}
                value={editedTitle}
              />
            ) : (
              <div
                style={{
                  lineHeight: 1.5,
                  width: '100%',
                  overflowWrap: 'break-word',
                  wordBreak: 'break-word'
                }}
              >
                {title}
              </div>
            )}
            {canEdit && onEditTitle && !onEdit ? (
              <div
                style={{
                  color: Color.gray(),
                  fontWeight: 'normal',
                  marginTop: '0.5rem',
                  fontSize: '1.5rem',
                  display: 'flex',
                  lineHeight: '1.7rem',
                  alignItems: 'flex-end'
                }}
              >
                <span
                  className={css`
                    &:hover {
                      text-decoration: underline;
                    }
                  `}
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    setOnEdit(true);
                    setEditedTitle(title);
                  }}
                >
                  <Icon icon="pencil-alt" />
                  &nbsp;&nbsp;{editLabel}
                </span>
              </div>
            ) : (
              ''
            )}
          </div>
        </div>
        {onSearch && (
          <SearchInput
            addonColor={themeColor}
            borderColor={themeColor}
            style={{
              color: '#fff',
              gridArea: 'search',
              width: '100%',
              justifySelf: 'center',
              zIndex: 0
            }}
            onChange={onSearch}
            placeholder={searchPlaceholder}
            value={searchQuery}
          />
        )}
        <div
          style={{ gridArea: 'buttons', justifySelf: 'end' }}
          className={css`
            @media (max-width: ${mobileMaxWidth}) {
              button {
                font-size: 1.3rem;
              }
            }
          `}
        >
          {button}
        </div>
      </header>
      <main style={{ width: '100%', ...innerStyle }}>
        {loaded ? (
          <Body
            content={children}
            emptyMessage={emptyMessage}
            loadMoreButtonShown={loadMoreButtonShown}
            isEmpty={isEmpty}
            isSearching={isSearching}
            searchQuery={searchQuery}
            statusMsgStyle={css`
              padding: 0 1rem;
              font-size: 2.5rem;
              font-weight: bold;
              display: flex;
              justify-content: center;
              align-items: center;
              color: ${Color.darkerGray()};
              @media (max-width: ${mobileMaxWidth}) {
                font-size: 2rem;
              }
            `}
          />
        ) : (
          <Loading />
        )}
        {loadMoreButtonShown && (
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <LoadMoreButton
              transparent
              loading={loading}
              onClick={handleLoadMore}
              style={{ fontSize: '2rem' }}
            />
          </div>
        )}
      </main>
    </div>
  );

  async function onChangeTitle(title) {
    await onEditTitle(title);
    setOnEdit(false);
  }

  async function handleLoadMore() {
    if (!loading) {
      setLoading(true);
      await onLoadMore();
      setLoading(false);
    }
  }
}
