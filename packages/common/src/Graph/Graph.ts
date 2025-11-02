import _ from 'lodash';
import { v4 as uuid } from 'uuid';

import { GraphStorageType } from '../Network/GraphItemStorage/GraphStorage';
import GraphObject from './GraphObjectBase';
import { BlockStorageType } from '../Network/GraphItemStorage/BlockStorage';
import { Block } from './Block';
import { Edge, EdgeTypes } from './Edge';
import { CompXError } from '../Helpers/ErrorHandling';
import { PortStringListType } from './Port';

type DFSBlockType = {
  blockId: string;
  nodeCompletion: 'WHITE' | 'GRAY' | 'BLACK';
  d: number;
  f: number;
};

class Graph implements GraphStorageType, GraphObject<Graph> {
  public blocks: Block<any, any>[];
  public edges: Edge<any>[];

  // Constructs a graph from storage
  public constructor(graph: GraphStorageType) {
    this.blocks = graph.blocks.map((bs) => Block.InitializeFromStorageWithId(bs));
    this.edges = graph.edges.map((es) => Edge.InitializeFromStorage(es));
  }

  // Function to add a block to the graph
  public AddBlock(block: BlockStorageType<PortStringListType, PortStringListType>): string {
    const newBlock = Block.InitializeFromStorage(block);

    // Initialize visualization if the block has visualization config
    // Note: visualization config needs to be set separately on the Block instance
    // since BlockStorageType doesn't include it. This is typically set when creating
    // blocks from BlockDefinition in the web app layer.
    if (newBlock.visualizationConfig) {
      newBlock.InitializeVisualization();
    }

    this.blocks.push(newBlock);
    return newBlock.id;
  }

  // Function to remove a block by id
  public RemoveBlock(blockId: string): void | never {
    const blockIndex = this.blocks.findIndex((b) => b.id === blockId);
    if (blockIndex === -1) throw new CompXError('warning', 'Block Removal Warning', `Block ${blockId} was not found`);

    this.edges.splice(
      this.edges.findIndex((e) => e.output.blockID === blockId || e.input.blockID === blockId),
      1
    );
    this.blocks.splice(blockIndex, 1);
  }

  // Function To Add an edge to thee graph
  public AddEdge(
    outputBlockId: string,
    outputPortId: string,
    inputBlockId: string,
    inputPortId: string
  ): string | never {
    // Check if this edge already exists
    const foundInd = this.edges.find(
      (e) =>
        e.output.blockID === outputBlockId &&
        e.output.portID === outputPortId &&
        e.input.blockID === inputBlockId &&
        e.input.portID === inputPortId
    );
    if (foundInd !== undefined) return foundInd.id;

    // Check if the output block exists
    const outputBlockIndex = this.blocks.findIndex((b) => b.id === outputBlockId);
    if (outputBlockIndex === -1)
      throw new CompXError('warning', 'Add Edge Warning', `Output block ${outputBlockId} not found`);

    // Check if the output port exists
    const outputPortIndex = this.blocks[outputBlockIndex].outputPorts.findIndex((p) => p.id === outputPortId);
    if (outputPortIndex === -1)
      throw new CompXError('warning', 'Add Edge Warning', `Output port ${outputPortId} not found`);

    // Check if the input block exists
    const inputBlockIndex = this.blocks.findIndex((b) => b.id === inputBlockId);
    if (inputBlockIndex === -1)
      throw new CompXError('warning', 'Add Edge Warning', `Input block ${inputBlockId} not found`);

    // Check if the input port exists
    const inputPortIndex = this.blocks[inputBlockIndex].inputPorts.findIndex((p) => p.id === inputPortId);
    if (inputPortIndex === -1)
      throw new CompXError('warning', 'Add Edge Warning', `Input port ${inputPortId} not found`);

    // Check if the port types are compatible
    if (
      this.blocks[outputBlockIndex].outputPorts[outputPortIndex].type !==
      this.blocks[inputBlockIndex].inputPorts[inputPortIndex].type
    )
      throw new CompXError(
        'warning',
        'Add Edge Warning',
        `Output port type ${this.blocks[outputPortIndex].outputPorts[outputPortIndex].type} 
                is not the same type as the input ports 
                (${this.blocks[inputBlockIndex].inputPorts[inputPortIndex].type})`
      );

    // Check that only one edge goes to any input
    if (this.edges.findIndex((e) => e.input.blockID === inputBlockId && e.input.portID === inputPortId) !== -1)
      throw new CompXError('warning', 'Edge Add Warning', 'More than one  edge can not go to the same input port');

    // Add the edge
    const newEdge = Edge.InitializeFromStorage({
      id: uuid(),
      type: this.blocks[outputPortIndex].outputPorts[outputPortIndex].type,
      input: { blockID: inputBlockId, portID: inputPortId },
      output: { blockID: outputBlockId, portID: outputPortId }
    });
    this.edges.push(newEdge);
    return newEdge.id;
  }

