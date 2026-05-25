import {
  Construction,
  LayoutDashboard,
  Monitor,
  Bug,
  ListTodo,
  FileX,
  HelpCircle,
  Lock,
  Bell,
  Package,
  Palette,
  ServerOff,
  Settings,
  Wrench,
  UserCog,
  UserX,
  Users,
  MessagesSquare,
  ShieldCheck,
  AudioWaveform,
  Command,
  GalleryVerticalEnd,
  FileBarChart,
  UtensilsCrossed,
  Building2,
  PieChart,
  DollarSign,
  Store,
  TrendingUp,
  Download,
} from 'lucide-react'
import { ClerkLogo } from '@/assets/clerk-logo'
import { type SidebarData } from '../types'

export const sidebarData: SidebarData = {
  user: {
    name: 'satnaing',
    email: 'satnaingdev@gmail.com',
    avatar: '/avatars/shadcn.jpg',
  },
  teams: [
    {
      name: 'Shadcn Admin',
      logo: Command,
      plan: 'Vite + ShadcnUI',
    },
    {
      name: 'Acme Inc',
      logo: GalleryVerticalEnd,
      plan: 'Enterprise',
    },
    {
      name: 'Acme Corp.',
      logo: AudioWaveform,
      plan: 'Startup',
    },
  ],
  navGroups: [
    {
      title: '通用',
      items: [
        {
          title: '仪表盘',
          url: '/',
          icon: LayoutDashboard,
        },
        {
          title: '报表中心',
          url: '/reports',
          icon: FileBarChart,
        },
        {
          title: '任务',
          url: '/tasks',
          icon: ListTodo,
        },
        {
          title: '应用',
          url: '/apps',
          icon: Package,
        },
        {
          title: '聊天',
          url: '/chats',
          badge: '3',
          icon: MessagesSquare,
        },
        {
          title: '用户',
          url: '/users',
          icon: Users,
        },
        {
          title: 'Cler 认证',
          icon: ClerkLogo,
          items: [
            {
              title: '登录',
              url: '/clerk/sign-in',
            },
            {
              title: '注册',
              url: '/clerk/sign-up',
            },
            {
              title: '用户管理',
              url: '/clerk/user-management',
            },
          ],
        },
      ],
    },
    {
      title: '外卖报表',
      items: [
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
    {
      title: '页面',
      items: [
        {
          title: '认证',
          icon: ShieldCheck,
          items: [
            {
              title: '登录',
              url: '/sign-in',
            },
            {
              title: '登录（两栏）',
              url: '/sign-in-2',
            },
            {
              title: '注册',
              url: '/sign-up',
            },
            {
              title: '忘记密码',
              url: '/forgot-password',
            },
            {
              title: '验证码',
              url: '/otp',
            },
          ],
        },
        {
          title: '错误',
          icon: Bug,
          items: [
            {
              title: '未授权',
              url: '/errors/unauthorized',
              icon: Lock,
            },
            {
              title: '禁止访问',
              url: '/errors/forbidden',
              icon: UserX,
            },
            {
              title: '未找到',
              url: '/errors/not-found',
              icon: FileX,
            },
            {
              title: '服务器内部错误',
              url: '/errors/internal-server-error',
              icon: ServerOff,
            },
            {
              title: '维护中',
              url: '/errors/maintenance-error',
              icon: Construction,
            },
          ],
        },
      ],
    },
    {
      title: '其他',
      items: [
        {
          title: '设置',
          icon: Settings,
          items: [
            {
              title: '个人资料',
              url: '/settings',
              icon: UserCog,
            },
            {
              title: '账户',
              url: '/settings/account',
              icon: Wrench,
            },
            {
              title: '外观',
              url: '/settings/appearance',
              icon: Palette,
            },
            {
              title: '通知',
              url: '/settings/notifications',
              icon: Bell,
            },
            {
              title: '显示',
              url: '/settings/display',
              icon: Monitor,
            },
          ],
        },
        {
          title: '帮助中心',
          url: '/help-center',
          icon: HelpCircle,
        },
      ],
    },
  ],
}
