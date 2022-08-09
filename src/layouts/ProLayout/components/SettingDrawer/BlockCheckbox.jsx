import { Tooltip, Icon } from 'ant-design-vue'
import { defaultI18nRender } from './index'

var BlockCheckboxProps = {
  value: {
    type: String,
    'default': null
  },
  // Item: { key, url, title }
  list: {
    type: Array,
    'default': null
  }
}

var baseClassName = 'ant-pro-setting-drawer-block-checbox'

var BlockCheckbox = {
  props: BlockCheckboxProps,
  inject: ['locale'],
  render: function render (h) {
    var _this = this

    var value = this.value
    var list = this.list

    var i18n = this.$props.i18nRender || this.locale || defaultI18nRender

    var items = list || [{
      key: 'sidemenu',
      url: 'https://gw.alipayobjects.com/zos/antfincdn/XwFOFbLkSM/LCkqqYNmvBEbokSDscrm.svg',
      title: i18n('app.setting.sidemenu')
    }, {
      key: 'topmenu',
      url: 'https://gw.alipayobjects.com/zos/antfincdn/URETY8%24STp/KDNDBbriJhLwuqMoxcAr.svg',
      title: i18n('app.setting.topmenu')
    }]

    var handleChange = function handleChange (key) {
      _this.$emit('change', key)
    }

    var disableStyle = {
      cursor: 'not-allowed'
    }

    return h(
      'div',
      { 'class': baseClassName, key: value },
      [items.map(function (item) {
        return h(
          Tooltip,
          {
            attrs: { title: item.title },
            key: item.key
          },
          [h(
            'div',
            {
              'class': baseClassName + '-item',
              style: item.disable && disableStyle,
              on: {
                'click': function click () {
                  return !item.disable && handleChange(item.key)
                }
              }
            },
            [h('img', {
              attrs: { src: item.url, alt: item.key }
            }), h(
              'div',
              {
                'class': baseClassName + '-selectIcon',
                style: {
                  display: value === item.key ? 'block' : 'none'
                }
              },
              [h(Icon, {
                attrs: { type: 'check' }
              })]
            )]
          )]
        )
      })]
    )
  }
}

export default BlockCheckbox
