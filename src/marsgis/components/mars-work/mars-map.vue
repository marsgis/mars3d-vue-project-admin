<template>
  <div :id="withKeyId" class="mars3d-container"></div>
</template>
<script setup lang="ts">
/**
 * 地图渲染组件
 * @copyright 火星科技 mars3d.cn
 * @author 火星渣渣灰 2022-02-19
 */
import { computed, onUnmounted, onMounted, h, ref, toRaw } from "vue"
import * as mars3d from "mars3d"
import { getQueryString } from "@mars/utils/mars-util"
import { getDefaultContextMenu } from "@mars/utils/getDefaultContextMenu"
import { $alert, $message } from "@mars/components/mars-ui/index"

const props = withDefaults(
  defineProps<{
    url: string
    mapKey?: string
    options?: any
  }>(),
  {
    url: "",
    mapKey: "default",
    options: () => ({})
  }
)

// 用于存放地球组件实例
let map: mars3d.Map // 地图对象

// 使用用户传入的 mapKey 拼接生成 withKeyId 作为当前显示容器的id
const withKeyId = computed(() => `mars3d-container-${props.mapKey}`)

onMounted(() => {
  // 获取配置
  mars3d.Util.fetchJson({ url: props.url }).then((data: any) => {
    initMars3d(data)
  })
})

// onload事件将在地图渲染后触发
const emit = defineEmits(["onload"])
const initMars3d = (option: any) => {


  option = mars3d.Util.merge(option, toRaw(props.options)) // 合并配置
  map = new mars3d.Map(withKeyId.value, option)

  // 绑定当前项目的默认右键菜单
  map.bindContextMenu(getDefaultContextMenu(map))

  // 如果有xyz传参，进行定位
  const lat = getQueryString("lat")
  const lng = getQueryString("lng")
  if (lat && lng) {
    map.flyToPoint(new mars3d.LngLatPoint(lng, lat), { duration: 0 })
  }

  // 开场动画
  // map.openFlyAnimation();

  // 针对不同终端的优化配置
  if (mars3d.Util.isPCBroswer()) {
    map.zoomFactor = 2.0 // 鼠标滚轮放大的步长参数

    // IE浏览器优化
    if (window.navigator.userAgent.toLowerCase().indexOf("msie") >= 0) {
      map.viewer.targetFrameRate = 20 // 限制帧率
      map.scene.requestRenderMode = false // 取消实时渲染
    }
  } else {
    map.zoomFactor = 5.0 // 鼠标滚轮放大的步长参数

    // 移动设备上禁掉以下几个选项，可以相对更加流畅
    map.scene.requestRenderMode = false // 取消实时渲染
    map.scene.fog.enabled = false
    map.scene.skyAtmosphere.show = false
    map.scene.globe.showGroundAtmosphere = false
  }

  // //二三维切换不用动画
  if (map.viewer.sceneModePicker) {
    map.viewer.sceneModePicker.viewModel.duration = 0.0
  }

  // webgl渲染失败后，刷新页面
  map.on(mars3d.EventType.renderError, async () => {
    await $alert("程序内存消耗过大，请重启浏览器")
    window.location.reload()
  })

  // map构造完成后的一些处理
  onMapLoad()

  emit("onload", map)
}

// map构造完成后的一些处理
function onMapLoad() {
  // Mars3D地图内部使用，如右键菜单弹窗
  // @ts-ignore
  window.globalAlert = $alert
  // @ts-ignore
  window.globalMsg = $message

  // 用于 config.json 中 西藏垭口 图层的详情按钮 演示
  // @ts-ignore
  window.showPopupDetails = (item: any) => {
    $alert(item.NAME)
  }

  // 用于 config.json中配置的图层，绑定额外方法和参数
  const tiles3dLayer = map.getLayerById(204012) // 上海市区
  if (tiles3dLayer) {
    tiles3dLayer.options.onSetOpacity = function (opacity: number) {
      tiles3dLayer.style = {
        color: {
          conditions: [
            ["${floor} >= 200", "rgba(45, 0, 75," + 0.5 * opacity + ")"],
            ["${floor} >= 100", "rgba(170, 162, 204," + opacity + ")"],
            ["${floor} >= 50", "rgba(224, 226, 238," + opacity + ")"],
            ["${floor} >= 25", "rgba(252, 230, 200," + opacity + ")"],
            ["${floor} >= 10", "rgba(248, 176, 87," + opacity + ")"],
            ["${floor} >= 5", "rgba(198, 106, 11," + opacity + ")"],
            ["true", "rgba(127, 59, 8," + opacity + ")"]
          ]
        }
      }
    }
  }
}

// 组件卸载之前销毁mars3d实例
onUnmounted(() => {
  if (map) {
    map.destroy()
    map = null
  }
  console.log("map销毁完成", map)
})
</script>

<style lang="less">
/**cesium 工具按钮栏*/
.cesium-viewer-toolbar {
  top: auto !important;
  bottom: 35px !important;
  left: 12px !important;
  right: auto !important;
}
.cesium-toolbar-button img {
  height: 100%;
}
.cesium-viewer-toolbar > .cesium-toolbar-button,
.cesium-navigationHelpButton-wrapper,
.cesium-viewer-geocoderContainer {
  margin-bottom: 5px;
  float: left;
  clear: both;
  text-align: center;
}
.cesium-button {
  background-color: rgba(23, 49, 71, 0.7);
  color: #e6e6e6;
  fill: #e6e6e6;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
  line-height: 32px;
}
.cesium-button:hover {
  background-color: rgba(0, 138, 255, 0.7);
}

