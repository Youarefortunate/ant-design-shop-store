<template>
  <!-- 
    maskClosable: 点击蒙层是否允许关闭
    destroyOnClose: 关闭modal时销毁里面的子元素
    cancel: 点击遮罩层或右上角叉或取消按钮的回调
  -->
  <a-modal
    :title="title"
    :width="840"
    :visible="visible"
    :isLoading="isLoading"
    :maskClosable="false"
    :destroyOnClose="false"
    @ok="handleSubmit"
    @cancel="handleCancel"
  >
    <a-spin :spinning="isLoading">
      <div class="library-box clearfix">
        <!-- 分组列表 -->
        <div class="file-group">
          <div class="group-tree">
            <!-- 
              blockNode: 是否节点占据一行
            -->
            <a-directory-tree
              v-if="groupListTreeSelect.length"
              :treeData="groupListTreeSelect"
              :blockNode="true"
              :showIcon="false"
              @select="onSelectGroup"
            ></a-directory-tree>
          </div>
          <a class="group-add" href="javascript:void(0);" @click="handleAddGroup">新增分组</a>
        </div>
        <!-- 文件列表 -->
        <div class="file-list">
          <!-- 头部操作栏 -->
          <div class="top-operate clearfix">
            <!-- 搜索框 -->
            <a-input-search
              class="fl-l"
              style="width: 200px"
              placeholder="搜索文件名称"
              v-model="queryParam.fileName"
              @search="onSearch"
            />
            <!-- 上传按钮 -->
            <div class="file-upload fl-r">
              <span
                class="upload-desc"
              >{{ fileType === FileTypeEnum.VIDEO.value ? '视频' : '图片' }}大小不能超过{{ uploadSizeLimit }}M</span>
              <!-- 
                accept: 接收上传文件的类型
                beforeUpload: 上传文件之前的钩子
                customRequest: 通过覆盖默认的上传行为，可以自定义自己的上传实现
                showUploadList: 是否展示 uploadList
              -->
              <a-upload
                name="iFile"
                :accept="accept"
                :beforeUpload="beforeUpload"
                :customRequest="onUpload"
                :multiple="true"
                :showUploadList="false">
                <a-button icon="cloud-upload">上传</a-button>
              </a-upload>
            </div>
          </div>
          <div class="file-list-body">
            <!-- 文件列表 -->
            <ul v-if="fileList.data && fileList.data.length" class="file-list-ul clearfix">
              <li
                class="file-item"
                :class="{ active: selectedIndexs.indexOf(index) > -1 }"
                v-for="(item, index) in fileList.data"
                :key="index"
                @click="onSelectItem(index)"
              >
                <div
                  class="img-cover"
                  :style="{ backgroundImage: `url('${item.preview_url}')`, width: fileType === FileTypeEnum.VIDEO.value ? '55px' : '95px' }"
                ></div>
                <p class="file-name oneline-hide">{{ item.file_name }}</p>
                <div class="select-mask">
                  <a-icon class="selected-icon" type="check" />
                </div>
              </li>
            </ul>
            <!-- 无数据时显示 -->
            <a-empty v-else-if="!isLoading" />
            <!-- 底部操作栏 -->
            <div class="footer-operate clearfix">
              <div class="fl-l" v-if="selectedIndexs.length">
                <span class="footer-desc">已选择{{ selectedIndexs.length }}项</span>
                <a-config-provider :auto-insert-space-in-button="false">
                  <a-button-group>
                    <a-button class="btn-mini" size="small" @click="handleDelete()">删除</a-button>
                    <a-button class="btn-mini" size="small" @click="handleBatchMove()">移动</a-button>
                  </a-button-group>
                </a-config-provider>
              </div>
              <!-- 分页组件 -->
              <a-pagination
                class="fl-r"
                size="small"
                v-model="fileList.current_page"
                :total="fileList.total"
                :defaultPageSize="15"
                hideOnSinglePage
                @change="handleNextPage"
              />
            </div>
          </div>
        </div>
      </div>
    </a-spin>
    <!-- 新增分组 -->
    <AddGroupForm ref="AddGroupForm" :groupList="groupList" @handleSubmit="getGroupList" />
    <!-- 移动分组 -->
    <MoveGroupForm ref="MoveGroupForm" :groupList="groupListTree" @handleSubmit="handleRefresh" />
  </a-modal>
