import {
  FileBarChart,
  PieChart,
  DollarSign,
  Store,
  TrendingUp,
  Download,
} from 'lucide-react'
import { type SidebarData } from '../types'

export const sidebarData: SidebarData = {
  user: {
    name: 'satnaing',
    email: 'satnaingdev@gmail.com',
    avatar: '/avatars/shadcn.jpg',
  },
  teams: [],
  navGroups: [
    {
      title: '外卖报表',
      items: [
        {
          title: '报表中心',
          url: '/reports',
          icon: FileBarChart,
        },
        {
          title: '城市维度-外卖整体分析',
          url: '/reports/waimai/city-overview',
          icon: PieChart,
        },
        {
          title: '城市维度-外卖补贴分析',
          url: '/reports/waimai/city-subsidy',
          icon: DollarSign,
        },
        {
          title: '区域维度-外卖补贴分析',
          url: '/reports/waimai/area-subsidy',
          icon: DollarSign,
        },
        {
          title: '商家维度-外卖商家费率&PHF&配送费',
          url: '/reports/waimai/merchant-fee',
          icon: Store,
        },
        {
          title: '区域维度-外卖商家费率&PHF&配送费',
          url: '/reports/waimai/area-fee',
          icon: Store,
        },
        {
          title: '商家维度-外卖商家线上盈亏',
          url: '/reports/waimai/merchant-pnl',
          icon: TrendingUp,
        },
      ],
    },
    {
      title: '城市经营',
      items: [
        {
          title: '城市-股东利润表(MTD)',
          url: '/reports/city-operation/shareholder-pnl',
          icon: FileBarChart,
        },
        {
          title: '报表数据下载',
          url: '/reports/city-operation/data-download',
          icon: Download,
        },
      ],
    },
  ],
}
