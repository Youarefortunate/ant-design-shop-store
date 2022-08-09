import _extends from 'babel-runtime/helpers/extends'
import './index.less'

import omit from 'omit.js'
import PropTypes from 'ant-design-vue/es/_util/vue-types'
import { Divider, Drawer, List, Switch, Button, Icon, Alert, message } from 'ant-design-vue'
import BlockCheckbox from './BlockCheckbox'
import ThemeColor from './ThemeColor'
import LayoutSetting, { renderLayoutSettingItem } from './LayoutChange'
import { updateTheme, updateColorWeak } from '../../utils/dynamicTheme'
import { genStringToTheme } from '../../utils/util'
import CopyToClipboard from 'vue-copy-to-clipboard'

var baseClassName = 'ant-pro-setting-drawer'

var BodyProps = {
  title: {
    type: String,
    'default': ''
  }
}

var Body = {
  props: BodyProps,
  render: function render (h) {
    var title = this.title

    return h(
      'div',
      { style: { marginBottom: 24 } },
      [h(
        'h3',
        { 'class': baseClassName + '-title' },
        [title]
      ), this.$slots['default']]
    )
  }
}

export var defaultI18nRender = function defaultI18nRender (t) {
  return t
}

var getThemeList = function getThemeList (i18nRender) {
  var list = window.umi_plugin_ant_themeVar || []

  var themeList = [{
    key: 'light',
    url: 'https://gw.alipayobjects.com/zos/antfincdn/NQ%24zoisaD2/jpRkZQMyYRryryPNtyIC.svg',
    title: i18nRender('app.setting.pagestyle.light')
  }, {
    key: 'dark',
    url: 'https://gw.alipayobjects.com/zos/antfincdn/XwFOFbLkSM/LCkqqYNmvBEbokSDscrm.svg',
    title: i18nRender('app.setting.pagestyle.dark')
  }]

  var darkColorList = [{
    key: '#1890ff',
    color: '#1890ff',
    theme: 'dark'
  }]

  var lightColorList = [{
    key: '#1890ff',
    color: '#1890ff',
    theme: 'dark'
  }]

  if (list.find(function (item) {
    return item.theme === 'dark'
  })) {
    themeList.push({
      // disable click
      disable: true,
      key: 'realDark',
      url: 'https://gw.alipayobjects.com/zos/antfincdn/hmKaLQvmY2/LCkqqYNmvBEbokSDscrm.svg',
      title: i18nRender('app.setting.pagestyle.realdark')
    })
  }
  // insert  theme color List
  list.forEach(function (item) {
    var color = (item.modifyVars || {})['@primary-color']
    if (item.theme === 'dark' && color) {
      darkColorList.push(_extends({
        color: color
      }, item))
    }
    if (!item.theme || item.theme === 'light') {
      lightColorList.push(_extends({
        color: color
      }, item))
    }
  })

  return {
    colorList: {
      dark: darkColorList,
      light: lightColorList
    },
    themeList: themeList
  }
}

var handleChangeSetting = function handleChangeSetting (key, value, hideMessageLoading) {
  if (key === 'primaryColor') {
    // 更新主色调
    updateTheme(value)
  }
  if (key === 'colorWeak') {
    updateColorWeak(value)
  }
}

var genCopySettingJson = function genCopySettingJson (settings) {
  return JSON.stringify(omit(_extends({}, settings, {
    primaryColor: genStringToTheme(settings.primaryColor)
  }), ['colorWeak']), null, 2)
}

export var settings = {
  theme: PropTypes.oneOf(['dark', 'light', 'realDark']),
  primaryColor: PropTypes.string,
  layout: PropTypes.oneOf(['sidemenu', 'topmenu']),
  colorWeak: PropTypes.bool,
  contentWidth: PropTypes.bool,
  fixedHeader: PropTypes.bool,
  fixSiderbar: PropTypes.bool,
  hideHintAlert: PropTypes.bool.def(false),
  hideCopyButton: PropTypes.bool.def(false)
}

export var SettingDrawerProps = {
  getContainer: PropTypes.func,
  settings: PropTypes.objectOf(settings)
}

