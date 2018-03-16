import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { IconButton, Popover as MuiPopover } from 'material-ui';
import { Mood } from 'material-ui-icons';
import strategy from 'emojione/emoji.json';
import createEmojisFromStrategy from '../../utils/createEmojisFromStrategy';
import defaultEmojiGroups from '../../constants/defaultEmojiGroups';
import Groups from './Popover/Groups';
import Nav from './Popover/Nav';
import ToneSelect from './Popover/ToneSelect';
import addEmoji from '../../modifiers/addEmoji';

const emojis = createEmojisFromStrategy(strategy);

export default class EmojiSelect extends Component {
  static propTypes = {
    cacheBustParam: PropTypes.string.isRequired,
    imagePath: PropTypes.string.isRequired,
    imageType: PropTypes.string.isRequired,
    theme: PropTypes.object.isRequired,
    store: PropTypes.object.isRequired,
    selectGroups: PropTypes.arrayOf(PropTypes.shape({
      title: PropTypes.string.isRequired,
      icon: PropTypes.oneOfType([
        PropTypes.element,
        PropTypes.string,
      ]).isRequired,
      categories: PropTypes.arrayOf(PropTypes.oneOf(Object.keys(emojis))).isRequired,
    })),
    selectButtonContent: PropTypes.oneOfType([
      PropTypes.element,
      PropTypes.string,
    ]),
    toneSelectOpenDelay: PropTypes.number,
    useNativeArt: PropTypes.bool,
  };

  static defaultProps = {
    selectButtonContent: '☺',
    selectGroups: defaultEmojiGroups,
    toneSelectOpenDelay: 500,
  };

  // Start the selector closed
  state = {
    isOpen: false,
    activeGroup: 0,
    showToneSelect: false,
  };

  onClick = (e) => {
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
  };

  onButtonMouseUp = (e) => {
    this.state.isOpen ? this.closePopover() : this.openPopover(e);
  };

  onEmojiSelect = (emoji) => {
    const newEditorState = addEmoji(
      this.props.store.getEditorState(),
      emoji,
    );
    this.props.store.setEditorState(newEditorState);
    this.setState({
      isOpen: false,
      showToneSelect: false,
    });
  };

  onEmojiMouseDown = (emojiEntry, toneSet) => {
    this.activeEmoji = emojiEntry;

    if (toneSet) {
      this.openToneSelectWithTimer(toneSet);
    }
  };

  onGroupSelect = (groupIndex) => {
    this.groups.scrollToGroup(groupIndex);
  };

  onGroupScroll = (groupIndex) => {
    if (groupIndex !== this.state.activeGroup) {
      this.setState({
        activeGroup: groupIndex,
      });
    }
  };

  // Open the popover
  openPopover = (e) => {
    if (!this.state.isOpen) {
      this.setState({
        isOpen: true,
        anchorEl: e.target,
      });
    }
  };

  openToneSelect = (toneSet) => {
    this.toneSet = toneSet;

    this.setState({
      showToneSelect: true,
    });
  };

  openToneSelectWithTimer = (toneSet) => {
    this.toneSelectTimer = setTimeout(() => {
      this.toneSelectTimer = null;
      this.openToneSelect(toneSet);
    }, this.props.toneSelectOpenDelay);
  }

  closeToneSelect = () => {
    this.toneSet = [];

    this.setState({
      showToneSelect: false,
    });
  };

  // Close the popover
  closePopover = (event) => {
    if (this.state.isOpen) {
      this.setState({
        isOpen: false,
        anchorEl: null,
      });
    }
  };

  checkMouseDown = () => this.mouseDown;

  toneSet = [];
  toneSelectTimer = null;

  renderToneSelect = () => {
    if (this.state.showToneSelect) {
      const { cacheBustParam, imagePath, imageType, theme = {} } = this.props;

      const containerBounds = this.container.getBoundingClientRect();
      const areaBounds = this.groups.container.getBoundingClientRect();
      const entryBounds = this.activeEmoji.button.getBoundingClientRect();
      // Translate TextRectangle coords to CSS relative coords
      const bounds = {
        areaBounds: {
          left: areaBounds.left - containerBounds.left,
          right: containerBounds.right - areaBounds.right,
          top: areaBounds.top - containerBounds.top,
          bottom: containerBounds.bottom - areaBounds.bottom,
          width: areaBounds.width,
          height: areaBounds.width,
        },
        entryBounds: {
          left: entryBounds.left - containerBounds.left,
          right: containerBounds.right - entryBounds.right,
          top: entryBounds.top - containerBounds.top,
          bottom: containerBounds.bottom - entryBounds.bottom,
          width: entryBounds.width,
          height: entryBounds.width,
        }
      };

      return (
        <ToneSelect
          theme={theme}
          bounds={bounds}
          toneSet={this.toneSet}
          imagePath={imagePath}
          imageType={imageType}
          cacheBustParam={cacheBustParam}
          onEmojiSelect={this.onEmojiSelect}
        />
      );
    }

    return null;
  };

  render() {
    const {
      cacheBustParam,
      imagePath,
      imageType,
      theme = {},
      store,
      selectGroups,
      useNativeArt,
    } = this.props;
    const { activeGroup, anchorEl } = this.state;

    return (
      <div className={theme.emojiSelect} onClick={this.onClick}>
        <IconButton onClick={this.openPopover}>
          <Mood />
        </IconButton>
        <MuiPopover
          open={this.state.isOpen}
          anchorEl={anchorEl}
          onClose={this.closePopover}
        >
          <div ref={(element) => { this.container = element; }}>
            <h3 className={theme.emojiSelectPopoverTitle}>
              {selectGroups[activeGroup].title}
            </h3>
            <Groups
              theme={theme}
              groups={selectGroups}
              emojis={emojis}
              imagePath={imagePath}
              imageType={imageType}
              cacheBustParam={cacheBustParam}
              checkMouseDown={this.checkMouseDown}
              onEmojiSelect={this.onEmojiSelect}
              onEmojiMouseDown={this.onEmojiMouseDown}
              onGroupScroll={this.onGroupScroll}
              ref={(element) => { this.groups = element; }}
              useNativeArt={useNativeArt}
            />
            <Nav
              theme={theme}
              groups={selectGroups}
              activeGroup={activeGroup}
              onGroupSelect={this.onGroupSelect}
            />
            {this.renderToneSelect()}
          </div>
        </MuiPopover>
      </div>
    );
  }
}