  // Function to remove an edge from the graph
  public RemoveEdge(edgeId: string): void | never {
    const edgeIndex = this.edges.findIndex((e) => e.id === edgeId);
    if (edgeIndex === -1) throw new CompXError('warning', 'Edge Removal Warning', `Edge ${edgeId} was not found`);

    this.edges.splice(edgeIndex, 1);
  }

  // Gets the source blocks in the graph (Outputs only)
  public GetSourceBlocks(): string[] {
    return this.blocks.filter((b) => b.inputPorts.length === 0 || b.isPseudoSource()).map((b) => b.id);
  }

  // Gets all sink blocs in the graph (Inputs only)
  public GetSinkBlocks(): string[] {
    return this.blocks.filter((b) => b.outputPorts.length === 0).map((b) => b.id);
  }

  // Gets all blocks connected to the output of a block
  public GetAdjacentBlocks(blockId: string): string[] {
    return this.edges.filter((e) => e.output.blockID === blockId).map((e) => e.input.blockID);
  }

  // A depth first search of the graph
  public DFS(startBlock: string): string[] {
    // Construct an array to hold which blocks have been visited
    const visited: boolean[] = Array(this.blocks.length);

    // Create an anonymous function which traverses the graph in a depth wise recursive mannor
    const dfsutil: {
      (arg0: string, arg1: boolean[]): string[];
      (blockId: string, tempVisited: boolean[]): string[];
    } = (blockId: string, tempVisited: boolean[]): string[] => {
      // on the current block, mark the index in visited as visited
      const tmpVisited = tempVisited;
      tmpVisited[this.blocks.findIndex((b) => b.id === blockId)] = true;

      // create a return list of block id's which the current block touches, then push the current block
      let retList: string[] = [];
      retList.push(blockId);

      // Get the blocks adjaccent to the current block and recursivly add the adjacent blocks to the list
      // if the adjacent block has not already been visited
      this.GetAdjacentBlocks(blockId).forEach((adjBlock) => {
        if (!tmpVisited[this.blocks.findIndex((b) => b.id === adjBlock)]) {
          retList = retList.concat(dfsutil(adjBlock, tmpVisited));
        }
      });

      return retList;
    };

    // Start the recursion
    return dfsutil(startBlock, visited);
  }