/**cesium 底图切换面板*/
.cesium-baseLayerPicker-dropDown {
  bottom: 0;
  left: 40px;
  max-height: 700px;
  margin-bottom: 5px;
  background-color: rgba(23, 49, 71, 0.7);
}

/**cesium 帮助面板*/
.cesium-navigation-help {
  top: auto;
  bottom: 0;
  left: 40px;
  transform-origin: left bottom;
  background: none;
  background-color: rgba(23, 49, 71, 0.8);
  .cesium-navigation-help-instructions {
    background: none;
  }
  .cesium-navigation-button {
    background: none;
  }
  .cesium-navigation-button-selected,
  .cesium-navigation-button-unselected:hover {
    background-color: rgba(23, 49, 71, 1);
  }
}

/**cesium 二维三维切换*/
.cesium-sceneModePicker-wrapper {
  width: auto;
}
.cesium-sceneModePicker-wrapper .cesium-sceneModePicker-dropDown-icon {
  float: right;
  margin: 0 3px;
}

/**cesium POI查询输入框*/
.cesium-viewer-geocoderContainer .search-results {
  left: 0;
  right: 40px;
  width: auto;
  z-index: 9999;
}
.cesium-geocoder-searchButton {
  background-color: rgba(23, 49, 71, 0.8);
}
.cesium-viewer-geocoderContainer .cesium-geocoder-input {
  background-color: rgba(63, 72, 84, 0.7);
}
.cesium-viewer-geocoderContainer .cesium-geocoder-input:focus {
  background-color: var(--mars-bg-base, rgba(63, 72, 84, 0.9));
}
.cesium-viewer-geocoderContainer .search-results {
  background-color: rgba(23, 49, 71, 0.8);
}

/**cesium info信息框*/
.cesium-infoBox {
  top: 50px;
  background: var(--mars-bg-base, rgba(63, 72, 84, 0.9));
}
.cesium-infoBox-title {
  background-color: rgba(23, 49, 71, 0.8);
}

/**cesium 任务栏的FPS信息*/
.cesium-performanceDisplay-defaultContainer {
  top: auto;
  bottom: 35px;
  right: 50px;
}
.cesium-performanceDisplay-ms,
.cesium-performanceDisplay-fps {
  color: #fff;
}

/**cesium tileset调试信息面板*/
.cesium-viewer-cesiumInspectorContainer {
  top: 10px;
  left: 10px;
  right: auto;
}
.cesium-cesiumInspector {
  background-color: rgba(23, 49, 71, 0.8);
}

/**覆盖mars3d内部控件的颜色等样式*/
.mars3d-compass .mars3d-compass-outer {
  fill: rgba(23, 49, 71, 0.8);
}
.mars3d-contextmenu-ul,
.mars3d-sub-menu {
  background-color: rgba(23, 49, 71, 0.8);

  > li > a:hover,
  > li > a:focus,
  > li > .active {
    background-color: var(--mars-hover-btn-bg, #3ea6ff);
  }

  > .active > a,
  > .active > a:hover,
  > .active > a:focus {
    background-color: var(--mars-hover-btn-bg, #3ea6ff);
  }
}

/* Popup样式*/
.mars3d-popup-color {
  color: var(--mars-text-color, #ffffff);
}
.mars3d-popup-background {
  background: var(--mars-bg-base, rgba(63, 72, 84, 0.9));
}
.mars3d-popup-content {
  margin: 15px;
}
.mars3d-popup-btn-custom {
  padding: 3px 10px;
  border: 1px solid #209ffd;
  background: #209ffd1c;
  color: var(--mars-text-color);

}

.mars3d-tooltip {
  color: var(--mars-text-color, #ffffff);
  background: var(--mars-bg-base, rgba(63, 72, 84, 0.9));
  border: 1px solid var(--mars-bg-base, rgba(63, 72, 84, 0.9));
}

.mars3d-tooltip-top:before {
  border-top-color: var(--mars-bg-base, rgba(23, 49, 71, 0.8));
}

.mars3d-tooltip-bottom:before {
  border-bottom-color: var(--mars-bg-base, rgba(23, 49, 71, 0.8));
}

.mars3d-tooltip-left:before {
  border-left-color: var(--mars-bg-base, rgba(23, 49, 71, 0.8));
}

.mars3d-tooltip-right:before {
  border-right-color: var(--mars-bg-base, rgba(23, 49, 71, 0.8));
}

/* all 中的html样式 */
.mars3d-template-titile {
  color: var(--mars-base-color);
  border-bottom: 1px solid var(--mars-hover-btn-bg);
  a {
    font-size: 16px;
    color: var(--mars-text-color);
  }
}
.mars3d-template-content {
  label {
    padding-right: 6px;
  }

  input {
    color: var(--mars-text-color);
    background-color: transparent !important;
    padding: 4px 5px;
  }
  input::placeholder {
    color: #cdcdcd !important;
  }

  textarea {
    color: var(--mars-base-color);
    background-color: transparent !important;
    padding: 4px 5px;
  }
  textarea::placeholder {
    color: #cdcdcd !important;
  }
}
</style>
