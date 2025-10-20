// 引入 echarts 核心模块，提供了 echarts 使用必须要的接口
import * as echarts from 'echarts/core'

import { BarChart } from 'echarts/charts'
import { PieChart } from 'echarts/charts'
import { LineChart } from 'echarts/charts'

import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DatasetComponent,
  TransformComponent,
  LegendComponent,
  GraphicComponent
} from 'echarts/components'

import { LabelLayout, UniversalTransition } from 'echarts/features'

import { CanvasRenderer } from 'echarts/renderers'

// 注册必须的组件
echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DatasetComponent,
  TransformComponent,
  LegendComponent,
  GraphicComponent,
  BarChart,
  PieChart,
  LineChart,
  LabelLayout,
  UniversalTransition,
  CanvasRenderer
])

// 导出配置好的 echarts
export default echarts