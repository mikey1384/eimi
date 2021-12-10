import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import SearchInput from 'components/Texts/SearchInput';
import { useMyState } from 'helpers/hooks';
import { useExploreContext } from 'contexts';
import { SELECTED_LANGUAGE } from 'constants/defaultValues';
import localize from 'constants/localize';

SearchBox.propTypes = {
  category: PropTypes.string,
  className: PropTypes.string,
  innerRef: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
  style: PropTypes.object
};

export default function SearchBox({ category, className, innerRef, style }) {
  const { profileTheme } = useMyState();
  const {
    state: {
      search: { searchText }
    },
    actions: { onChangeSearchInput }
  } = useExploreContext();
  const placeholderLabel = useMemo(() => {
    return SELECTED_LANGUAGE === 'kr'
      ? `${localize(category.slice(0, -1))}${
          category === 'videos' ? '을' : '를'
        } 검색하세요...`
      : `Search ${category}...`;
  }, [category]);

  return (
    <SearchInput
      className={className}
      style={style}
      addonColor={profileTheme}
      borderColor={profileTheme}
      innerRef={innerRef}
      placeholder={placeholderLabel}
      onChange={onChangeSearchInput}
      value={searchText}
    />
  );
}
