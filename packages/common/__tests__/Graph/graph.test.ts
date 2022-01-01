import * as fs from 'fs';
import * as path from 'path';

import {GraphStorageType, isGraphStorageType} from "../../src/Network/GraphItemStorage/GraphStorage";
import {Graph} from "../../src/Graph/Graph";

describe("Graph Tests", () => {
    let json: any;
    let graphStorage: GraphStorageType
    beforeAll(() => {
        json =  JSON.parse(fs.readFileSync(path.join(__dirname, "..", "Resources", "TestGraph.json"),
            {encoding:'utf8', flag:'r'}));
    });

   describe("Graph Storage Tests", () => {
       test("Graph storage is valid", () => {
          expect(isGraphStorageType(json)).toBeTruthy();

          graphStorage = json;
       });

       test("Graph storage is not valid", () => {
           const graphStorage2 = {
               blocks: [{
                   id: "", name: "", tags: [], description: "", callbackString: "",
                   inputPorts: [{id: "", name: "", type: "STRING", initialValue: 0}],
                   outputPorts: [{id: "", name: "", type: "STRING", initialValue: ""}]
               }],
               edges: []
           }
           expect(isGraphStorageType(graphStorage2)).not.toBeTruthy();
       });
   });

   describe("Graph Tests", () => {
       let graph: Graph;
       beforeEach(() => {
           graph = new Graph(graphStorage);
       });

       describe("Block Tests", () => {
           test("Add Block Test", () => {
               graph.AddBlock({
                   name: "test",
                   tags: [],
                   description: "",
                   callbackString: "",
                   inputPorts: [{name: "", type: "STRING", initialValue: ""}],
                   outputPorts: [{name: "", type: "STRING", initialValue: ""}]
               });

               expect(graph.blocks.length).toBe(graphStorage.blocks.length + 1);
           });

           test("Can Remove Block", () => {
               expect(() => graph.RemoveBlock("test")).toThrowError();

               graph.RemoveBlock(graph.blocks[0].id);
               expect(graph.blocks.length).toBe(graphStorage.blocks.length - 1)
               expect(graph.edges.length).toBe(graphStorage.edges.length - 1)
           });
       });

        describe("Add edge tests", () => {
            test("Edge already exists", () => {
                graph.AddEdge("1", "1oa", "2", "2ia");
                expect(graph.edges.length).toBe(graphStorage.edges.length);
            });

            test("Output block does not exist", () => {
                expect(() => graph.AddEdge("test", "1oa", "2", "2ia"))
                    .toThrowError()
            });

            test("Output port does not exist", () => {
                expect(() => graph.AddEdge("1", "test", "2", "2ia"))
                    .toThrowError()
            });

            test("Input block does not exist", () => {
                expect(() => graph.AddEdge("1", "1oa", "test", "2ia"))
                    .toThrowError()
            });

            test("Input port does not exist", () => {
                expect(() => graph.AddEdge("1", "1oa", "2", "test"))
                    .toThrowError()
            });

            test("Differing port types", () => {
                const b1 = graph.AddBlock({
                    name: "b1", description: "", tags: [], callbackString: "",
                    outputPorts: [
                        { type: "STRING", initialValue: "", name: "6ia"}
                    ], inputPorts: []
                });
                expect(() => graph.AddEdge("1", "1oa", b1, graph.blocks.find(b => b.id === b1)!.outputPorts[0].id))
                    .toThrowError()
            });

            test("Cannot add an edge to a filled input port", () => {
                expect(() => graph.AddEdge("3", "3oa", "2", "2ia"))
                    .toThrowError();
            });

            test("Can add an edge", () => {
                const id = graph.AddBlock({
                    name: "scope2", description: "", tags: [],
                    inputPorts: [{ name: "6ia", type: "NUMBER", initialValue: 0}],
                    outputPorts: [],
                    callbackString: ""
                });
                graph.AddEdge("1", "1", id, graph.blocks.find(b => b.id === id)!.inputPorts[0].id);
                expect(graph.edges.length).toBe(graphStorage.edges.length + 1);
            });

            test("Can Remove Edge", () => {
                expect(() => graph.RemoveEdge("test")).toThrowError();

                graph.RemoveEdge(graph.edges[0].id);
                expect(graph.edges.length).toBe(graphStorage.edges.length - 1)
            });
        });

       test("Graph to storage", () => {
           expect(isGraphStorageType(graph.ToStorage())).toBeTruthy();
       });

       describe("Graph Theory Tests", () => {
           test("Get Adjacent Blocks", () => {
               const adjBlocks = graph.GetAdjacentBlocks("3");
               expect(adjBlocks).toContain("4");
               expect(adjBlocks).toContain("5");
           });

           test("Get Source Blocks", () => {
               const sources = graph.GetSourceBlocks();
               expect(sources).toEqual(["1"]);
           });

           test("Get Sink Blocks", () => {
               const sinks = graph.GetSinkBlocks();
               expect(sinks).toContain("5");
           });

           test("DFS Tests", () => {
               const dfs = graph.DFS("3");
               expect(dfs).toEqual(['3', '4', '2', '5'])
           });

           test("Edge Classifier", () => {
               const edgeTypes = graph.ClassifyEdges();
               expect(edgeTypes['1']).toBe("TREE");
               expect(edgeTypes['2']).toBe("TREE");
               expect(edgeTypes['3']).toBe("TREE");
               expect(edgeTypes['4']).toBe("BACK");
               expect(edgeTypes['5']).toBe("TREE");
           });

           test("Strongly Connected Components", () => {
               const scc = graph.SCC();
               expect(scc[0]).toContain("1");
               expect(scc[1]).toContain("2");
               expect(scc[1]).toContain("3");
               expect(scc[1]).toContain("4");
               expect(scc[2]).toContain("5");
           });
       });
   });
});