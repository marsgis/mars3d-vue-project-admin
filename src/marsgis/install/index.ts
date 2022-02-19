import "mars3d-cesium/Build/Cesium/Widgets/widgets.css"
import * as Cesium from "mars3d-cesium"

import "mars3d/dist/mars3d.css"
import * as mars3d from "mars3d"


import { App } from "vue"
import { injectState, key } from "@mars/common/store/widget"
import widgetStore from "@mars/widget-store"
import MarsUI from "@mars/components/mars-ui"

export default {
  install: (app: App) => {
    // mars3d sdk的挂载
    app.config.globalProperties.Cesium = Cesium
    app.config.globalProperties.mars3d = mars3d

    // mars3d基础项目
    app.use(MarsUI)
    app.use(injectState(widgetStore), key)

    return app
  }
}
