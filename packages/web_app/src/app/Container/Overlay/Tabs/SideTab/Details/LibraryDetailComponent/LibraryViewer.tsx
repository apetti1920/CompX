import { BlockStorageType } from '@compx/common/Network/GraphItemStorage/BlockStorage';
import React, { Component } from 'react';
import { connect } from 'react-redux';

import CardComponent from './CardComponent';
import ColorTheme from '../../../../../../../theme/ColorTheme';
import { StateType as SaveState } from '../../../../../../../store/types';

type PropsType = {
  theme: ColorTheme;
  libraryBlocks: BlockStorageType<any, any>[];
};

class LibraryViewer extends Component<PropsType, Record<string, never>> {
  render() {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          maxHeight: '100%',
          borderTop: '1px solid black',
          backgroundColor: this.props.theme.value.primary.background.tint(30).hexString(),
          borderRadius: '0px 0px 20px 20px',
          overflowY: 'auto',
          overflowX: 'hidden'
        }}
      >
        <div
          style={{
            padding: '12px',
            display: 'grid',
            alignItems: 'start',
            gap: '8px',
            gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))'
          }}
        >
          {this.props.libraryBlocks.map((block, i) => (
            <CardComponent key={`card-comp-${block.name}-${i}`} theme={this.props.theme} block={block} />
          ))}
        </div>
      </div>
    );
  }
}

function mapStateToProps(state: SaveState) {
  return {
    libraryBlocks: state.currentGraph.libraryBlocks
  };
}

export default connect(mapStateToProps)(LibraryViewer);
