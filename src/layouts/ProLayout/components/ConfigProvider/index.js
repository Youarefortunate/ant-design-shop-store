import PropTypes from 'ant-design-vue/es/_util/vue-types'

var ConfigProvider = {
  name: 'ProConfigProvider',
  props: {
    i18nRender: PropTypes.any,
    contentWidth: PropTypes.bool,
    breadcrumbRender: PropTypes.func
  },
  provide: function provide () {
    var _self = this
    return {
      locale: _self.$props.i18nRender,
      contentWidth: _self.$props.contentWidth,
      breadcrumbRender: _self.$props.breadcrumbRender
    }
  },
  render: function render () {
    var $scopedSlots = this.$scopedSlots

    var children = this.children || $scopedSlots['default']
    return children()
  }
}

export default ConfigProvider
