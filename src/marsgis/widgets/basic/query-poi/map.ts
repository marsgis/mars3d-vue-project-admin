/**
 * 高德POI 查询栏 （左上角）
 * @copyright 火星科技 mars3d.cn
 * @author 火星吴彦祖 2022-01-10
 */
import * as mars3d from "mars3d"
const Cesium = mars3d.Cesium

let map: mars3d.Map // 地图对象
let graphicLayer: mars3d.layer.GraphicLayer
let queryPoi: mars3d.query.GaodePOI // GaodePOI查询
let address: any = null

// 初始化当前业务
export function onMounted(mapInstance: mars3d.Map): void {
  map = mapInstance // 记录map

  queryPoi = new mars3d.query.GaodePOI({
    // city: '合肥市',
  })

  graphicLayer = new mars3d.layer.GraphicLayer({
    name: "PIO查询",
    pid: 99 // 图层管理 中使用，父节点id
  })

  graphicLayer.bindPopup(function (event: any) {
    const item = event.graphic?.attr
    if (!item) {
      return
    }
    let inHtml = `<div class="mars3d-template-titile"><a href="https://www.amap.com/detail/${item.id}"  target="_black" style="color: #ffffff; ">${item.name}</a></div><div class="mars3d-template-content" >`

    if (item.tel !== "") {
      inHtml += "<div><label>电话:</label>" + item.tel + "</div>"
    }

    if (item.address) {
      inHtml += "<div><label>地址:</label>" + item.address + "</div>"
    }
    if (item.type) {
      const fl = item.type
      if (fl !== "") {
        inHtml += "<div><label>类别:</label>" + fl + "</div>"
      }
    }
    inHtml += "</div>"
    return inHtml
  })

  map.addLayer(graphicLayer)

  map.on(mars3d.EventType.cameraChanged, cameraChanged)
}

function cameraChanged() {
  queryPoi.getAddress({
    location: map.getCenter(),
    success: (result: any) => {
      address = result
    }
  })
}

// 释放当前业务
export function onUnmounted(): void {
  map.removeLayer(graphicLayer)
  map.off(mars3d.EventType.cameraChanged, cameraChanged)
  graphicLayer.remove()
  queryPoi = null
  address = null
  map = null
}

// 查询数据
export function queryData(val: string): Promise<any> {
  return new Promise((resolve) => {
    queryPoi.autoTip({
      text: val,
      city: address?.city,
      location: map.getCenter(),
      success: (result: any) => {
        resolve(result)
      }
    })
  })
}

export function querySiteList(text: string, page: number): Promise<any> {
  return new Promise((resolve) => {
    queryPoi.queryText({
      text,
      count: 6,
      page: page - 1,
      city: address?.city,
      success: (result: any) => {
        resolve(result)
      }
    })
  })
}

/**
 * 加载查询之后的数据，通过矢量数据展示出来
 * @param {any} arr 查询之后的数据
 * @returns {void} 无
 */
export function showPOIArr(arr: any): void {
  clearLayers()

  arr.forEach((item: any) => {
    const jd = Number(item.lng)
    const wd = Number(item.lat)
    if (isNaN(jd) || isNaN(wd)) {
      return
    }

    item.lng = jd
    item.lat = wd

    // 添加实体
    const graphic = new mars3d.graphic.PointEntity({
      position: Cesium.Cartesian3.fromDegrees(jd, wd),
      style: {
        pixelSize: 10,
        color: "#3388ff",
        outline: true,
        outlineColor: "#ffffff",
        outlineWidth: 2,
        scaleByDistance: new Cesium.NearFarScalar(1000, 1, 1000000, 0.1),
        clampToGround: true, // 贴地
        visibleDepth: false, // 是否被遮挡
        label: {
          text: item.name,
          font_size: 20,
          color: "rgb(240,255,255)",
          outline: true,
          outlineWidth: 2,
          outlineColor: Cesium.Color.BLACK,
          horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          pixelOffsetY: -10, // 偏移量
          distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0.0, 200000),
          clampToGround: true, // 贴地
          visibleDepth: false // 是否被遮挡
        }
      },
      attr: item
    })
    graphicLayer.addGraphic(graphic)

    item._graphic = graphic
  })

  if (arr.length > 1) {
    graphicLayer.flyTo()
  }
}

/**
 * 判断是否为经纬度值，
 * 若是，加载为矢量数据且定位至该矢量数据
 * 若否，返回
 * @param {string} text 输入框输入的关键字
 * @returns {void} 无
 */
export function centerAtLonLat(text: string): void {
  const arr = text.split(",")
  if (arr.length !== 2) {
    return
  }

  const jd = Number(arr[0])
  const wd = Number(arr[1])
  if (isNaN(jd) || isNaN(wd)) {
    return
  }

  // 添加实体
  const graphic = new mars3d.graphic.PointEntity({
    position: Cesium.Cartesian3.fromDegrees(jd, wd),
    style: {
      color: "#3388ff",
      pixelSize: 10,
      outline: true,
      outlineColor: "#ffffff",
      outlineWidth: 2,
      scaleByDistance: new Cesium.NearFarScalar(1000, 1, 1000000, 0.1),
      clampToGround: true, // 贴地
      visibleDepth: false // 是否被遮挡
    }
  })
  graphicLayer.addGraphic(graphic)

  graphic.bindPopup(`<div class="mars3d-template-titile">坐标定位</div>
              <div class="mars3d-template-content" >
                <div><label>经度</label> ${jd}</div>
                <div><label>纬度</label>${wd}</div>
              </div>`)

  graphic.openHighlight()

  graphic.flyTo({
    radius: 1000, // 点数据：radius控制视距距离
    scale: 1.5, // 线面数据：scale控制边界的放大比例
    complete: () => {
      graphic.openPopup()
    }
  })
}

export function flyToGraphic(graphic: mars3d.graphic.BaseGraphic, option: any): void {
  map.flyToGraphic(graphic, option)

  setTimeout(() => {
    graphicLayer.openPopup(graphic)
  }, 3000)
}

export function clearLayers(): void {
  graphicLayer.closePopup()
  graphicLayer.clear()
}
