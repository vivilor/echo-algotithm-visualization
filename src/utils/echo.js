class Node {
  constructor ({ id, neighbours }) {
    this.id = id
    this.neighbours = neighbours
    this.tokens = []
    this.counter = 0
    this.parent = null
    this.children = []
    this.activated = false

    this.initiate = this.initiate.bind(this)
    this.sendTokens = this.sendTokens.bind(this)
    this.receiveToken = this.receiveToken.bind(this)
    this.handleToken = this.handleToken.bind(this)
  }

  initiate () {
    this.sendTokens()
  }

  sendTokens () {
    this.children = this.neighbours.filter((nodeId) => nodeId !== this.parent)
    this.children.forEach((nodeId) => nodes[nodeId].receiveToken(this.id))
    this.activated = true
  }

  receiveToken (nodeId) {
    this.tokens.push(nodeId)
  }

  handleToken () {
    const nodeId = this.tokens.shift()
    if (!this.activated) {
      this.parent = nodeId
      this.sendTokens()
    }
    this.counter++
    if (this.counter === this.neighbours.length) {
      if (this.parent !== null) {
        nodes[this.parent].tokens.push(this.id)
      } else {
        return true
      }
    }
    return false
  }
}

export let nodes = {}

export function performNextStep () {
  const node = Object.values(nodes).find(node => node.tokens.length)
  return node.handleToken()
}

export function formAdjacencyList (nodes, edges) {
  return nodes.map(({ nodeId }) => {
    const neighbours = []

    edges.forEach(({ firstNodeId, secondNodeId }) => {
      if (firstNodeId === nodeId && !neighbours.includes(secondNodeId)) {
        neighbours.push(secondNodeId)
      } else if (secondNodeId === nodeId && !neighbours.includes(firstNodeId)) {
        neighbours.push(firstNodeId)
      }
    })

    return {
      id: nodeId,
      neighbours: neighbours
    }
  })
}

export function startEcho (initNodes, initiatorId) {
  nodes = {}

  initNodes.forEach(node => (nodes[node.id] = new Node(node)))

  nodes[initiatorId].initiate()
}
