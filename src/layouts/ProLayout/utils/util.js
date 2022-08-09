import triggerEvent from 'ant-design-vue/es/_util/triggerEvent'
import { inBrowser } from 'ant-design-vue/es/_util/env'

var getComponentFromProp = function getComponentFromProp (instance, prop) {
  var slots = instance.slots && instance.slots()
  return slots[prop] || instance.props[prop]
}

var isFun = function isFun (func) {
  return typeof func === 'function'
}

var themeConfig = {
  daybreak: 'daybreak',
  '#1890ff': 'daybreak',
  '#F5222D': 'dust',
  '#FA541C': 'volcano',
  '#FAAD14': 'sunset',
  '#13C2C2': 'cyan',
  '#52C41A': 'green',
  '#2F54EB': 'geekblue',
  '#722ED1': 'purple'
}

var invertKeyValues = function invertKeyValues (obj) {
  return Object.keys(obj).reduce(function (acc, key) {
    acc[obj[key]] = key
    return acc
  }, {})
}

/**
 * #1890ff -> daybreak
 * @param val
 */
export function genThemeToString (val) {
  return val && themeConfig[val] ? themeConfig[val] : val
}

/**
 * daybreak-> #1890ff
 * @param val
 */
export function genStringToTheme (val) {
  var stringConfig = invertKeyValues(themeConfig)
  return val && stringConfig[val] ? stringConfig[val] : val
}

export { triggerEvent, inBrowser, getComponentFromProp, isFun }
