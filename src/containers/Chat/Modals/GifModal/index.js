import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import Modal from 'components/Modal';
import Button from 'components/Button';
import SearchInput from 'components/Texts/SearchInput';
import Loading from 'components/Loading';
import GifThumb from './GifThumb';
import { useAppContext } from 'contexts';
import { useSearch } from 'helpers/hooks';

GifModal.propTypes = {
  onHide: PropTypes.func.isRequired,
  onSend: PropTypes.func.isRequired
};

export default function GifModal({ onSend, onHide }) {
  const {
    requestHelpers: { searchTenor }
  } = useAppContext();
  const [selectedGif] = useState(null);
  const [searchedGifs, setSearchedGifs] = useState([]);
  const [searchText, setSearchText] = useState('');
  const { handleSearch, searching } = useSearch({
    onSearch,
    onClear: () => setSearchedGifs([]),
    onSetSearchText: setSearchText
  });
  const mounted = useRef(true);

  return (
    <Modal large onHide={onHide}>
      <header>Send a Video</header>
      <main>
        <SearchInput
          placeholder="Search..."
          autoFocus
          style={{
            marginBottom: '2em',
            width: '50%'
          }}
          value={searchText}
          onChange={handleSearch}
        />
        {searching && <Loading />}
        {searchedGifs.map((gif, index) =>
          gif.url ? <GifThumb key={index} gif={gif} /> : null
        )}
      </main>
      <footer>
        <Button transparent onClick={onHide}>
          Cancel
        </Button>
        <Button
          disabled={!selectedGif}
          color="blue"
          style={{ marginLeft: '0.7rem' }}
          onClick={() => onSend(selectedGif)}
        >
          Send
        </Button>
      </footer>
    </Modal>
  );

  async function onSearch(text) {
    const data = await searchTenor(text);
    if (mounted.current) {
      setSearchedGifs(data);
    }
  }
}
