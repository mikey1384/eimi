import React, { useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import parse from 'html-react-parser';
import Link from 'components/Link';
import { limitBrs, processedStringWithURL } from 'helpers/stringHelpers';
import { Color } from 'constants/css';
import { useContentState } from 'helpers/hooks';
import { useContentContext } from 'contexts';
import localize from 'constants/localize';

const readMoreLabel = localize('readMore');

LongText.propTypes = {
  children: PropTypes.string,
  className: PropTypes.string,
  cleanString: PropTypes.bool,
  contentId: PropTypes.number,
  contentType: PropTypes.string,
  isPreview: PropTypes.bool,
  maxLines: PropTypes.number,
  section: PropTypes.string,
  style: PropTypes.object,
  readMoreColor: PropTypes.string
};

export default function LongText({
  style,
  className,
  cleanString,
  children: text,
  contentId,
  contentType,
  isPreview,
  section,
  maxLines = 10,
  readMoreColor = Color.blue()
}) {
  const {
    actions: { onSetFullTextState }
  } = useContentContext();
  const ContainerRef = useRef(null);
  const contentState =
    contentType && section ? useContentState({ contentType, contentId }) : {};
  const { fullTextState = {} } = contentState;
  const fullTextRef = useRef(fullTextState[section]);
  const [fullText, setFullText] = useState(
    isPreview ? false : fullTextState[section]
  );
  const [isOverflown, setIsOverflown] = useState(false);
  useEffect(() => {
    setFullText(false);
    setIsOverflown(
      ContainerRef.current?.scrollHeight >
        ContainerRef.current?.clientHeight + 2
    );
  }, [text]);

  useEffect(() => {
    if (fullTextState[section] && !isPreview) {
      fullTextRef.current = true;
      setFullText(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return function saveFullTextStateBeforeUnmount() {
      if (contentType && section && fullTextRef.current) {
        onSetFullTextState({
          contentId,
          contentType,
          section,
          fullTextShown: fullTextRef.current
        });
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const innerHTML = useMemo(() => {
    if (cleanString) {
      return limitBrs(text);
    }
    let processedText = processedStringWithURL(text);
    if (!fullText && processedText && isOverflown) {
      const splitText = processedText?.split('</');
      if (splitText[splitText.length - 1] === 'a>') {
        let finalTextArray = processedText?.split('<a');
        finalTextArray = finalTextArray.filter(
          (word, index) => index !== finalTextArray.length - 1
        );
        processedText = finalTextArray.join('<a') + 'Read More';
      }
    }
    const finalText = parse(limitBrs(processedText), {
      replace: (domNode) => {
        if (domNode.name === 'a' && domNode.attribs.class === 'mention') {
          const node = domNode.children[0];
          return <Link to={domNode.attribs.href}>{node.data}</Link>;
        }
      }
    });
    return finalText;
  }, [cleanString, fullText, text, isOverflown]);

  return (
    <div style={style} className={className}>
      <p>
        {fullText ? (
          <span>{innerHTML}</span>
        ) : (
          <>
            <span
              ref={ContainerRef}
              style={{
                overflow: 'hidden',
                display: '-webkit-box',
                WebkitLineClamp: maxLines,
                WebkitBoxOrient: 'vertical'
              }}
            >
              {innerHTML}
            </span>
            <>
              {isOverflown && (
                <>
                  <a
                    style={{
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      color: readMoreColor,
                      display: 'inline-block',
                      paddingTop: '1.5rem'
                    }}
                    onClick={() => {
                      setFullText(true);
                      fullTextRef.current = true;
                    }}
                  >
                    {readMoreLabel}
                  </a>
                </>
              )}
            </>
          </>
        )}
      </p>
    </div>
  );
}