  // Classifies the types of edges of the graph
  public ClassifyEdges(): { [edgeId: string]: EdgeTypes } {
    // Convert all the blocks to "DFS Blocks" which tracks the node completion start and stop of each block
    const dfsBlocks: DFSBlockType[] = this.blocks.map((b) => ({
      blockId: b.id,
      nodeCompletion: 'WHITE',
      d: -1,
      f: -1
    }));

    // Start a counter for the node completion
    let t = 0;

    // Create a recursive function to track the completion of each block
    const dfsVisit: { (arg0: number): void; (index: number): void } = (index: number) => {
      // Set the nodeCompletion as started (GRAY)
      dfsBlocks[index].nodeCompletion = 'GRAY';

      // Set the start of the block as t then increase the count
      dfsBlocks[index].d = t;
      t += 1;

      //  For each adjacent block visit each adjacent block if it has not already been started (white)
      this.GetAdjacentBlocks(dfsBlocks[index].blockId)
        .map((b) => dfsBlocks.findIndex((b2) => b2.blockId === b))
        .forEach((bInd) => {
          if (dfsBlocks[bInd].nodeCompletion === 'WHITE') {
            dfsVisit(bInd);
          }
        });

      // Finish off the current block by setting it to compleeted "BLACK"
      // Set its finish position with the counter then increase the counter
      dfsBlocks[index].nodeCompletion = 'BLACK';
      dfsBlocks[index].f = t;
      t += 1;
    };

    // Run through each block and visit it if it has not already been visited
    dfsBlocks.forEach((b, i) => {
      if (b.nodeCompletion === 'WHITE') {
        dfsVisit(i);
      }
    });

    // Finally, run through each edge and classify according to the start and stop points
    const retVec: { [edgeId: string]: EdgeTypes } = {};
    this.edges.forEach((e) => {
      // Get where each edge leaves and comes back within the dfsblocks
      const outBlock = dfsBlocks.find((b) => b.blockId === e.output.blockID)!;
      const inBlock = dfsBlocks.find((b) => b.blockId === e.input.blockID)!;

      // Classify
      if (inBlock.d - outBlock.d === 1 || outBlock.f - inBlock.f === 1) {
        retVec[e.id] = 'TREE';
      } else if (inBlock.d - outBlock.d < 0 && outBlock.f - inBlock.f < 0) {
        retVec[e.id] = 'BACK';
      } else if (inBlock.d - outBlock.d > 0 && outBlock.f - inBlock.f > 0) {
        retVec[e.id] = 'FORWARD';
      } else {
        retVec[e.id] = 'CROSS';
      }
    });

    // Return the map
    return retVec;
  }

  // Reverse all the edges of the graph
  public Transpose(): Graph {
    const tmpGraphStorage = this.ToStorage();
    tmpGraphStorage.blocks = tmpGraphStorage.blocks.map((block) => {
      const tmpBlock = _.cloneDeep(block);
      tmpBlock.inputPorts = block.outputPorts;
      tmpBlock.outputPorts = block.inputPorts;
      tmpBlock.callbackString = '';

      return tmpBlock;
    });

    tmpGraphStorage.edges = tmpGraphStorage.edges.map((edge) => {
      const tmpEdge = _.cloneDeep(edge);
      tmpEdge.input = edge.output;
      tmpEdge.output = edge.input;

      return tmpEdge;
    });

    return new Graph(tmpGraphStorage);
  }

  // A function to find all the strongly connected groups of the graph
  public SCC(): string[][] {
    // Create a list to hold visited nodes and the finish order
    const visited: string[] = [];
    const stack: string[] = [];

    // Recursive function to visit all the nodees
    const visit = (blockId: string) => {
      // if a node has not been visited
      if (!visited.includes(blockId)) {
        // push it to the visited list and visit all its neighbors
        visited.push(blockId);
        this.GetAdjacentBlocks(blockId).forEach((adjBlock) => {
          visit(adjBlock);
        });

        // add the block to the stack
        stack.unshift(blockId);
      }
    };

    // visit each node in the graph
    this.blocks.forEach((block) => {
      visit(block.id);
    });

    // Second part of function
    // create a new visited list and a list to hold the component groups
    const visited2: string[] = [];
    const retVar: string[][] = [];

    // reverse the graph
    const graphRev = this.Transpose();

    // A new recusive function to visit all the nodes of the stack
    const visit2 = (blockId: string, group: string[] = []) => {
      // if the node hasnt been visited
      if (!visited2.includes(blockId)) {
        // mark it as visited then recursivly visit its neighbors
        visited2.push(blockId);
        graphRev.GetAdjacentBlocks(blockId).forEach((adjBlock) => {
          visit2(adjBlock, group);
        });

        // finally push the block to the group and if the block
        // was not already added to the return var push it
        // this works because of references
        group.unshift(blockId);
        if (!retVar.includes(group)) retVar.push(group);
      }
    };

    // visit each node in the stack
    stack.forEach((s) => {
      visit2(s);
    });

    return retVar;
  }

