<template>
  <div id="app" class="row">
    <div id="toolbar" class="column">
      <div class="column padded">
        <div class="label">Graph</div>
        <div class="button" @click="onSaveClick">Save</div>
        <div class="button" @click="onLoadClick">Load</div>
        <div class="button" @click="onResetClick">Reset</div>
      </div>
      <div class="column padded">
        <div class="label">Algorithm</div>
        <div class="button" :class="{'button--disabled': initiatorId < 0}" @click="onStartClick">Start</div>
        <div class="button" :class="{'button--disabled': !hasStarted }" @click="onNextStepClick">Next step</div>
      </div>
      <div class="column padded">
        <div class="label">Modes</div>
        <div
          v-for="mode in modes"
          :key="mode"
          class="button"
          :class="{ 'button--pressed': isMode(mode) }"
          @click="onSetModeClick(mode)"
        >
          {{ modeCaption[mode] }}
        </div>
      </div>
      <div class="column padded">
        <div class="label">Selection</div>
        <div class="text" v-for="row in currentSelection" :key="row">{{ row }}</div>
      </div>
    </div>
    <div ref="wrapper" class="wrapper">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        :viewBox="viewBox"
        @mousedown="onSvgMouseDown"
        @mousemove="onSvgMouseMove"
        @mouseenter="isMouseTracking = true"
        @mouseleave="isMouseTracking = false"
      >
        <Edge
          v-for="edge in edges"
          :key="edge.edgeId"
          :state="$store.state"
          v-bind="edge"
          @missing-node="onMissingNode"
        />
        <Node
          v-for="node in nodes"
          :key="node.nodeId"
          :state="$store.state"
          v-bind="node"
        />
      </svg>
    </div>
  </div>
</template>

<script>
import Node from './components/Node'
import Edge from './components/Edge'
import { dashedIfNegative, findNodeById, getBlockDims, getDatasetNumberValue } from './utils'
import { Direction } from './types'
import { formAdjacencyList, nodes, performNextStep, startEcho } from './utils/echo'

const Mode = {
  PLACE_NODE: 0,
  CONNECT: 1,
  DELETE: 2,
  MOVE_NODE: 3,
  PICK_INITIATOR: 4
}

const ModeCaption = {
  [Mode.PLACE_NODE]: 'Place node',
  [Mode.CONNECT]: 'Connect',
  [Mode.DELETE]: 'Delete',
  [Mode.MOVE_NODE]: 'Move node',
  [Mode.PICK_INITIATOR]: 'Pick initiator'
}

