import ReactECharts from 'echarts-for-react'

const data = [
  {
    name: '周一',
    clicks: Math.floor(Math.random() * 900) + 100,
    uniques: Math.floor(Math.random() * 700) + 80,
  },
  {
    name: '周二',
    clicks: Math.floor(Math.random() * 900) + 100,
    uniques: Math.floor(Math.random() * 700) + 80,
  },
  {
    name: '周三',
    clicks: Math.floor(Math.random() * 900) + 100,
    uniques: Math.floor(Math.random() * 700) + 80,
  },
  {
    name: '周四',
    clicks: Math.floor(Math.random() * 900) + 100,
    uniques: Math.floor(Math.random() * 700) + 80,
  },
  {
    name: '周五',
    clicks: Math.floor(Math.random() * 900) + 100,
    uniques: Math.floor(Math.random() * 700) + 80,
  },
  {
    name: '周六',
    clicks: Math.floor(Math.random() * 900) + 100,
    uniques: Math.floor(Math.random() * 700) + 80,
  },
  {
    name: '周日',
    clicks: Math.floor(Math.random() * 900) + 100,
    uniques: Math.floor(Math.random() * 700) + 80,
  },
]

export function AnalyticsChart() {
  const option = {
    grid: {
      top: 20,
      right: 10,
      bottom: 30,
      left: 50,
    },
    xAxis: {
      type: 'category',
      data: data.map((d) => d.name),
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#64748d', fontSize: 12 },
      boundaryGap: false,
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#64748d', fontSize: 12 },
      splitLine: { show: false },
    },
    series: [
      {
        name: 'Clicks',
        type: 'line',
        smooth: true,
        data: data.map((d) => d.clicks),
        lineStyle: { color: '#533afd' },
        itemStyle: { color: '#533afd' },
        areaStyle: { color: 'rgba(83, 58, 253, 0.15)' },
        symbol: 'none',
      },
      {
        name: 'Uniques',
        type: 'line',
        smooth: true,
        data: data.map((d) => d.uniques),
        lineStyle: { color: '#64748d' },
        itemStyle: { color: '#64748d' },
        areaStyle: { color: 'rgba(100, 116, 141, 0.1)' },
        symbol: 'none',
      },
    ],
    tooltip: {
      trigger: 'axis',
    },
  }

  return <ReactECharts option={option} style={{ height: 300 }} />
}