  // Checks if the graph has at least one source block in each strongly connected group\
  public isValidGraph(): boolean {
    const groups = this.SCC();
    const sources = this.GetSourceBlocks();
    const sinks = this.GetSinkBlocks();

    // checks if each group contians atleast one source or pseudo source
    const reducer = (accumulator: boolean, item: string[]) =>
      accumulator && item.filter((value) => sources.concat(...sinks).includes(value)).length > 0;

    return groups.reduce(reducer, true);
  }

  // Gets the compile order the graph has to follow to execute
  public GetBlockCompileOrder(): string[] {
    // Initialize the compile order return variable
    const compileOrder: string[] = [];

    // Initialize an array to hold the id of a variable and the number of inputs that have not been convered
    const filledInputs = this.blocks.map((b) => ({
      bId: b.id,
      inputsLeft: b.inputPorts.length
    }));

    this.GetSinkBlocks();

    // loop through each of the source blocks
    this.GetSourceBlocks().forEach((source) => {
      // push the source to the comp order if not already pushed
      if (!compileOrder.includes(source)) compileOrder.push(source);

      // get a map of all the blocks in dfs order from each source block then filter it to remove
      // variables already included in the comp order
      // map each of these blocks to their respective index in the filled input array
      // finally loop throough each index and subtract 1 from the array
      // if the inputs left reaches 0 add it to the compile order
      this.GetAdjacentBlocks(source)
        .flatMap((adjBlock) => this.DFS(adjBlock))
        .filter((dfsBlock) => !compileOrder.includes(dfsBlock))
        .map((dfsBlock) => filledInputs.findIndex((b) => b.bId === dfsBlock))
        .forEach((filledInd) => {
          filledInputs[filledInd].inputsLeft -= 1;
          if (filledInputs[filledInd].inputsLeft === 0) compileOrder.push(filledInputs[filledInd].bId);
        });
    });

    // Move all sinks to the end of the compile order
    this.GetSinkBlocks().forEach((sink) => {
      // Get the index of the sink
      const sinkInd = compileOrder.indexOf(sink);

      if (sinkInd > -1) {
        // Remove the sink from the compile order
        compileOrder.splice(sinkInd, 1);

        // push it to the end of the list
        compileOrder.push(sink);
      }
    });

    return compileOrder;
  }

