import React, { useState, useEffect, useMemo } from 'react';
import { connect } from 'react-redux';
import { VisualBlockStorageType } from '@compx/common/Network/GraphItemStorage/BlockStorage';
import { MetaParameterDefinition } from '@compx/common/BlockSchema/types';
import { StateType } from '../../../../store/types';
import ColorTheme from '../../../../theme/ColorTheme';
import { UpdateBlockMetaParametersAction } from '../../../../store/actions/graphactions';
import { SetConfigurationToolbarBlockAction } from '../../../../store/actions/canvasactions';
import { HexToRgbA } from '../../../../theme/helpers';

type GlobalProps = {
  theme: ColorTheme;
  configurationToolbarBlockId: string | null;
  blocks: VisualBlockStorageType<any, any>[];
  libraryBlocks: any[];
  selectedBlockIds: string[];
};

type DispatchProps = {
  updateBlockMetaParameters: (blockId: string, metaParameters: Record<string, number | string | boolean>) => void;
  closeToolbar: () => void;
};

type PropsType = GlobalProps & DispatchProps;

function BlockConfigurationToolbar(props: PropsType): JSX.Element | null {
  // Determine if toolbar should be visible and interactive
  const isOpen = !!props.configurationToolbarBlockId;

  // If toolbar is not open, render an invisible placeholder to maintain layout
  // but use pointerEvents: 'none' to prevent drag interference
  if (!props.configurationToolbarBlockId) {
    return (
      <div
        style={{
          position: 'absolute',
          right: '20px',
          top: '20px',
          width: 400,
          height: 'calc(100% - 40px)',
          transform: 'translateX(calc(100% + 20px))', // Slide off-screen to the right
          transition: 'transform 0.3s ease-in-out',
          pointerEvents: 'none', // Prevent interference with drag and drop
          zIndex: 1000
        }}
      />
    );
  }

  const [localParams, setLocalParams] = useState<Record<string, number | string | boolean>>({});

  // Check if the block is currently selected
  const isBlockSelected = props.selectedBlockIds.includes(props.configurationToolbarBlockId);

  // Get the block being configured
  const block = props.blocks.find((b) => b.id === props.configurationToolbarBlockId) || null;

  // Get the block definition to access meta parameter definitions
  const blockDefinition = block ? props.libraryBlocks.find((lb) => lb.name === block.name) : null;

  const metaParameterDefinitions: MetaParameterDefinition[] = blockDefinition?.metaParameters || [];

  // Initialize local params when block changes
  useEffect(() => {
    if (!block || !blockDefinition) {
      setLocalParams({});
      return;
    }

    // Merge defaults from definition with instance overrides
    const params: Record<string, number | string | boolean> = {};
    const metaParams = blockDefinition.metaParameters || [];
    metaParams.forEach((def) => {
      params[def.name] = block.metaParameters?.[def.name] ?? def.default;
    });
    setLocalParams(params);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [block?.id, blockDefinition?.name]);

  // Show empty state if toolbar is open but no block is selected or block doesn't exist
  if (!isBlockSelected || !block) {
    return (
      <div
        style={{
          position: 'absolute',
          right: '20px',
          top: '20px',
          width: 400,
          height: 'calc(100% - 40px)',
          backgroundColor: props.theme.get('background'),
          border: `1px solid ${HexToRgbA(props.theme.get('support'), 0.3)}`,
          borderRadius: '20px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          padding: '16px',
          pointerEvents: 'auto',
          transform: 'translateX(0)', // Slide in
          transition: 'transform 0.3s ease-in-out'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0, color: props.theme.get('heading') }}>Configure Block</h3>
          <button
            onClick={props.closeToolbar}
            style={{
              background: 'transparent',
              border: 'none',
              color: props.theme.get('heading'),
              cursor: 'pointer',
              fontSize: '24px',
              padding: '4px 8px',
              lineHeight: 1
            }}
          >
            ×
          </button>
        </div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ color: HexToRgbA(props.theme.get('heading'), 0.8), textAlign: 'center' }}>
            No block selected. Double-click a block to configure it.
          </p>
        </div>
      </div>
    );
  }

  if (!blockDefinition) {
    // Block definition not found in library - might need to reload blocks
    return (
      <div
        style={{
          position: 'absolute',
          right: '20px',
          top: '20px',
          width: 400,
          height: 'calc(100% - 40px)',
          backgroundColor: props.theme.get('background'),
          border: `1px solid ${HexToRgbA(props.theme.get('support'), 0.3)}`,
          borderRadius: '20px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          padding: '16px',
          pointerEvents: 'auto',
          transform: 'translateX(0)', // Slide in
          transition: 'transform 0.3s ease-in-out'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0, color: props.theme.get('heading') }}>Configure Block</h3>
          <button
            onClick={props.closeToolbar}
            style={{
              background: 'transparent',
              border: 'none',
              color: props.theme.get('heading'),
              cursor: 'pointer',
              fontSize: '24px',
              padding: '4px 8px',
              lineHeight: 1
            }}
          >
            ×
          </button>
        </div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ color: HexToRgbA(props.theme.get('heading'), 0.8), textAlign: 'center' }}>
            Block definition not found. Please refresh the page to reload block definitions.
          </p>
        </div>
      </div>
    );
  }

  if (metaParameterDefinitions.length === 0) {
    // Show a message that this block has no configurable parameters
    return (
      <div
        style={{
          position: 'absolute',
          right: '20px',
          top: '20px',
          width: 400,
          height: 'calc(100% - 40px)',
          backgroundColor: props.theme.get('background'),
          border: `1px solid ${HexToRgbA(props.theme.get('support'), 0.3)}`,
          borderRadius: '20px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          padding: '16px',
          pointerEvents: 'auto',
          transform: 'translateX(0)', // Slide in
          transition: 'transform 0.3s ease-in-out'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0, color: props.theme.get('heading') }}>Configure Block</h3>
          <button
            onClick={props.closeToolbar}
            style={{
              background: 'transparent',
              border: 'none',
              color: props.theme.get('heading'),
              cursor: 'pointer',
              fontSize: '24px',
              padding: '4px 8px',
              lineHeight: 1
            }}
          >
            ×
          </button>
        </div>
        <p style={{ color: HexToRgbA(props.theme.get('heading'), 0.8) }}>
          This block ({block.name}) has no configurable parameters.
        </p>
      </div>
    );
  }

  const handleParamChange = (paramName: string, value: number | string | boolean) => {
    setLocalParams((prev) => ({
      ...prev,
      [paramName]: value
    }));
  };

  const handleSave = () => {
    props.updateBlockMetaParameters(block.id, localParams);
  };

  const handleClose = () => {
    props.closeToolbar();
  };

  return (
    <div
      style={{
        position: 'absolute',
        right: '20px',
        top: '20px',
        width: 400,
        height: 'calc(100% - 40px)',
        backgroundColor: props.theme.get('background'),
        border: `1px solid ${HexToRgbA(props.theme.get('support'), 0.3)}`,
        borderRadius: '20px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        transform: 'translateX(0)', // Slide in
        transition: 'transform 0.3s ease-in-out',
        pointerEvents: 'auto'
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '16px',
          borderBottom: `1px solid ${HexToRgbA(props.theme.get('support'), 0.3)}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <div>
          <h3 style={{ margin: 0, color: props.theme.get('heading') }}>Configure Block</h3>
          <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: HexToRgbA(props.theme.get('heading'), 0.8) }}>
            {block.name}
          </p>
        </div>
        <button
          onClick={handleClose}
          style={{
            background: 'transparent',
            border: 'none',
            color: props.theme.get('heading'),
            cursor: 'pointer',
            fontSize: '24px',
            padding: '4px 8px',
            lineHeight: 1
          }}
        >
          ×
        </button>
      </div>

      {/* Content */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px'
        }}
      >
        {metaParameterDefinitions.map((paramDef) => {
          // Ensure paramValue is always defined to avoid controlled/uncontrolled input warning
          const paramValue = localParams[paramDef.name] ?? paramDef.default;
          const label = paramDef.label || paramDef.name;

          return (
            <div
              key={paramDef.name}
              style={{
                marginBottom: '20px'
              }}
            >
              <label
                style={{
                  display: 'block',
                  marginBottom: '8px',
                  color: props.theme.get('heading'),
                  fontWeight: 500
                }}
              >
                {label}
                {paramDef.description && (
                  <span
                    style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: 'normal',
                      color: HexToRgbA(props.theme.get('heading'), 0.8),
                      marginTop: '4px'
                    }}
                  >
                    {paramDef.description}
                  </span>
                )}
              </label>

              {paramDef.type === 'NUMBER' && (
                <input
                  type="number"
                  value={paramValue as number}
                  onChange={(e) => handleParamChange(paramDef.name, parseFloat(e.target.value) || 0)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: `1px solid ${HexToRgbA(props.theme.get('heading'), 0.25)}`,
                    borderRadius: '4px',
                    backgroundColor: props.theme.get('background'),
                    color: props.theme.get('heading'),
                    fontSize: '14px'
                  }}
                />
              )}

              {paramDef.type === 'STRING' && (
                <input
                  type="text"
                  value={paramValue as string}
                  onChange={(e) => handleParamChange(paramDef.name, e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: `1px solid ${HexToRgbA(props.theme.get('heading'), 0.25)}`,
                    borderRadius: '4px',
                    backgroundColor: props.theme.get('background'),
                    color: props.theme.get('heading'),
                    fontSize: '14px'
                  }}
                />
              )}

              {paramDef.type === 'BOOLEAN' && (
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={paramValue as boolean}
                    onChange={(e) => handleParamChange(paramDef.name, e.target.checked)}
                    style={{
                      marginRight: '8px',
                      width: '18px',
                      height: '18px',
                      cursor: 'pointer'
                    }}
                  />
                  <span style={{ color: props.theme.get('heading') }}>{paramValue ? 'Enabled' : 'Disabled'}</span>
                </label>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div
        style={{
          padding: '16px',
          borderTop: `1px solid ${HexToRgbA(props.theme.get('heading'), 0.25)}`,
          display: 'flex',
          gap: '8px',
          justifyContent: 'flex-end'
        }}
      >
        <button
          onClick={handleClose}
          style={{
            padding: '8px 16px',
            border: `1px solid ${HexToRgbA(props.theme.get('support'), 0.3)}`,
            borderRadius: '4px',
            backgroundColor: props.theme.get('background'),
            color: props.theme.get('heading'),
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          style={{
            padding: '8px 16px',
            border: 'none',
            borderRadius: '4px',
            backgroundColor: props.theme.get('action'),
            color: props.theme.get('background'),
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 500
          }}
        >
          Save
        </button>
      </div>
    </div>
  );
}

function mapStateToProps(state: StateType): GlobalProps {
  return {
    theme: state.userStorage.theme,
    configurationToolbarBlockId: state.userStorage.canvas.configurationToolbarBlockId,
    blocks: state.currentGraph.graph.blocks,
    libraryBlocks: state.currentGraph.libraryBlocks,
    selectedBlockIds: state.currentGraph.selected.filter((s) => s.itemType === 'BLOCK').map((s) => s.id)
  };
}

function mapDispatchToProps(dispatch: any): DispatchProps {
  return {
    updateBlockMetaParameters: (blockId: string, metaParameters: Record<string, number | string | boolean>) => {
      dispatch(UpdateBlockMetaParametersAction(blockId, metaParameters));
    },
    closeToolbar: () => {
      dispatch(SetConfigurationToolbarBlockAction(null));
    }
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(BlockConfigurationToolbar);
