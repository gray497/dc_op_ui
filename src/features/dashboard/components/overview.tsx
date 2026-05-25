import ReactECharts from 'echarts-for-react'

const data = [
  { name: '1月', total: Math.floor(Math.random() * 5000) + 1000 },
  { name: '2月', total: Math.floor(Math.random() * 5000) + 1000 },
  { name: '3月', total: Math.floor(Math.random() * 5000) + 1000 },
  { name: '4月', total: Math.floor(Math.random() * 5000) + 1000 },
  { name: '5月', total: Math.floor(Math.random() * 5000) + 1000 },
  { name: '6月', total: Math.floor(Math.random() * 5000) + 1000 },
  { name: '7月', total: Math.floor(Math.random() * 5000) + 1000 },
  { name: '8月', total: Math.floor(Math.random() * 5000) + 1000 },
  { name: '9月', total: Math.floor(Math.random() * 5000) + 1000 },
  { name: '10月', total: Math.floor(Math.random() * 5000) + 1000 },
  { name: '11月', total: Math.floor(Math.random() * 5000) + 1000 },
  { name: '12月', total: Math.floor(Math.random() * 5000) + 1000 },
]

export function Overview() {
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
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: '#64748d',
        fontSize: 12,
        formatter: '${value}',
      },
      splitLine: { show: false },
    },
    series: [
      {
        type: 'bar',
        data: data.map((d) => d.total),
        barWidth: '60%',
        itemStyle: {
          color: '#533afd',
          borderRadius: [4, 4, 0, 0],
        },
      },
    ],
    tooltip: {
      trigger: 'axis',
      formatter: (params: { name: string; value: number }[]) => {
        const p = params[0]
        return `${p.name}<br/>$${p.value.toLocaleString()}`
      },
    },
  }

  return <ReactECharts option={option} style={{ height: 350 }} />
}
