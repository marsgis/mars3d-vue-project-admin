/**
 * 统一定义ts模块类型
 * @copyright 火星科技 mars3d.cn
 * @author 木遥 2021-11-01
 */

declare module "*.vue" {
  import { DefineComponent } from "vue"
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module "nprogress" {
  const nprogress: any
  export default nprogress
}

declare module "uuid" {
  export const v4: any
}

declare module "kml-geojson" {
  const kg: (...args: any[]) => any
  export default kg
}

declare module "*.svg" {
  const content: any
  export default content
}
