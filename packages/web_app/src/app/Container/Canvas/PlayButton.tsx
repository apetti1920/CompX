import React, { useState } from 'react';
import { Play } from 'react-feather';
import { useDispatch } from 'react-redux';
import { VisualGraphStorageType, GraphStorageType } from '@compx/common/Network/GraphItemStorage/GraphStorage';
import { BlockDefinition } from '@compx/common/BlockSchema/types';
import { executeGraphAndGetVisualizationData } from '../../../services/VisualizationService';
import { UpdateVisualizationDataAction } from '../../../store/actions/graphactions';
import { BlockStorageWithIDType } from '@compx/common/Network/GraphItemStorage/BlockStorage';

interface PlayButtonProps {
  graph: VisualGraphStorageType;
  libraryBlocks: BlockDefinition[];
  theme: any;
}

/**
 * Simple play button to execute the graph and update visualizations
 */
export default function PlayButton(props: PlayButtonProps): JSX.Element {
  const dispatch = useDispatch();
  const [isExecuting, setIsExecuting] = useState(false);

  const handlePlayClick = async () => {
    if (isExecuting) {
      return;
    }

    setIsExecuting(true);

    try {
      // Convert VisualGraphStorageType to GraphStorageType
      // Remove visual-only properties from blocks
      const graphStorage: GraphStorageType = {
        blocks: props.graph.blocks.map((block) => {
          // Create a new block storage object without visual properties
          const { visualName, position, size, mirrored, shape, color, icon, visualizationData, ...blockStorage } =
            block;

          // Find the library block definition to get visualization config
          const libraryBlock = props.libraryBlocks.find((lb) => lb.name === block.name);

          // Create block storage with ID (GraphStorageType needs BlockStorageWithIDType)
          const blockStorageWithId: BlockStorageWithIDType<any, any> = {
            id: block.id,
            name: blockStorage.name,
            description: blockStorage.description,
            tags: blockStorage.tags,
            inputPorts: blockStorage.inputPorts,
            outputPorts: blockStorage.outputPorts,
            callbackString: blockStorage.callbackString
          };

          return blockStorageWithId;
        }),
        edges: props.graph.edges.map((edge) => {
          const { midPoints, ...edgeStorage } = edge;
          return edgeStorage;
        })
      };

      // Execute graph and get visualization data
      const T = 10.0; // Execute for 10 seconds
      const dt = 0.01; // Time step of 0.01 seconds

      // Pass library blocks with visualization config
      const libraryBlocksForExecution = props.libraryBlocks.map((lb) => ({
        name: lb.name,
        visualization: lb.visualization
      }));

      const visualizationData = await executeGraphAndGetVisualizationData(
        graphStorage,
        T,
        dt,
        libraryBlocksForExecution
      );

      // Update Redux state with visualization data
      dispatch(UpdateVisualizationDataAction(visualizationData));
    } catch (error) {
      console.error('Error executing graph:', error);
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div
      style={{
        position: 'absolute',
        bottom: '20px',
        right: '20px',
        zIndex: 10000,
        pointerEvents: 'auto',
        width: '56px',
        height: '56px'
      }}
    >
      <button
        onClick={handlePlayClick}
        disabled={isExecuting}
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          border: 'none',
          backgroundColor: isExecuting ? props.theme.get('support') : props.theme.get('action'),
          color: 'white',
          cursor: isExecuting ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
          transition: 'all 0.2s ease',
          opacity: isExecuting ? 0.6 : 1
        }}
        onMouseEnter={(e) => {
          if (!isExecuting) {
            e.currentTarget.style.transform = 'scale(1.1)';
            e.currentTarget.style.boxShadow = '0 6px 12px rgba(0,0,0,0.3)';
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
        }}
      >
        <Play size={24} fill="white" />
      </button>
    </div>
  );
}