</template>

<script>
import PropTypes from 'ant-design-vue/es/_util/vue-types'
import store from '@/store'
import { debounce } from '@/utils/util'
import * as FileApi from '@/api/files'
import * as GroupApi from '@/api/files/group'
import * as UploadApi from '@/api/upload'
import FileTypeEnum from '@/common/enum/file/FileType'
import ChannelEnum from '@/common/enum/file/Channel'
import AddGroupForm from './AddGroupForm'
import MoveGroupForm from './MoveGroupForm'

export default {
  name: 'FilesModal',
  components: {
    AddGroupForm,
    MoveGroupForm
  },
  props: {
    // 多选模式, 如果false为单选
    multiple: PropTypes.bool.def(false), 
    // 最大选择的数量限制, multiple模式下有效
    maxNum: PropTypes.integer.def(100),
    // 已选择的数量
    selectedNum: PropTypes.integer.def(0),
    // 文件类型 (10图片 30视频)
    fileType: PropTypes.integer.def(FileTypeEnum.IMAGE.value),
  },
  data () {
    return {
      // 对话框标题
      title: '图片库',
      // modal(对话框)是否可见
      visible: false,
      // 枚举类
      FileTypeEnum,
      // 后端上传api
      uploadUrl: UploadApi.image,
      // 上传文件大小限制
      uploadSizeLimit: 2,
      // 文件上传的格式限制
      accept: '',
      // 查询参数
      queryParam: {
        // 文件类型: 图片
        fileType: FileTypeEnum.IMAGE.value,
        // 上传来源: 商户后台
        channel: ChannelEnum.STORE.value,
        // 当前页码
        page: 1,
        // 文件名称
        fileName: '',
        // 文件分组
        groupId: 0,
      },
      // modal(对话框)确定按钮 loading
      isLoading: true,
      // 分组列表
      groupList: [],
      // 文件列表
      fileList: [],
      // 文件分组列表(树状结构)
      groupListTree: [],
      // 文件分组列表(用于筛选组件)
      groupListTreeSelect: [],
      // 选中的文件
      selectedIndexs: [],
      // 上传中的文件
      uploading: []
    }
  },
  created () {
  },
  methods: {

    // 显示对话框
    show () {
      // 显示窗口
      this.visible = true
      // 初始化文件类型
      this.initFileType()
      // 获取分组列表
      this.getGroupList()
      // 获取文件列表
      this.getFileList()
    },

    // 初始化文件类型
    initFileType () {
      const publicConfig = store.getters.publicConfig
      if (this.fileType === FileTypeEnum.IMAGE.value) {
        this.title = '图片库'
        this.accept = 'image/jpeg,image/png,image/gif,image/webp'
        this.uploadUrl = UploadApi.image
        this.uploadSizeLimit = publicConfig.uploadImageSize || 2
      }
      if (this.fileType === FileTypeEnum.VIDEO.value) {
        this.title = '视频库'
        this.accept = '.mp4'
        this.uploadUrl = UploadApi.video
        this.uploadSizeLimit = publicConfig.uploadVideoSize || 10
      }
      this.queryParam.fileType = this.fileType
    },

    // 获取文件分组列表
    getGroupList () {
      // this.isLoading = true
      GroupApi.list({}).then(result => {
        // 记录列表数据
        const groupList = result.data.list
        this.groupList = groupList
        // 格式化分组列表
        const groupListTree = this.formatTreeData(groupList)
        // 记录 groupListTree
        this.groupListTree = groupListTree
        // 记录 groupListTreeSelect
        this.groupListTreeSelect = [{
          title: '全部',
          key: -1,
          value: -1
        }, {
          title: '未分组',
          key: 0,
          value: 0
        }].concat(groupListTree)
        // this.isLoading = false
      })
    },

    // 获取文件列表
    getFileList () {
      this.isLoading = true
      FileApi.list(this.queryParam)
        .then(result => {
          this.fileList = result.data.list
          this.isLoading = false
        })
    },

    /**
     * 格式化分组列表
     */
    formatTreeData (list, disabled = false) {
      const data = []
      list.forEach(item => {
        // 新的元素
        const netItem = {
          title: item.name,
          key: item.group_id,
          value: item.group_id
        }
        // 递归整理子集
        if (item.children && item.children.length) {
          netItem['children'] = this.formatTreeData(item['children'], netItem.disabled)
        } else {
          netItem['isLeaf'] = true
          netItem['scopedSlots'] = { icon: 'meh' }
        }
        data.push(netItem)
      })
      return data
    },

    // 记录选中的分组
    onSelectGroup (selectedKeys) {
      this.queryParam.groupId = selectedKeys[0]
      this.handleRefresh(true)
    },

    // 记录选中的文件
    onSelectItem (index) {
      const { multiple, maxNum, selectedIndexs } = this
      // 记录选中状态
      if (!multiple) {
        this.selectedIndexs = [index]
        return
      }
      const key = selectedIndexs.indexOf(index)
      const selected = key > -1
      // 验证数量限制
      if (!selected && (selectedIndexs.length + this.selectedNum) >= maxNum) {
        this.$message.warning(`最多可选${maxNum}个文件`, 1)
        return
      }
      !selected ? this.selectedIndexs.push(index) : this.selectedIndexs.splice(key, 1)
    },

    // 新增分组
    handleAddGroup () {
      this.$refs.AddGroupForm.add()
    },

    // 搜索文件名称
    onSearch () {
      this.handleRefresh(true)
    },

    // 事件: 上传文件之前
    beforeUpload (file, fileList) {
      // 显示错误提示(防抖处理)
      const showErrorMsg = debounce(this.$message.error, 20)
      // 验证文件大小
      const fileSizeMb = file.size / 1024 / 1024
      if (fileSizeMb > this.uploadSizeLimit) {
        showErrorMsg(`上传的文件大小不能超出${this.uploadSizeLimit}MB`)
        return false
      }
      // 验证文件上传数量
      if (fileList.length > 10) {
        showErrorMsg('一次上传的文件数量不能超出10个')
        return false
      }
      return true
    },

    // 事件: 自定义上传
    onUpload (info) {
      this.isLoading = true
      // 记录上传状态
      this.uploading.push(true)
      // 构建上传参数
      const formData = new FormData()
      formData.append('iFile', info.file)
      formData.append('groupId', this.queryParam.groupId)
      // 开始上传
      this.uploadUrl(formData)
        .finally(() => {
          this.uploading.pop()
          if (this.uploading.length === 0) {
            this.isLoading = false
            this.handleRefresh(true)
          }
        })
    },

    // 列表分页事件
    handleNextPage (page, pageSize) {
      this.queryParam.page = page
      this.handleRefresh()
    },

    // 关闭对话框事件
    handleCancel () {
      this.visible = false
      this.selectedIndexs = []
    },

    /**
     * 刷新文件列表
     * @param Boolean bool 强制刷新到第一页
     */
    handleRefresh (bool = false) {
      bool && (this.queryParam.page = 1)
      // 清空选中
      this.selectedIndexs = []
      // 获取文件列表
      this.getFileList()
    },

    // 删除文件
    handleDelete (item) {
      const that = this
      const fileIds = this.getSelectedItemIds()
      const modal = this.$confirm({
        title: '您确定要删除该文件吗?',
        content: '删除后不可恢复，请谨慎操作',
        onOk () {
          return FileApi.deleted({ fileIds })
            .then(result => {
              that.$message.success(result.message, 1.5)
              that.handleRefresh()
            })
            .catch(() => true)
            .finally(result => modal.destroy())
        }
      })
    },

    /**
     * 批量移动文件
     */
    handleBatchMove () {
      const fileIds = this.getSelectedItemIds()
      this.$refs.MoveGroupForm.show(fileIds)
    },

    // 获取选中的文件id集
    getSelectedItemIds () {
      const selectedItems = this.getSelectedItems()
      return selectedItems.map(item => item.file_id)
    },

    // 获取选中的文件
    getSelectedItems () {
      const selectedItems = []
      for (const key in this.selectedIndexs) {
        const index = this.selectedIndexs[key]
        selectedItems.push(this.fileList.data[index])
      }
      return selectedItems
    },

    // 确认按钮
    handleSubmit (e) {
      e.preventDefault()
      // 获取选中的文件
      const selectedItems = this.getSelectedItems()
      // 通知父端组件提交完成了
      this.$emit('handleSubmit', selectedItems)
      // 关闭对话框
      this.handleCancel()
    }

  }
}
</script>

