import React from 'react';
import PropTypes from 'prop-types';
import Button from 'components/Button';
import Icon from 'components/Icon';
import { isEqual } from 'lodash';

const availableIcons = [
  'align-justify',
  ['fab', 'android'],
  ['fab', 'apple'],
  'arrow-up',
  'arrow-down',
  'arrow-left',
  'arrow-right',
  ['far', 'badge-dollar'],
  'ban',
  'bars',
  'bolt',
  'book',
  'briefcase',
  'camera-alt',
  'caret-down',
  'certificate',
  ['far', 'certificate'],
  'chalkboard-teacher',
  'check',
  'check-circle',
  'chess',
  'chevron-up',
  'chevron-down',
  'chevron-left',
  'chevron-right',
  'clipboard-check',
  'code-branch',
  'comment',
  'comment-alt',
  'comments',
  'copy',
  'crown',
  'desktop',
  'exchange-alt',
  'film',
  'file',
  'file-archive',
  'file-audio',
  'file-pdf',
  'file-video',
  'file-word',
  'link',
  'heart',
  'heart-square',
  'history',
  'home',
  'lock',
  'minus',
  'mobile-alt',
  'paperclip',
  'paper-plane',
  'pencil-alt',
  'phone-volume',
  'plus',
  'portal-enter',
  'question',
  'reply',
  'search',
  'school',
  'shopping-bag',
  'sign-out-alt',
  'sliders-h',
  'star',
  ['far', 'star'],
  'surprise',
  'tasks',
  'thumbs-up',
  'times',
  'trash-alt',
  'trash-restore',
  'tree',
  'trophy',
  'user',
  'upload',
  'user-graduate',
  'users',
  'volume-mute',
  ['fab', 'windows']
];

IconMenu.propTypes = {
  onSelectIcon: PropTypes.func.isRequired,
  selectedIcon: PropTypes.oneOfType([PropTypes.string, PropTypes.array])
};

export default function IconMenu({ onSelectIcon, selectedIcon }) {
  return (
    <div>
      {availableIcons.map((icon) => {
        const buttonColor = isEqual(selectedIcon, icon) ? 'orange' : 'black';
        return (
          <Button
            style={{
              display: 'inline',
              marginRight: '1rem',
              marginBottom: '1rem'
            }}
            key={icon}
            skeuomorphic
            onClick={() => onSelectIcon(icon)}
            color={buttonColor}
            filled={isEqual(selectedIcon, icon)}
          >
            <Icon icon={icon} />
          </Button>
        );
      })}
    </div>
  );
}