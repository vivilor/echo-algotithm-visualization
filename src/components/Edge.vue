<script>
import { findNodeById } from '../utils'
import { Direction } from '../types'

export default {
  functional: true,
  name: 'Edge',
  props: {
    edgeId: Number,
    firstNodeId: Number,
    secondNodeId: Number,
    direction: Direction,
    state: Object
  },
  render: (h, ctx) => {
    const { props, listeners } = ctx

    const firstNode = props.state.nodes.find(findNodeById, { id: props.firstNodeId })
    const secondNode = props.state.nodes.find(findNodeById, { id: props.secondNodeId })

    if (firstNode === undefined || secondNode === undefined) {
      console.log(firstNode, secondNode)
      listeners['missing-node']()
      return null
    }

    let x1 = firstNode.x
    let y1 = firstNode.y
    let x2 = secondNode.x
    let y2 = secondNode.y

    const length = Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2))

    const startRate = (20 / length)
    const finishRate = (length - 20) / length

    const dx = Math.abs(x2 - x1)
    const dy = Math.abs(y2 - y1)

    if (x1 < x2) {
      x2 = x1 + finishRate * dx
      x1 += startRate * dx
    } else {
      x2 = x1 - finishRate * dx
      x1 -= startRate * dx
    }

    if (y1 < y2) {
      y2 = y1 + finishRate * dy
      y1 += startRate * dy
    } else {
      y2 = y1 - finishRate * dy
      y1 -= startRate * dy
    }

    const line = h(
      'line',
      {
        class: {
          'edge__line': true,
          'edge__line--child': props.isToChild,
          'edge__line--parent': props.isToParent
        },
        attrs: {
          x1,
          x2,
          y1,
          y2
        }
      }
    )

    const circleStart = h(
      'circle',
      {
        attrs: {
          cx: x1,
          cy: y1,
          r: 8,
          fill: 'darkcyan'
        }
      }
    )

    const circleFinish = h(
      'circle',
      {
        attrs: {
          cx: x2,
          cy: y2,
          r: 8,
          fill: 'darkcyan'
        }
      }
    )

    let children = null

    switch (props.direction) {
      case Direction.NONE:
        children = [line]
        break
      case Direction.FORWARD:
        children = [line, circleFinish]
        break
      case Direction.BACKWARD:
        children = [line, circleStart]
        break
      case Direction.BOTH:
        children = [line, circleStart, circleFinish]
    }

    return h(
      'g',
      {
        class: 'edge',
        attrs: {
          'data-edge-id': props.edgeId
        }
      },
      children
    )
  }
}
</script>

<style scoped>

</style>
