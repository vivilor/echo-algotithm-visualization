<script>
import { bem } from '../utils'

const prefixedId = id => `#${id}`

export default {
  name: 'Node',
  functional: true,
  props: {
    nodeId: Number,
    nodeValue: Number,
    x: Number,
    y: Number,
    isActivated: Boolean,
    state: Object
  },
  render: (h, ctx) => {
    const { props } = ctx

    const nodeCircle = h(
      'circle',
      {
        attrs: {
          cx: props.x,
          cy: props.y,
          r: 20,
          fill: props.state.initiatorId === props.nodeId ? 'pink' : 'white'
        },
        class: {
          [bem('node', 'circle')]: true,
          [bem('node', 'circle', 'activated')]: props.isActivated
        }
      }
    )

    const nodeIndex = h(
      'text',
      {
        attrs: {
          x: props.x,
          y: props.y - 2,
          'text-anchor': 'middle'
        },
        class: { [bem('node', 'index')]: true }
      },
      [prefixedId(props.nodeId)]
    )

    const nodeValue = h(
      'text',
      {
        attrs: {
          x: props.x,
          y: props.y + 12,
          'text-anchor': 'middle'
        },
        class: { [bem('node', 'value')]: true }
      },
      [props.nodeValue]
    )
    return h(
      'g',
      {
        class: 'node',
        attrs: { 'data-node-id': props.nodeId }
      },
      [
        nodeCircle,
        nodeIndex,
        nodeValue
      ]
    )
  }
}
</script>

<style lang="scss">
  .node {
    stroke: cadetblue;
    stroke-width: 2;
    &__circle {
      stroke: #001e6e;

      &--activated {
        stroke: #00a608;
      }
    }

    &__index {
      stroke-width: 0;
      font: 900 12px/16px monospace;
      fill: #9e0967;
    }

    &__value {
      stroke-width: 0;
      font: 300 12px/16px monospace;
      fill: darkblue;
    }
  }
</style>
