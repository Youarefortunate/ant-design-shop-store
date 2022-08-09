<template>
  <div :class="['user-layout-wrapper', isMobile && 'mobile']">
    <div class="container">
      <router-view />
      <div class="footer">
        <!-- <div class="copyright">Copyright &copy; 2018 vueComponent</div> -->
      </div>
    </div>
  </div>
</template>

<script>
import { deviceMixin } from '@/store/device-mixin'

export default {
  name: 'UserLayout',
  mixins: [deviceMixin],
  mounted () {
  }
}
</script>

<style lang="less" scoped>
.user-layout-wrapper {
  height: 100%;

  &.mobile {
    .container {
      .main {
        max-width: 368px;
        width: 98%;
      }
    }
  }

  .container {
    position: relative;
    width: 100%;
    height: 100%;
    background-image: url(~@/assets/background.jpg);
    text-align: center;
    &::before {
      display: inline-block;
      height: 100%;
      vertical-align: middle;
      content: '';
    }
    a {
      text-decoration: none;
    }

    .header {
      margin-bottom: 40px;

      .logo {
        height: 44px;
        vertical-align: top;
        margin-right: 16px;
        border-style: none;
      }

      .title {
        font-size: 28px;
        color: rgba(0, 0, 0, 0.85);
        font-family: Avenir, 'Helvetica Neue', Arial, Helvetica, sans-serif;
        position: relative;
      }
    }

    .main {
      display: inline-block;
      vertical-align: middle;
      min-width: 260px;
      width: 460px;
      margin: -80px auto 0 auto;
      padding: 70px 60px;
      background: rgba(255, 255, 255, 0.48);
      // box-shadow: 0 2px 30px rgba(177, 177, 177, 0.14);
      text-align: left;
    }

    .footer {
      position: absolute;
      width: 100%;
      bottom: 0;
      padding: 0 16px;
      margin: 48px 0 24px;
      text-align: center;

      .copyright {
        color: rgba(0, 0, 0, 0.45);
        font-size: 14px;
      }
    }
  }
}
</style>
