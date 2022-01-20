<template>
  <KeepAlive>
    <div style="height: calc(100% - 10px)">
      <MainView />
    </div>
  </KeepAlive>
</template>
<script lang="ts" setup>
import { ref } from "vue"
import MainView from "@mars/components/mars-work/main-view.vue"
</script>
<style lang="less"></style>