export default {
  name: 'app',
  components: { Edge, Node },
  data: () => ({
    w: 0,
    h: 0,
    modes: Object.values(Mode),
    modeCaption: ModeCaption,
    mode: Mode.PLACE_NODE,
    isMouseTracking: false,
    hasStarted: false,
    lastNodeId: 0,
    lastEdgeId: 0,
    firstConnectingNodeId: -1,
    secondConnectingNodeId: -1,
    movingNodeId: -1,
    mouse: {
      x: 0,
      y: 0
    }
  }),
  methods: {
    createNode (x, y) {
      this.lastNodeId++

      return {
        nodeId: this.lastNodeId,
        nodeValue: 0,
        x,
        y,
        isActivated: false
      }
    },
    createEdge () {
      this.lastEdgeId++

      return {
        edgeId: this.lastEdgeId,
        firstNodeId: this.firstConnectingNodeId,
        secondNodeId: this.secondConnectingNodeId,
        isToParent: false,
        isToChild: false,
        direction: Direction.NONE
      }
    },
    isMode (mode) {
      return this.mode === mode
    },
    getWrapperDims () {
      return getBlockDims(this.$refs.wrapper)
    },
    setDims ({ w, h }) {
      this.w = w
      this.h = h
    },
    setMouseCoords ({ offsetX, offsetY }) {
      this.mouse.x = offsetX
      this.mouse.y = offsetY
    },
    resetIdsForConnecting () {
      this.firstConnectingNodeId = -1
      this.secondConnectingNodeId = -1
    },
    updateVisualization () {
      console.log(nodes)

      this.edges.forEach(edge => (edge.direction = Direction.NONE))

      for (const nodeId in nodes) {
        const { id, activated, tokens, counter } = nodes[nodeId]

        const currentNode = this.nodes.find(findNodeById, { id })

        currentNode.isActivated = activated
        currentNode.nodeValue = counter

        if (!tokens.length) {
          continue
        }

        this.edges.forEach(edge => {
          const { firstNodeId, secondNodeId } = edge

          tokens.forEach(token => {
            if (firstNodeId === id && secondNodeId === token) {
              if (edge.direction === Direction.NONE) {
                edge.direction = Direction.BACKWARD
              } else if (edge.direction === Direction.FORWARD) {
                edge.direction = Direction.BOTH
              }
            } else if (firstNodeId === token && secondNodeId === id) {
              if (edge.direction === Direction.NONE) {
                edge.direction = Direction.FORWARD
              } else if (edge.direction === Direction.BACKWARD) {
                edge.direction = Direction.BOTH
              }
            }
          })
        })
      }
    },
    onSetModeClick (mode) {
      this.mode = mode
    },
    onMissingNode (edgeId) {
      this.$store.commit('REMOVE_EDGE', edgeId)
    },
    onKeyUp (event) {
      event.preventDefault()
      console.log(event)
    },
    onResize () {
      console.log(getBlockDims(this.$refs.wrapper))
      this.setDims(this.getWrapperDims())
    },
    onSvgMouseMove (ev) {
    },
    onStartClick () {
      if (this.initiatorId < 0) return

      startEcho(formAdjacencyList(this.nodes, this.edges), this.initiatorId)

      this.updateVisualization()
      this.hasStarted = true
    },
    onNextStepClick () {
      if (!this.hasStarted) return

      const isFinished = performNextStep()

      this.updateVisualization()

      if (isFinished) {
        this.hasStarted = false
      }
    },
    onSaveClick () {
      localStorage.setItem('lastEdgeId', this.lastEdgeId)
      localStorage.setItem('lastNodeId', this.lastNodeId)
      localStorage.setItem('nodes', JSON.stringify(this.nodes))
      localStorage.setItem('edges', JSON.stringify(this.edges))
    },
    async onLoadClick () {
      this.lastEdgeId = Number(localStorage.getItem('lastEdgeId'))
      this.lastNodeId = Number(localStorage.getItem('lastNodeId'))
      this.$store.commit('SET_NODES', JSON.parse(localStorage.getItem('nodes')))
      this.$store.commit('SET_EDGES', JSON.parse(localStorage.getItem('edges')))
    },
    onResetClick () {
      this.$store.commit('SET_NODES', [])
      this.$store.commit('SET_EDGES', [])
      this.lastNodeId = 0
      this.lastEdgeId = 0
    },
    onSvgMouseDown (ev) {
      const { target, offsetX: x, offsetY: y } = ev
      console.log(ev)
      console.log(x, y)

      switch (this.mode) {
        case Mode.PLACE_NODE:
          if (target.tagName === 'svg') {
            this.$store.commit('PUSH_NODE', this.createNode(x, y))
          }
          break
        case Mode.CONNECT:
          if (this.firstConnectingNodeId < 0) {
            this.firstConnectingNodeId = getDatasetNumberValue(target)('nodeId')
          } else {
            if (this.secondConnectingNodeId < 0) {
              this.secondConnectingNodeId = getDatasetNumberValue(target)('nodeId')

              if (this.secondConnectingNodeId >= 0) {
                if (this.firstConnectingNodeId === this.secondConnectingNodeId) {
                  this.secondConnectingNodeId = -1
                } else {
                  const existingEdge = this.edges.find(
                    edge => (
                      edge.firstNodeId === this.firstConnectingNodeId &&
                      edge.secondNodeId === this.secondConnectingNodeId
                    ) || (
                      edge.firstNodeId === this.secondConnectingNodeId &&
                      edge.secondNodeId === this.firstConnectingNodeId
                    )
                  )

                  if (existingEdge) return

                  this.$store.commit('PUSH_EDGE', this.createEdge())
                  this.resetIdsForConnecting()
                }
              }
            }
          }
          break
        case Mode.MOVE_NODE:
          if (this.movingNodeId < 0) {
            this.movingNodeId = getDatasetNumberValue(target)('nodeId')
          } else {
            const movingNode = this.nodes.find(v => v.nodeId === this.movingNodeId)

            if (movingNode !== undefined) {
              movingNode.x = x
              movingNode.y = y
            }

            this.movingNodeId = -1
          }
          break
        case Mode.DELETE: {
          const nodeId = getDatasetNumberValue(target)('nodeId')
          const edgeId = getDatasetNumberValue(target)('edgeId')

          if (nodeId < 0 && edgeId < 0) {
            return
          }

          if (nodeId > 0) {
            this.$store.commit('REMOVE_NODE', nodeId)
          }

          if (edgeId > 0) {
            this.$store.commit('REMOVE_EDGE', edgeId)
          }
          break
        }
        case Mode.PICK_INITIATOR: {
          const nodeId = getDatasetNumberValue(target)('nodeId')

          if (nodeId > 0) {
            this.initiatorId = nodeId
          }
        }
      }
    }
  },
  computed: {
    initiatorId: {
      get () { return this.$store.state.initiatorId },
      set (v) { this.$store.commit('SET_INITIATOR_ID', v) }
    },
    nodes: vm => vm.$store.state.nodes,
    edges: vm => vm.$store.state.edges,
    viewBox: vm => `0 0 ${vm.w} ${vm.h}`,
    mousePos: vm => `${vm.mouse.x} ${vm.mouse.y}`,
    calcStyle: vm => ({
      left: `${vm.mouse.x + 120 + 15}px`,
      top: `${vm.mouse.y + 5}px`
    }),
    isAddNodeMode: vm => vm.mode === Mode.PLACE_NODE,
    currentSelection: vm => {
      switch (vm.mode) {
        case Mode.MOVE_NODE:
          return [`Moving node: ${dashedIfNegative(vm.movingNodeId)}`]
        case Mode.CONNECT:
          return [
            `First node: ${dashedIfNegative(vm.firstConnectingNodeId)}`,
            `Second node: ${dashedIfNegative(vm.secondConnectingNodeId)}`
          ]
        default: return []
      }
    }
  },
  mounted () {
    console.log(this.getWrapperDims())
    this.setDims(this.getWrapperDims())
    window.addEventListener('keyup', this.onKeyUp)
    window.addEventListener('resize', this.onResize)
  }
}
</script>