var SettingDrawer = {
  name: 'SettingDrawer',
  props: SettingDrawerProps,
  inject: ['locale'],
  data: function data () {
    return {
      show: false
    }
  },
  render: function render (h) {
    var _this = this

    var setShow = this.setShow
    var getContainer = this.getContainer
    var settings = this.settings
    var _settings$theme = settings.theme
    var theme = _settings$theme === undefined ? 'dark' : _settings$theme
    var _settings$primaryColo = settings.primaryColor
    var primaryColor = _settings$primaryColo === undefined ? 'daybreak' : _settings$primaryColo
    var _settings$layout = settings.layout
    var layout = _settings$layout === undefined ? 'sidemenu' : _settings$layout
    var _settings$fixedHeader = settings.fixedHeader
    var fixedHeader = _settings$fixedHeader === undefined ? false : _settings$fixedHeader
    var _settings$fixSiderbar = settings.fixSiderbar
    var fixSiderbar = _settings$fixSiderbar === undefined ? false : _settings$fixSiderbar
    var _settings$contentWidt = settings.contentWidth
    var contentWidth = _settings$contentWidt === undefined ? false : _settings$contentWidt
    var hideHintAlert = settings.hideHintAlert
    var hideCopyButton = settings.hideCopyButton
    var colorWeak = settings.colorWeak

    var i18n = this.$props.i18nRender || this.locale
    var themeList = getThemeList(i18n)
    var isTopMenu = layout === 'topmenu'

    var iconStyle = {
      color: '#fff',
      fontSize: 20
    }

    var changeSetting = function changeSetting (type, value) {
      _this.$emit('change', { type: type, value: value })
      handleChangeSetting(type, value, false)
    }

    return h(
      Drawer,
      {
        attrs: {
          visible: this.show,
          width: 300,

          placement: 'right',
          getContainer: getContainer
          /* handle={
            <div class="ant-pro-setting-drawer-handle" onClick={() => setShow(!this.show)}>
              {this.show
                ? (<Icon type="close" style={iconStyle} />)
                : (<Icon type="setting" style={iconStyle} />)
              }
            </div>
          } */
        },
        on: {
          'close': function close () {
            return setShow(false)
          }
        },
        style: {
          zIndex: 999
        }
      },
      [h(
        'template',
        { slot: 'handle' },
        [h(
          'div',
          {
            'class': baseClassName + '-handle',
            on: {
              'click': function click () {
                return setShow(!_this.show)
              }
            }
          },
          [this.show ? h(Icon, {
            attrs: { type: 'close' },
            style: iconStyle
          }) : h(Icon, {
            attrs: { type: 'setting' },
            style: iconStyle
          })]
        )]
      ), h(
        'div',
        { 'class': baseClassName + '-content' },
        [h(
          Body,
          {
            attrs: { title: i18n('app.setting.pagestyle') }
          },
          [h(BlockCheckbox, {
            attrs: { list: themeList.themeList, value: theme },
            on: {
              'change': function change (val) {
                changeSetting('theme', val)
              }
            }
          })]
        ), h(ThemeColor, {
          attrs: {
            title: i18n('app.setting.themecolor'),
            value: primaryColor,
            colors: themeList.colorList[theme === 'realDark' ? 'dark' : 'light']
          },
          on: {
            'change': function change (color) {
              changeSetting('primaryColor', color, null)
            }
          }
        }), h(Divider), h(
          Body,
          {
            attrs: { title: i18n('app.setting.navigationmode') }
          },
          [h(BlockCheckbox, {
            attrs: { value: layout },
            on: {
              'change': function change (value) {
                changeSetting('layout', value, null)
              }
            }
          })]
        ), h(LayoutSetting, {
          attrs: {
            contentWidth: contentWidth,
            fixedHeader: fixedHeader,
            fixSiderbar: isTopMenu ? false : fixSiderbar,
            layout: layout
          },
          on: {
            'change': function change (_ref) {
              var type = _ref.type
              var value = _ref.value

              changeSetting(type, value)
            }
          }
        }), h(Divider), h(
          Body,
          {
            attrs: { title: i18n('app.setting.othersettings') }
          },
          [h(List, {
            attrs: {
              split: false,
              renderItem: function renderItem (item) {
                return renderLayoutSettingItem(h, item)
              },
              dataSource: [{
                title: i18n('app.setting.weakmode'),
                action: h(Switch, {
                  attrs: {
                    size: 'small',
                    checked: !!colorWeak
                  },
                  on: {
                    'change': function change (checked) {
                      return changeSetting('colorWeak', checked)
                    }
                  }
                })
              }]
            }
          })]
        ), hideHintAlert && hideCopyButton ? null : h(Divider), hideHintAlert ? null : h(Alert, {
          attrs: {
            type: 'warning',
            message: i18n('app.setting.production.hint'),
            icon: h(Icon, {
              attrs: { type: 'notification' }
            }),
            showIcon: true
          },
          style: { marginBottom: '16px' }
        }), hideCopyButton ? null : h(
          CopyToClipboard,
          {
            attrs: {
              text: genCopySettingJson(settings)
            },
            on: {
              'copy': function copy () {
                return message.success(i18n('app.setting.copyinfo'))
              }
            }
          },
          [h(
            Button,
            {
              attrs: { block: true }
            },
            [h(Icon, {
              attrs: { type: 'copy' }
            }), i18n('app.setting.copy')]
          )]
        )]
      )]
    )
  },

  methods: {
    setShow: function setShow (flag) {
      this.show = flag
    }
  }
}

export default SettingDrawer
