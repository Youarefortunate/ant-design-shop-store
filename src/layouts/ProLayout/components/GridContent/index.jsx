import _defineProperty from 'babel-runtime/helpers/defineProperty'
import './index.less'

var GridContent = {
  name: 'GridContent',
  functional: true,
  props: {
    children: {
      type: null,
      'default': null
    },
    contentWidth: {
      type: Boolean,
      'default': false
    }
  },
  render: function render (h, content) {
    var _classNames

    var propsContentWidth = content.props.contentWidth

    var children = content.children

    var classNames = (_classNames = {}, _defineProperty(_classNames, 'ant-pro-grid-content', true), _defineProperty(_classNames, 'wide', propsContentWidth), _classNames)

    return h(
      'div',
      { 'class': classNames },
      [children]
    )
  }
}

export default GridContent