<style lang="scss">
  body {
    margin: 0;
  }

  .row {
    display: flex
  }

  .column {
    display: flex;
    flex-direction: column;
  }

  .padded {
    padding: 10px 10px 0 10px;
    & > *:not(:last-child) {
      margin-bottom: 10px;
    }
  }

  .text {
    font: 400 12px/12px Helvetica, 'Segoe UI', sans-serif;
    color: purple;
  }

  .label {
    text-align: center;
    color: purple;
    font: 800 12px/20px Helvetica, 'Segoe UI', sans-serif;
    margin-left: 20px;
    margin-right: 20px;
    border-bottom: 1px purple solid;
  }

  .button {
    width: 100px;
    text-align: center;
    border-radius: 20px;
    height: 30px;
    border: 1px solid purple;
    background: transparent;
    font: 400 12px/30px Helvetica, 'Segoe UI', sans-serif;
    color: purple;
    transition: transform .3s ease-out, color .3s ease-out, background .3s ease-out;
    cursor: pointer;
    &:not(&--disabled):hover {
      transform: scale(1.05);
    }
    &:not(&--disabled):active {
      transform: scale(0.95);
    }
    &--pressed {
      background: purple;
      color: #ffd3d3
    }
    &--disabled {
      background: #9e7194;
    }
  }

  #app {
    & > #toolbar {
      overflow-y: scroll;
      width: 120px;
      height: 100vh;
      /* Permalink - use to edit and share this gradient: https://colorzilla.com/gradient-editor/#ffd3d3+10,f9e2ff+100 */
      background: #ffd3d3; /* Old browsers */
      background: -moz-linear-gradient(left, #ffd3d3 10%, #f9e2ff 100%); /* FF3.6-15 */
      background: -webkit-linear-gradient(left, #ffd3d3 10%, #f9e2ff 100%); /* Chrome10-25,Safari5.1-6 */
      background: linear-gradient(to right, #ffd3d3 10%, #f9e2ff 100%); /* W3C, IE10+, FF16+, Chrome26+, Opera12+, Safari7+ */
      filter: progid:DXImageTransform.Microsoft.gradient(startColorstr='#ffd3d3', endColorstr='#f9e2ff', GradientType=1); /* IE6-9 */

    }
    width: 100vw;
    height: 100vh;
    & > .wrapper {
      width: calc(100vw - 120px);
      height: 100vh;
      & > .mouse-helper {
        font: 12px monospace;
        position: absolute
      }
      & > svg {
        cursor: pointer;
      }
    }
  }

  circle, line {
    stroke-width: 3;
  }

  @keyframes forward {

  }

  .edge {
    &__line {
      stroke: black;

      &--parent {
        stroke: limegreen;
      }

      &--child {
        stroke: coral;
      }
    }

    &__circle {
      stroke: magenta;
      fill: white;

      &--activated {
        stroke: #007bff;
      }
    }
  }

</style>