<style lang="less" scoped>
/deep/.ant-modal-header,
/deep/.ant-modal-footer {
  border: none;
}
/deep/.ant-modal-body {
  padding: 6px;
}

/deep/.ant-empty {
  padding: 120px 0;
}

/* 文件库 */
.library-box {
  user-select: none;

  // 文件分组
  .file-group {
    float: left;
    border-right: 1px solid #e6e6e6;

    // 分组列表
    .group-tree {
      width: 150px;
      height: 440px;
      overflow-y: auto;
      overflow-x: auto;

      /deep/.ant-tree {
        display: inline-block;
        min-width: 100%;
        max-height: 380px;
        width: auto;
      }
    }

    // 新增分组
    .group-add {
      display: block;
      margin-top: 20px;
      font-size: @font-size-base;
      padding: 0 30px;
    }
  }

  // 文件列表
  .file-list {
    float: left;
    width: 630px;
    margin-left: 20px;

    // 头部操作区
    .top-operate {
      margin-bottom: 10px;
      .file-upload {
        .upload-desc {
          font-size: 12px;
          padding-right: 10px;
          color: #999;
        }
      }
    }

    // 文件列表
    .file-list-body {
      height: 455px;
      .file-list-ul {
        margin: 0;
        padding: 0;
        height: 417px;
      }
      .file-item {
        width: 110px;
        position: relative;
        cursor: pointer;
        border-radius: 2px;
        padding: 4px;
        border: 1px solid rgba(0, 0, 0, 0.05);
        float: left;
        margin: 8px;
        -webkit-transition: All 0.2s ease-in-out;
        -moz-transition: All 0.2s ease-in-out;
        -o-transition: All 0.2s ease-in-out;
        transition: All 0.2s ease-in-out;
        &:hover {
          border: 1px solid #16bce2;
        }
      }
      .file-item {
        // 文件名称
        .file-name {
          font-size: 12px;
          text-align: center;
        }
        // 预览图
        .img-cover {
          margin: 0 auto;
          width: 95px;
          height: 95px;
          background: no-repeat center center / 100%;
        }
        // 遮罩层(选中时)
        &.active .select-mask {
          display: block;
        }
        .select-mask {
          display: none;
          position: absolute;
          top: 0;
          bottom: 0;
          left: 0;
          right: 0;
          background: rgba(0, 0, 0, 0.41);
          text-align: center;
          border-radius: 2px;
          .selected-icon {
            font-size: 26px;
            color: #fff;
            line-height: 122px;
            text-align: center;
          }
        }
      }

      // 底部操作栏
      .footer-operate {
        height: 28px;
        margin-top: 10px;
        .footer-desc {
          color: #999;
          margin-right: 10px;
        }
        .btn-mini {
          font-size: @font-size-base;
          padding: 0 15px;
          height: 28px;
        }
      }
    }
  }
}
</style>
