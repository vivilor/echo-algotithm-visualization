import Vue from 'vue'
import Vuex from 'vuex'
import { findEdgeById, findNodeById } from './utils'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    nodes: [],
    edges: [],
    initiatorId: -1
  },
  mutations: {
    SET_NODES (state, nodes) {
      state.nodes = nodes
    },
    SET_EDGES (state, edges) {
      state.edges = edges
    },
    PUSH_NODE (state, node) {
      state.nodes.push(node)
    },
    PUSH_EDGE (state, edge) {
      state.edges.push(edge)
    },
    REMOVE_NODE (state, nodeId) {
      const removingNode = state.nodes.find(findNodeById, { id: nodeId })
      const removingNodeIndex = state.nodes.indexOf(removingNode)

      if (removingNodeIndex < 0) return

      state.nodes.splice(removingNodeIndex, 1)
    },
    REMOVE_EDGE (state, edgeId) {
      const removingEdge = state.edges.find(findEdgeById, { id: edgeId })
      const removingEdgeIndex = state.edges.indexOf(removingEdge)

      if (removingEdgeIndex < 0) return

      state.edges.splice(removingEdgeIndex, 1)
    },
    SET_INITIATOR_ID (state, id) {
      state.initiatorId = id
    }
  }
})