  // Executes the current graph
  public Execute(T: number | 'infinite', dt: number): void {
    // Clear visualization data buffers for all blocks with visualization enabled
    this.blocks.forEach((block) => {
      if (block.visualizationConfig) {
        block.ClearVisualizationData();
        block.InitializeVisualization();
      }
    });

    // Set the simulation time to 0.0 time
    let t = 0.0;

    // Get the compile order the blocks need to be in
    const blockCompOrder = this.GetBlockCompileOrder();

    // Create an anonomous function to set up each simulation loop
    const executeFunc = () => {
      // for each block in the ccompile order
      blockCompOrder.forEach((bId) => {
        // Get the block
        const block = this.blocks.find((b) => b.id === bId)!;

        // Loop through the block's inputs to find their corresponding output values
        const newInputs = block.inputPorts.map((inputPort) => {
          // Debug: log all edges for this block
          if (block.name === 'scope' && inputPort.name === 'x') {
            console.log(
              `[Graph.Execute] scope block ID: ${bId}, inputPort name: ${inputPort.name}, inputPort id: ${inputPort.id}`
            );
            console.log(
              `[Graph.Execute] All edges:`,
              this.edges.map((e) => ({
                edgeId: e.id,
                inputBlockID: e.input.blockID,
                inputPortID: e.input.portID,
                outputBlockID: e.output.blockID,
                outputPortID: e.output.portID
              }))
            );
          }

          // Get the edge to connect the block to its corresponding output block and port
          // Try matching by port name first
          let edge = this.edges.find((e) => e.input.blockID === bId && e.input.portID === inputPort.name);

          // If not found, try matching by port ID
          if (!edge) {
            edge = this.edges.find((e) => e.input.blockID === bId && e.input.portID === inputPort.id);
          }

          if (edge) {
            if (block.name === 'scope' && inputPort.name === 'x') {
              console.log(
                `[Graph.Execute] Found edge! edge ID: ${edge.id}, input.portID: ${edge.input.portID}, output.portID: ${edge.output.portID}`
              );
            }
            // Input port has an edge connected - get value from connected output port
            const outputBlock = this.blocks.find((b) => b.id === edge.output.blockID);
            if (outputBlock) {
              // Try matching by port name first
              let outputPort = outputBlock.outputPorts.find((p) => p.name === edge.output.portID);
              // If not found, try matching by port ID
              if (!outputPort) {
                outputPort = outputBlock.outputPorts.find((p) => p.id === edge.output.portID);
              }
              if (outputPort) {
                // return the output value for that port
                const value = outputPort.GetObjectValue();
                if (block.name === 'scope' && inputPort.name === 'x') {
                  console.log(
                    `[Graph.Execute] scope input ${inputPort.name}: reading from block ${outputBlock.name} port ${edge.output.portID}, value=${value}`
                  );
                }
                return value;
              }
            }
          }

          // No edge connected - use the input port's current value (for source blocks or unconnected inputs)
          // This allows blocks to work as sources or use their initial values
          const value = inputPort.GetObjectValue();
          if (block.name === 'scope' && inputPort.name === 'x') {
            console.log(
              `[Graph.Execute] scope input ${inputPort.name}: no edge connected, using default value=${value}`
            );
          }
          return value;
        });

        // Debug logging for scope block
        if (block.name === 'scope') {
          console.log(`[Graph.Execute] scope newInputs:`, newInputs);
        }

        // execute the block with these new inputs
        block.Execute(t, dt, newInputs);
      });
    };

    // if the execution has not been set to execution mode
    if (T !== 'infinite') {
      let iterationCount = 0;
      // loop until the sim time has exceeded the end time
      while (t < T + dt) {
        if (iterationCount < 5 || iterationCount % 100 === 0) {
          console.log(`[Graph.Execute] iteration=${iterationCount}, t=${t}, dt=${dt}, T=${T}`);
        }
        executeFunc();

        // Add the delta time to the simulation time
        t += dt;
        iterationCount++;
      }
      console.log(`[Graph.Execute] Completed ${iterationCount} iterations`);
    }
  }

  /**
   * Get visualization data for all blocks that have visualization enabled
   * @returns Map of block ID to visualization data
   */
  public GetVisualizationData(): Record<string, import('../Network/GraphItemStorage/BlockStorage').VisualizationData> {
    const visualizationDataMap: Record<string, import('../Network/GraphItemStorage/BlockStorage').VisualizationData> =
      {};

    this.blocks.forEach((block) => {
      if (block.visualizationConfig && block.visualizationData) {
        visualizationDataMap[block.id] = block.visualizationData;
      }
    });

    return visualizationDataMap;
  }

  /**
   * Get visualization data for a specific block
   * @param blockId - The ID of the block
   * @returns Visualization data for the block, or undefined if not found or no visualization enabled
   */
  public GetBlockVisualizationData(
    blockId: string
  ): import('../Network/GraphItemStorage/BlockStorage').VisualizationData | undefined {
    const block = this.blocks.find((b) => b.id === blockId);
    if (!block || !block.visualizationConfig || !block.visualizationData) {
      return undefined;
    }
    return block.visualizationData;
  }

  // Create a graph storage object
  public ToStorage(): GraphStorageType {
    return {
      blocks: this.blocks.map((b) => b.ToStorage()),
      edges: this.edges.map((e) => e.ToStorage())
    };
  }
}

export default Graph;
