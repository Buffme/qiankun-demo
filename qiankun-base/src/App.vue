<template>
  <div id="appBase">
    <el-menu :router="true" mode="horizontal">
      <!--主应用内容-->
      <el-menu-item index="/">Home</el-menu-item>
      <el-menu-item index="/about">About</el-menu-item>
      <!--子应用内容-->
      <el-menu-item index="/vue">vue应用</el-menu-item>
      <el-menu-item index="/react">react应用</el-menu-item>
    </el-menu>
    <router-view></router-view>
    <!-- 与 main.js 里面配置的 container 对应-->
    <div id="vue"></div>
    <div id="react"></div>
  </div>
</template>

<script>

export default {
  name: 'appBase',
  components: {
  }
}
</script>

