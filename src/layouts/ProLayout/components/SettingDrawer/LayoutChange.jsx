import _extends from 'babel-runtime/helpers/extends'
import PropTypes from 'ant-design-vue/es/_util/vue-types'
import { List, Tooltip, Select, Switch } from 'ant-design-vue'
import { defaultI18nRender } from './index'

export var renderLayoutSettingItem = function renderLayoutSettingItem (h, item) {
  var action = _extends({}, item.action)
  return h(
    Tooltip,
    {
      attrs: { title: item.disabled ? item.disabledReason : '', placement: 'left' }
    },
    [h(
      List.Item,
      {
        attrs: { actions: [action] }
      },
      [h(
        'span',
        { style: { opacity: item.disabled ? 0.5 : 1 } },
        [item.title]
      )]
    )]
  )
}

export var LayoutSettingProps = {
  contentWidth: PropTypes.bool,
  fixedHeader: PropTypes.bool,
  fixSiderbar: PropTypes.bool,
  layout: PropTypes.oneOf(['sidemenu', 'topmenu'])
}

export default {
  props: LayoutSettingProps,
  inject: ['locale'],
  render: function render (h) {
    var _this = this

    var i18n = this.$props.i18nRender || this.locale || defaultI18nRender
    var contentWidth = this.contentWidth
    var fixedHeader = this.fixedHeader
    var layout = this.layout
    var fixSiderbar = this.fixSiderbar

    var handleChange = function handleChange (type, value) {
      _this.$emit('change', { type: type, value: value })
    }

    return h(List, {
      attrs: {
        split: false,
        dataSource: [{
          title: i18n('app.setting.content-width'),
          action: h(
            Select,
            {
              attrs: {
                value: contentWidth && 'Fixed' || 'Fluid',
                size: 'small'
              },
              on: {
                'select': function select (value) {
                  return handleChange('contentWidth', value)
                }
              },

              style: { width: '80px' }
            },
            [layout === 'sidemenu' ? null : h(
              Select.Option,
              {
                attrs: { value: 'Fixed' }
              },
              [i18n('app.setting.content-width.fixed')]
            ), h(
              Select.Option,
              {
                attrs: { value: 'Fluid' }
              },
              [i18n('app.setting.content-width.fluid')]
            )]
          )
        }, {
          title: i18n('app.setting.fixedheader'),
          action: h(Switch, {
            attrs: {
              size: 'small',
              checked: !!fixedHeader
            },
            on: {
              'change': function change (checked) {
                return handleChange('fixedHeader', checked)
              }
            }
          })
        }, {
          title: i18n('app.setting.fixedsidebar'),
          disabled: layout === 'topmenu',
          disabledReason: i18n('app.setting.fixedsidebar.hint'),
          action: h(Switch, {
            attrs: {
              size: 'small',
              disabled: layout === 'topmenu',
              checked: !!fixSiderbar
            },
            on: {
              'change': function change (checked) {
                return handleChange('fixSiderbar', checked)
              }
            }
          })
        }],
        renderItem: function renderItem (item, index) {
          return renderLayoutSettingItem(h, item)
        }
      }
    })
  }
}
