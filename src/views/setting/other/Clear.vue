<template>
  <a-card :bordered="false">
    <div class="card-title">{{ $route.meta.title }}</div>
    <a-spin :spinning="isLoading">
      <a-form :form="form" @submit="handleSubmit">
        <a-form-item label="缓存项目" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-checkbox-group
            v-decorator="['keys', {rules: [{required: true, message: '配送方式至少选择一个'}]}]"
          >
            <a-checkbox
              v-for="(item, index) in items"
              :key="index"
              :value="item.key"
            >{{ item.name }}</a-checkbox>
          </a-checkbox-group>
        </a-form-item>
        <a-form-item :wrapper-col="{ span: wrapperCol.span, offset: labelCol.span }">
          <a-button type="primary" html-type="submit">提交</a-button>
        </a-form-item>
      </a-form>
    </a-spin>
  </a-card>
</template>

<script>
import * as Api from '@/api/setting/cache'
import StorageEnum from '@/common/enum/file/Storage'

export default {
  data () {
    return {
      // 标签布局属性
      labelCol: { span: 4 },
      // 输入框布局属性
      wrapperCol: { span: 10 },
      // loading状态
      isLoading: false,
      // 当前表单元素
      form: this.$form.createForm(this),
      // 当前记录详情
      items: {},
      // 枚举类
      StorageEnum
    }
  },
  // 初始化数据
  created () {
    // 获取数据缓存项目
    this.getItems()
  },
  methods: {

    // 获取数据缓存项目
    getItems () {
      this.isLoading = true
      Api.items()
        .then(result => {
          this.items = result.data.items
          this.setFieldsValue()
        })
        .finally(() => {
          this.isLoading = false
        })
    },

    /**
     * 设置默认值
     */
    setFieldsValue () {
      const { form: { setFieldsValue } } = this
      this.$nextTick(() => {
        setFieldsValue({
          keys: this.items.map(item => item.key)
        })
      })
    },

    /**
     * 确认按钮
     */
    handleSubmit (e) {
      e.preventDefault()
      // 表单验证
      const { form: { validateFields } } = this
      validateFields((errors, values) => {
        // 提交到后端api
        !errors && this.onFormSubmit(values)
      })
    },

    /**
    * 提交到后端api
    */
    onFormSubmit (values) {
      this.isLoading = true
      Api.clear({ form: values })
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
.ant-checkbox-wrapper + .ant-checkbox-wrapper {
  margin-left: 0;
}
.ant-checkbox-wrapper {
  margin-right: 14px;
  margin-bottom: 18px;
}
/deep/.ant-form-item-control {
  padding-left: 10px;

  .ant-form-item-control {
    padding-left: 0;
  }
}
</style>
