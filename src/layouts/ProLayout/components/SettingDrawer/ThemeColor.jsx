import _mergeJSXProps from 'babel-helper-vue-jsx-merge-props'
// import _objectWithoutProperties from 'babel-runtime/helpers/objectWithoutProperties'
import './ThemeColor.less'

import PropTypes from 'ant-design-vue/es/_util/vue-types'
import { Tooltip, Icon } from 'ant-design-vue'
import { defaultI18nRender } from './index'
import { genThemeToString } from '../../utils/util'

var baseClassName = 'theme-color'

export var TagProps = {
  color: PropTypes.string,
  check: PropTypes.bool
}

var Tag = {
  props: TagProps,
  functional: true,
  render: function render (h, content) {
    var _content$props = content.props
    var color = _content$props.color
    var check = _content$props.check
    var data = content.data
    // var rest = _objectWithoutProperties(content, ['props', 'data'])

    return h(
      'div',
      _mergeJSXProps([data, { style: { backgroundColor: color } }]),
      [check ? h(Icon, {
        attrs: { type: 'check' }
      }) : null]
    )
  }
}

export var ThemeColorProps = {
  colors: PropTypes.array,
  title: PropTypes.string,
  value: PropTypes.string,
  i18nRender: PropTypes.func
}

var ThemeColor = {
  props: ThemeColorProps,
  inject: ['locale'],
  render: function render (h) {
    var _this = this

    var title = this.title
    var value = this.value
    var _colors = this.colors
    var colors = _colors === undefined ? [] : _colors

    var i18n = this.$props.i18nRender || this.locale || defaultI18nRender
    var handleChange = function handleChange (key) {
      _this.$emit('change', key)
    }

    return h(
      'div',
      { 'class': baseClassName, ref: 'ref' },
      [h(
        'h3',
        { 'class': baseClassName + '-title' },
        [title]
      ), h(
        'div',
        { 'class': baseClassName + '-content' },
        [colors.map(function (item) {
          var themeKey = genThemeToString(item.key)
          var check = value === item.key || genThemeToString(value) === item.key
          return h(
            Tooltip,
            {
              key: item.color,
              attrs: {
                title: themeKey ? i18n('app.setting.themecolor.' + themeKey) : item.key
              }
            },
            [h(Tag, {
              'class': baseClassName + '-block',
              attrs: {
                color: item.color,
                check: check
              },
              on: {
                'click': function click () {
                  return handleChange(item.key)
                }
              }
            })]
          )
        })]
      )]
    )
  }
}

export default ThemeColor
