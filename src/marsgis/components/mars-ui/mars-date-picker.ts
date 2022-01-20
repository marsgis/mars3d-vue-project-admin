import { DatePicker } from "ant-design-vue"
import { App, defineComponent, h } from "vue"
import dayjs from "dayjs"
import "dayjs/locale/zh-cn"
import locale from "ant-design-vue/es/date-picker/locale/zh_CN"

dayjs.locale("zh-cn")

/**
 * 日期选择器
 *
 * @copyright 火星科技 mars3d.cn
 * @author 木遥 2021-11-01
 */

const MarsDatePicker = defineComponent({
  name: "mars-date-picker",
  inheritAttrs: false,
  setup(props, context) {
    return () => h(DatePicker, { locale, dayjs, ...context.attrs, ...props }, context.slots)
  }
})

export function install(app: App): App {
  app.component(MarsDatePicker.name, MarsDatePicker)
  return app
}
export default MarsDatePicker
