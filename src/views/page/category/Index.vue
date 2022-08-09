<template>
  <a-card :bordered="false">
    <div class="card-title">分类页模板</div>
    <a-spin :spinning="isLoading">
      <div class="container clearfix">
        <!-- 模板预览 -->
        <div class="preview fl-l">
          <img
            v-if="form.getFieldValue('style')"
            :src="`static/img/category/${form.getFieldValue('style')}.png`"
          />
        </div>
        <!-- 表单内容 -->
        <div class="form-box fl-r">
          <a-form :form="form" @submit="handleSubmit">
            <a-form-item label="分类页样式" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-radio-group
                v-decorator="['style', { initialValue: PageCategoryStyleEnum.TWO_LEVEL.value, rules: [{required: true}] }]"
              >
                <a-radio
                  v-for="(item, index) in PageCategoryStyleEnum.data"
                  :key="index"
                  :value="item.value"
                >{{ item.name }}</a-radio>
              </a-radio-group>
              <div class="form-item-help">
                <p
                  v-if="form.getFieldValue('style') == PageCategoryStyleEnum.ONE_LEVEL_BIG.value"
                  class="extra"
                >分类图尺寸：宽750像素 高度不限</p>
                <p
                  v-if="form.getFieldValue('style') == PageCategoryStyleEnum.ONE_LEVEL_SMALL.value"
                  class="extra"
                >分类图尺寸：宽188像素 高度不限</p>
                <p
                  v-if="form.getFieldValue('style') == PageCategoryStyleEnum.TWO_LEVEL.value"
                  class="extra"
                >分类图尺寸：宽150像素 高150像素</p>
                <p
                  v-if="form.getFieldValue('style') == PageCategoryStyleEnum.COMMODITY.value"
                  class="extra"
                >分类图尺寸：宽150像素 高150像素</p>
              </div>
            </a-form-item>
            <a-form-item label="分享标题" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-input v-decorator="['shareTitle']" />
              <div class="form-item-help">
                <p class="extra">分类页面分享时的标题内容</p>
              </div>
            </a-form-item>
            <a-form-item
              v-show="form.getFieldValue('style') == PageCategoryStyleEnum.COMMODITY.value"
              label="购物车按钮"
              :labelCol="labelCol"
              :wrapperCol="wrapperCol"
            >
              <a-radio-group v-decorator="['showAddCart', { rules: [{ required: true }] }]">
                <a-radio :value="true">显示</a-radio>
                <a-radio :value="false">隐藏</a-radio>
              </a-radio-group>
              <div class="form-item-help">
                <p class="extra">是否显示加入购物车图标按钮</p>
              </div>
            </a-form-item>
            <a-form-item
              v-show="form.getFieldValue('style') == PageCategoryStyleEnum.COMMODITY.value"
              label="按钮样式"
              :labelCol="labelCol"
              :wrapperCol="wrapperCol"
            >
              <a-radio-group v-decorator="['cartStyle', { rules: [{ required: true }] }]">
                <a-radio v-for="(val, index) in 3" :value="index + 1" :key="index">样式{{ index + 1 }}</a-radio>
              </a-radio-group>
              <div class="form-item-help">
                <p class="extra">加入购物车图标按钮的样式</p>
              </div>
            </a-form-item>
            <a-form-item :wrapperCol="{ span: wrapperCol.span, offset: labelCol.span }">
              <a-button type="primary" html-type="submit">提交</a-button>
            </a-form-item>
          </a-form>
        </div>
      </div>
    </a-spin>
  </a-card>
</template>

<script>
import pick from 'lodash.pick'
import * as Api from '@/api/setting/store'
import { SettingEnum } from '@/common/enum/store'
import { PageCategoryStyleEnum } from '@/common/enum/store/page/category'

export default {
  components: {
  },
  data () {
    return {
      // 当前设置项的key
      key: SettingEnum.PAGE_CATEGORY_TEMPLATE.value,
      // 标签布局属性
      labelCol: { span: 5 },
      // 输入框布局属性
      wrapperCol: { span: 19 },
      // loading状态
      isLoading: false,
      // 枚举类
      PageCategoryStyleEnum,
      // 当前表单元素
      form: this.$form.createForm(this),
      // 当前记录详情
      record: {}
    }
  },
  // 初始化数据
  created () {
    // 获取当前详情记录
    this.getDetail()
  },
  methods: {

    // 获取当前详情记录
    getDetail () {
      this.isLoading = true
      Api.detail(this.key)
        .then(result => {
          // 当前记录
          this.record = result.data.values
          // 设置默认值
          this.setFieldsValue()
        })
        .finally(result => {
          this.isLoading = false
        })
    },

    // 设置默认值
    setFieldsValue () {
      const { record, form: { setFieldsValue } } = this
      // 表单内容
      this.$nextTick(() => {
        setFieldsValue(pick(record, ['style', 'shareTitle', 'showAddCart', 'cartStyle']))
      })
    },

    // 确认按钮
    handleSubmit (e) {
      e.preventDefault()
      // 表单验证
      const { form: { validateFields } } = this
      validateFields((errors, values) => {
        // 提交到后端api
        !errors && this.onFormSubmit(values)
      })
    },

    // 提交到后端api
    onFormSubmit (values) {
      this.isLoading = true
      Api.update(this.key, { form: values })
        .then((result) => {
          // 显示提示信息
          this.$message.success(result.message, 1.5)
        })
        .finally((result) => {
          this.isLoading = false
        })
    }

  }
}
</script>
<style lang="less" scoped>
/deep/.ant-form-item-control {
  padding-left: 10px;
  .ant-form-item-control {
    padding-left: 0;
  }
}

// 内容区
.container {
  max-width: 1000px;
  margin: 0 auto;

  .preview {
    width: 300px;
    img {
      display: block;
      width: 100%;
      box-shadow: 0 3px 10px #dcdcdc;
    }
  }

  .form-box {
    width: 650px;
  }
}
</style>
