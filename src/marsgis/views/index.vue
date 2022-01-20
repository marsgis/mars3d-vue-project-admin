<template>
  <KeepAlive>
    <div :style="{ height: height + 'px' }">
      <MainView />
    </div>
  </KeepAlive>
</template>
<script lang="ts" setup>
import { ref, onMounted } from "vue"
import MainView from "@mars/components/mars-work/main-view.vue"

const height = ref(600)

onMounted(() => {
  height.value = document.body.clientHeight - 80
})

window.onresize = function () {
  height.value = document.body.clientHeight - 80
}
</script>
<style lang="less"></style>
