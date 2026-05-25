import { type ColumnDef, type VisibilityState } from '@tanstack/react-table'
import { HelpCircle } from 'lucide-react'
import { DataTableColumnHeader } from '@/components/data-table'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { type CityOverviewRow } from '../data/schema'

// ── 格式化工具函数 ────────────────────────────────────────────────────────────

export function formatNumber(v: number | null | undefined): string {
  if (v == null) return '—'
  return new Intl.NumberFormat('zh-CN', { maximumFractionDigits: 0 }).format(v)
}

export function formatPercent(v: number | null | undefined): string {
  if (v == null) return '—'
  return `${v}%`
}

export function getProfitColorClass(v: number | null | undefined): string {
  if (v == null || v === 0) return ''
  return v > 0
    ? 'text-green-600 dark:text-green-400'
    : 'text-red-600 dark:text-red-400'
}

export function applyDateRangeConstraint(range: {
  startDate: string
  endDate: string
}): { startDate: string; endDate: string } {
  const { startDate, endDate } = range
  if (startDate > endDate) return { startDate, endDate: startDate }
  return { startDate, endDate }
}

// ── HeaderWithTooltip ─────────────────────────────────────────────────────────

interface HeaderWithTooltipProps {
  title: string
  tooltip: string
}

export function HeaderWithTooltip({ title, tooltip }: HeaderWithTooltipProps) {
  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className='flex cursor-default items-center gap-1'>
            <span>{title}</span>
            <HelpCircle className='h-3 w-3 text-muted-foreground' />
          </div>
        </TooltipTrigger>
        <TooltipContent className='max-w-[320px] whitespace-pre-wrap'>
          {tooltip}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

// ── 基础维度列（所有 Tab 共用） ───────────────────────────────────────────────

export const basicColumns: ColumnDef<CityOverviewRow>[] = [
  {
    id: '#',
    header: '#',
    cell: ({ row }) => (
      <div className='text-center text-muted-foreground'>{row.index + 1}</div>
    ),
    enableSorting: false,
    enableHiding: false,
    enableColumnFilter: false,
    size: 50,
    minSize: 50,
    meta: { className: 'bg-muted/50 text-center' },
  },
  {
    id: 'group_basic',
    header: '基础维度',
    columns: [
      { accessorKey: 'report_date', header: '日期', minSize: 100 },
      {
        accessorKey: 'city_short_name',
        header: '城市简称',
        minSize: 80,
        filterFn: (row, id, value: string[]) => value.includes(row.getValue(id)),
      },
      { accessorKey: 'city_name', header: '美团系统城市名称', minSize: 120 },
      { accessorKey: 'city_level', header: '城市等级', minSize: 80 },
      {
        accessorKey: 'region',
        header: '区域',
        minSize: 80,
        filterFn: (row, id, value: string[]) => value.includes(row.getValue(id)),
      },
      { accessorKey: 'manager', header: '负责人', minSize: 80 },
      {
        accessorKey: 'merchant_type_group',
        header: '商家类型',
        minSize: 100,
        filterFn: (row, id, value: string[]) => value.includes(row.getValue(id)),
      },
    ],
  },
]

// ── Tab 1：盈亏概览 ───────────────────────────────────────────────────────────

const pnlColumns: ColumnDef<CityOverviewRow>[] = [
  {
    id: 'group_pnl',
    header: '线上盈亏',
    columns: [
      {
        accessorKey: 'revenue_total',
        header: ({ column }) => <DataTableColumnHeader column={column} title='线上账单收入合计' />,
        cell: ({ getValue }) => formatNumber(getValue<number | null>()),
        minSize: 120,
      },
      {
        accessorKey: 'cost_total',
        header: ({ column }) => <DataTableColumnHeader column={column} title='线上账单成本合计' />,
        cell: ({ getValue }) => formatNumber(getValue<number | null>()),
        minSize: 120,
      },
      {
        accessorKey: 'gross_profit',
        header: ({ column }) => <DataTableColumnHeader column={column} title='线上账单毛利' />,
        cell: ({ getValue }) => {
          const v = getValue<number | null>()
          return <span className={getProfitColorClass(v)}>{formatNumber(v)}</span>
        },
        minSize: 120,
      },
      {
        accessorKey: 'gross_profit_rate',
        header: () => (
          <HeaderWithTooltip
            title='线上账单毛利率'
            tooltip={'线上账单毛利率\n公式：线上账单毛利 / 线上账单收入合计 × 100\n来源：ads_merchant_pnl_daily'}
          />
        ),
        cell: ({ getValue }) => formatPercent(getValue<number | null>()),
        minSize: 100,
      },
    ],
  },
  {
    id: 'group_orders',
    header: '订单量与跨期分析',
    columns: [
      {
        accessorKey: 'order_count_consume',
        header: ({ column }) => <DataTableColumnHeader column={column} title='消费订单量' />,
        cell: ({ getValue }) => formatNumber(getValue<number | null>()),
        minSize: 100,
      },
      {
        accessorKey: 'order_count_bill',
        header: ({ column }) => <DataTableColumnHeader column={column} title='线上账单订单量' />,
        cell: ({ getValue }) => formatNumber(getValue<number | null>()),
        minSize: 120,
      },
      {
        accessorKey: 'order_count_tn',
        header: ({ column }) => <DataTableColumnHeader column={column} title='T-n线上账单订单量' />,
        cell: ({ getValue }) => formatNumber(getValue<number | null>()),
        minSize: 130,
      },
      {
        accessorKey: 'order_count_tn_plus',
        header: ({ column }) => <DataTableColumnHeader column={column} title='T+n线上账单订单量' />,
        cell: ({ getValue }) => formatNumber(getValue<number | null>()),
        minSize: 130,
      },
      {
        accessorKey: 'order_count_tn_ratio',
        header: () => (
          <HeaderWithTooltip
            title='T-n线上账单订单占比'
            tooltip={'T-n线上账单订单占比\n公式：T-n线上账单订单量 / 线上账单订单量 × 100\n来源：ads_merchant_pnl_daily'}
          />
        ),
        cell: ({ getValue }) => formatPercent(getValue<number | null>()),
        minSize: 130,
      },
      {
        accessorKey: 'order_count_tn_plus_ratio',
        header: () => (
          <HeaderWithTooltip
            title='T+n线上账单订单占比'
            tooltip={'T+n线上账单订单占比\n公式：T+n线上账单订单量 / 线上账单订单量 × 100\n来源：ads_merchant_pnl_daily'}
          />
        ),
        cell: ({ getValue }) => formatPercent(getValue<number | null>()),
        minSize: 130,
      },
    ],
  },
]

export const tab1Columns: ColumnDef<CityOverviewRow>[] = [...basicColumns, ...pnlColumns]
export const tab1DefaultVisibility: VisibilityState = {}

// ── Tab 2：商家健康 ───────────────────────────────────────────────────────────

const merchantHealthColumns: ColumnDef<CityOverviewRow>[] = [
  {
    id: 'group_merchant_health',
    header: '交易商家健康度',
    columns: [
      {
        accessorKey: 'merchant_count_total',
        header: ({ column }) => <DataTableColumnHeader column={column} title='全量商家数' />,
        cell: ({ getValue }) => formatNumber(getValue<number | null>()),
        minSize: 100,
      },
      {
        accessorKey: 'merchant_count_fee_gt0',
        header: ({ column }) => <DataTableColumnHeader column={column} title='商家服务费>0商家数' />,
        cell: ({ getValue }) => formatNumber(getValue<number | null>()),
        minSize: 140,
      },
      {
        accessorKey: 'merchant_count_profit_gte0',
        header: ({ column }) => <DataTableColumnHeader column={column} title='线上账单毛利≥0商家数' />,
        cell: ({ getValue }) => formatNumber(getValue<number | null>()),
        minSize: 150,
      },
      {
        accessorKey: 'merchant_count_profit_lt0',
        header: ({ column }) => <DataTableColumnHeader column={column} title='线上账单毛利<0商家数' />,
        cell: ({ getValue }) => formatNumber(getValue<number | null>()),
        minSize: 150,
      },
      {
        accessorKey: 'merchant_ratio_fee_gt0',
        header: () => (
          <HeaderWithTooltip
            title='商家服务费>0商家占比'
            tooltip={'商家服务费>0商家占比\n公式：商家服务费>0商家数 / 全量商家数 × 100\n来源：ads_merchant_pnl_daily'}
          />
        ),
        cell: ({ getValue }) => formatPercent(getValue<number | null>()),
        minSize: 150,
      },
      {
        accessorKey: 'merchant_ratio_profit_gte0',
        header: () => (
          <HeaderWithTooltip
            title='线上账单毛利≥0交易商家占比'
            tooltip={'线上账单毛利≥0交易商家占比\n公式：毛利≥0商家数 / 商家服务费>0商家数 × 100\n来源：ads_merchant_pnl_daily'}
          />
        ),
        cell: ({ getValue }) => formatPercent(getValue<number | null>()),
        minSize: 170,
      },
      {
        accessorKey: 'merchant_ratio_profit_lt0',
        header: () => (
          <HeaderWithTooltip
            title='线上账单毛利<0交易商家占比'
            tooltip={'线上账单毛利<0交易商家占比\n公式：毛利<0商家数 / 商家服务费>0商家数 × 100\n来源：ads_merchant_pnl_daily'}
          />
        ),
        cell: ({ getValue }) => formatPercent(getValue<number | null>()),
        minSize: 170,
      },
      {
        accessorKey: 'merchant_count_gtv0_fee0',
        header: ({ column }) => <DataTableColumnHeader column={column} title='消费GTV=0且服务费=0商家数' />,
        cell: ({ getValue }) => formatNumber(getValue<number | null>()),
        minSize: 190,
      },
      {
        accessorKey: 'merchant_ratio_gtv0_fee0',
        header: () => (
          <HeaderWithTooltip
            title='消费GTV=0且服务费=0商家占比'
            tooltip={'消费GTV=0且商家服务费=0商家占比\n公式：对应商家数 / 全量商家数 × 100\n来源：ads_merchant_pnl_daily'}
          />
        ),
        cell: ({ getValue }) => formatPercent(getValue<number | null>()),
        minSize: 200,
      },
      {
        accessorKey: 'merchant_count_gtv0_fee_gt0',
        header: ({ column }) => <DataTableColumnHeader column={column} title='消费GTV=0且服务费>0商家数' />,
        cell: ({ getValue }) => formatNumber(getValue<number | null>()),
        minSize: 200,
      },
      {
        accessorKey: 'merchant_count_gtv_gt0_fee0',
        header: ({ column }) => <DataTableColumnHeader column={column} title='消费GTV>0且服务费=0商家数' />,
        cell: ({ getValue }) => formatNumber(getValue<number | null>()),
        minSize: 190,
      },
    ],
  },
  {
    id: 'group_loss_profit',
    header: '亏损毛利明细',
    columns: [
      {
        accessorKey: 'loss_profit_total',
        header: ({ column }) => <DataTableColumnHeader column={column} title='毛利<0交易商家毛利合计' />,
        cell: ({ getValue }) => {
          const v = getValue<number | null>()
          return <span className={getProfitColorClass(v)}>{formatNumber(v)}</span>
        },
        minSize: 190,
      },
      {
        accessorKey: 'loss_profit_proxy',
        header: ({ column }) => <DataTableColumnHeader column={column} title='毛利<0_代理' />,
        cell: ({ getValue }) => {
          const v = getValue<number | null>()
          return <span className={getProfitColorClass(v)}>{formatNumber(v)}</span>
        },
        minSize: 120,
      },
      {
        accessorKey: 'loss_profit_runner',
        header: ({ column }) => <DataTableColumnHeader column={column} title='毛利<0_跑腿' />,
        cell: ({ getValue }) => {
          const v = getValue<number | null>()
          return <span className={getProfitColorClass(v)}>{formatNumber(v)}</span>
        },
        minSize: 120,
      },
      {
        accessorKey: 'loss_profit_merchant_delivery',
        header: ({ column }) => <DataTableColumnHeader column={column} title='毛利<0_商家配送' />,
        cell: ({ getValue }) => {
          const v = getValue<number | null>()
          return <span className={getProfitColorClass(v)}>{formatNumber(v)}</span>
        },
        minSize: 140,
      },
      {
        accessorKey: 'loss_profit_other',
        header: ({ column }) => <DataTableColumnHeader column={column} title='毛利<0_其他配送' />,
        cell: ({ getValue }) => {
          const v = getValue<number | null>()
          return <span className={getProfitColorClass(v)}>{formatNumber(v)}</span>
        },
        minSize: 140,
      },
    ],
  },
]

export const tab2Columns: ColumnDef<CityOverviewRow>[] = [...basicColumns, ...merchantHealthColumns]
export const tab2DefaultVisibility: VisibilityState = {}

// ── Tab 3：费率分析 ───────────────────────────────────────────────────────────
// 默认隐藏各分段明细列，只显示汇总列和配送费差额

const feeRateColumns: ColumnDef<CityOverviewRow>[] = [
  {
    id: 'group_fee_rate_diff',
    header: '服务费率差额分段',
    columns: [
      {
        accessorKey: 'fee_rate_diff_lt0_total',
        header: () => (
          <HeaderWithTooltip
            title='商家支持服务费差额<0合计'
            tooltip={'商家支持服务费差额<0合计\n公式：SUM(fee_actual_no_phf - fee_std_no_phf) WHERE < 0\n来源：ads_merchant_fee_daily'}
          />
        ),
        cell: ({ getValue }) => formatNumber(getValue<number | null>()),
        minSize: 180,
      },
      {
        accessorKey: 'fee_rate_diff_neg_inf_to_neg10',
        header: () => (
          <HeaderWithTooltip
            title='服务费率差额(-∞,-10%]'
            tooltip={'服务费率差额(-∞,-10%]商家数\n公式：fee_actual_no_phf/gtv_no_phf - commercial_support_rate ≤ -10%\n来源：ads_merchant_fee_daily'}
          />
        ),
        cell: ({ getValue }) => formatNumber(getValue<number | null>()),
        minSize: 170,
      },
      {
        accessorKey: 'fee_rate_diff_neg10_to_neg5',
        header: () => (
          <HeaderWithTooltip
            title='服务费率差额(-10%,-5%]'
            tooltip={'服务费率差额(-10%,-5%]商家数\n公式：fee_actual_no_phf/gtv_no_phf - commercial_support_rate ∈ (-10%,-5%]\n来源：ads_merchant_fee_daily'}
          />
        ),
        cell: ({ getValue }) => formatNumber(getValue<number | null>()),
        minSize: 170,
      },
      {
        accessorKey: 'fee_rate_diff_neg5_to_neg1',
        header: () => (
          <HeaderWithTooltip
            title='服务费率差额(-5%,-1%]'
            tooltip={'服务费率差额(-5%,-1%]商家数\n公式：fee_actual_no_phf/gtv_no_phf - commercial_support_rate ∈ (-5%,-1%]\n来源：ads_merchant_fee_daily'}
          />
        ),
        cell: ({ getValue }) => formatNumber(getValue<number | null>()),
        minSize: 160,
      },
      {
        accessorKey: 'fee_rate_diff_neg1_to_0',
        header: () => (
          <HeaderWithTooltip
            title='服务费率差额(-1%,0%]'
            tooltip={'服务费率差额(-1%,0%]商家数\n公式：fee_actual_no_phf/gtv_no_phf - commercial_support_rate ∈ (-1%,0%]\n来源：ads_merchant_fee_daily'}
          />
        ),
        cell: ({ getValue }) => formatNumber(getValue<number | null>()),
        minSize: 160,
      },
      {
        accessorKey: 'fee_rate_diff_0_to_5',
        header: () => (
          <HeaderWithTooltip
            title='服务费率差额(0%,5%]'
            tooltip={'服务费率差额(0%,5%]商家数\n公式：fee_actual_no_phf/gtv_no_phf - commercial_support_rate ∈ (0%,5%]\n来源：ads_merchant_fee_daily'}
          />
        ),
        cell: ({ getValue }) => formatNumber(getValue<number | null>()),
        minSize: 150,
      },
      {
        accessorKey: 'fee_rate_diff_5_to_10',
        header: () => (
          <HeaderWithTooltip
            title='服务费率差额(5%,10%]'
            tooltip={'服务费率差额(5%,10%]商家数\n公式：fee_actual_no_phf/gtv_no_phf - commercial_support_rate ∈ (5%,10%]\n来源：ads_merchant_fee_daily'}
          />
        ),
        cell: ({ getValue }) => formatNumber(getValue<number | null>()),
        minSize: 160,
      },
      {
        accessorKey: 'fee_rate_diff_10_to_inf',
        header: () => (
          <HeaderWithTooltip
            title='服务费率差额(10%,+∞]'
            tooltip={'服务费率差额(10%,+∞]商家数\n公式：fee_actual_no_phf/gtv_no_phf - commercial_support_rate > 10%\n来源：ads_merchant_fee_daily'}
          />
        ),
        cell: ({ getValue }) => formatNumber(getValue<number | null>()),
        minSize: 160,
      },
    ],
  },
  {
    id: 'group_phf_income',
    header: '拼好饭保底收入分段',
    columns: [
      {
        accessorKey: 'phf_diff_lt0_count',
        header: () => (
          <HeaderWithTooltip
            title='单均PHF保底收入差额<0商家数'
            tooltip={'单均拼好饭保底收入差额<0商家数\n公式：phf_fee_actual/phf_completed_orders - phf_standard_income < 0\n来源：ads_merchant_fee_daily'}
          />
        ),
        cell: ({ getValue }) => formatNumber(getValue<number | null>()),
        minSize: 200,
      },
      {
        accessorKey: 'phf_income_0_to_3p5',
        header: () => (
          <HeaderWithTooltip
            title='PHF保底收入(0,3.5]'
            tooltip={'PHF保底收入(0,3.5]商家数\n公式：phf_fee_actual/phf_completed_orders ∈ (0,3.5]\n来源：ads_merchant_fee_daily'}
          />
        ),
        cell: ({ getValue }) => formatNumber(getValue<number | null>()),
        minSize: 150,
      },
      {
        accessorKey: 'phf_income_3p5_to_4p0',
        header: () => (
          <HeaderWithTooltip
            title='PHF保底收入(3.5,4.0]'
            tooltip={'PHF保底收入(3.5,4.0]商家数\n公式：phf_fee_actual/phf_completed_orders ∈ (3.5,4.0]\n来源：ads_merchant_fee_daily'}
          />
        ),
        cell: ({ getValue }) => formatNumber(getValue<number | null>()),
        minSize: 160,
      },
      {
        accessorKey: 'phf_income_4p0_to_4p5',
        header: () => (
          <HeaderWithTooltip
            title='PHF保底收入(4.0,4.5]'
            tooltip={'PHF保底收入(4.0,4.5]商家数\n公式：phf_fee_actual/phf_completed_orders ∈ (4.0,4.5]\n来源：ads_merchant_fee_daily'}
          />
        ),
        cell: ({ getValue }) => formatNumber(getValue<number | null>()),
        minSize: 160,
      },
      {
        accessorKey: 'phf_income_4p5_to_5p0',
        header: () => (
          <HeaderWithTooltip
            title='PHF保底收入(4.5,5.0]'
            tooltip={'PHF保底收入(4.5,5.0]商家数\n公式：phf_fee_actual/phf_completed_orders ∈ (4.5,5.0]\n来源：ads_merchant_fee_daily'}
          />
        ),
        cell: ({ getValue }) => formatNumber(getValue<number | null>()),
        minSize: 160,
      },
      {
        accessorKey: 'phf_income_5p0_to_6p0',
        header: () => (
          <HeaderWithTooltip
            title='PHF保底收入(5.0,6.0]'
            tooltip={'PHF保底收入(5.0,6.0]商家数\n公式：phf_fee_actual/phf_completed_orders ∈ (5.0,6.0]\n来源：ads_merchant_fee_daily'}
          />
        ),
        cell: ({ getValue }) => formatNumber(getValue<number | null>()),
        minSize: 160,
      },
      {
        accessorKey: 'phf_income_6p0_to_inf',
        header: () => (
          <HeaderWithTooltip
            title='PHF保底收入(6.0,+∞]'
            tooltip={'PHF保底收入(6.0,+∞]商家数\n公式：phf_fee_actual/phf_completed_orders > 6.0\n来源：ads_merchant_fee_daily'}
          />
        ),
        cell: ({ getValue }) => formatNumber(getValue<number | null>()),
        minSize: 160,
      },
    ],
  },
  {
    id: 'group_delivery_fee',
    header: '配送费差额',
    columns: [
      {
        accessorKey: 'delivery_fee_diff_lt0_count',
        header: () => (
          <HeaderWithTooltip
            title='单均配送费差额<0交易商家数'
            tooltip={'单均配送费差额<0交易商家数\n公式：delivery_income_original/order_count_no_phf - min_delivery_fee < 0\n来源：ads_merchant_fee_daily'}
          />
        ),
        cell: ({ getValue }) => formatNumber(getValue<number | null>()),
        minSize: 200,
      },
    ],
  },
]

export const tab3Columns: ColumnDef<CityOverviewRow>[] = [...basicColumns, ...feeRateColumns]
// 默认隐藏各分段明细，只显示汇总列
export const tab3DefaultVisibility: VisibilityState = {
  fee_rate_diff_neg_inf_to_neg10: false,
  fee_rate_diff_neg10_to_neg5: false,
  fee_rate_diff_neg5_to_neg1: false,
  fee_rate_diff_neg1_to_0: false,
  fee_rate_diff_0_to_5: false,
  fee_rate_diff_5_to_10: false,
  fee_rate_diff_10_to_inf: false,
  phf_income_0_to_3p5: false,
  phf_income_3p5_to_4p0: false,
  phf_income_4p0_to_4p5: false,
  phf_income_4p5_to_5p0: false,
  phf_income_5p0_to_6p0: false,
  phf_income_6p0_to_inf: false,
}

// ── Tab 4：补贴分析 ───────────────────────────────────────────────────────────

const subsidyColumns: ColumnDef<CityOverviewRow>[] = [
  {
    id: 'group_subsidy',
    header: '合作商补贴分析',
    columns: [
      {
        accessorKey: 'gtv_b',
        header: ({ column }) => <DataTableColumnHeader column={column} title='消费GTV原价B端' />,
        cell: ({ getValue }) => formatNumber(getValue<number | null>()),
        minSize: 140,
      },
      {
        accessorKey: 'subsidy_b',
        header: ({ column }) => <DataTableColumnHeader column={column} title='代理商补贴金额B端' />,
        cell: ({ getValue }) => formatNumber(getValue<number | null>()),
        minSize: 150,
      },
      {
        accessorKey: 'subsidy_rate_b',
        header: () => (
          <HeaderWithTooltip
            title='合作商补贴率B端'
            tooltip={'消费原价合作商补贴率B端\n公式：代理商补贴金额B端 / 消费GTV原价B端 × 100\n来源：mv_subsidy_daily'}
          />
        ),
        cell: ({ getValue }) => formatPercent(getValue<number | null>()),
        minSize: 150,
      },
      {
        accessorKey: 'gtv_c',
        header: ({ column }) => <DataTableColumnHeader column={column} title='消费GTV原价C端' />,
        cell: ({ getValue }) => formatNumber(getValue<number | null>()),
        minSize: 140,
      },
      {
        accessorKey: 'subsidy_c',
        header: ({ column }) => <DataTableColumnHeader column={column} title='代理商补贴金额C端' />,
        cell: ({ getValue }) => formatNumber(getValue<number | null>()),
        minSize: 150,
      },
      {
        accessorKey: 'subsidy_rate_c',
        header: () => (
          <HeaderWithTooltip
            title='合作商补贴率C端'
            tooltip={'消费原价合作商补贴率C端\n公式：代理商补贴金额C端 / 消费GTV原价C端 × 100\n来源：mv_subsidy_daily'}
          />
        ),
        cell: ({ getValue }) => formatPercent(getValue<number | null>()),
        minSize: 150,
      },
    ],
  },
  {
    id: 'group_partner_subsidy_rate',
    header: '合作商补贴率分段',
    columns: [
      {
        accessorKey: 'partner_subsidy_rate_0_to_5',
        header: () => (
          <HeaderWithTooltip
            title='合作商补贴率(0%,5%]'
            tooltip={'合作商补贴率(0%,5%]商家数\n公式：partner_subsidy_amount/gtv_original ∈ (0,5%]\n来源：ads_merchant_fee_daily'}
          />
        ),
        cell: ({ getValue }) => formatNumber(getValue<number | null>()),
        minSize: 160,
      },
      {
        accessorKey: 'partner_subsidy_rate_5_to_7',
        header: () => (
          <HeaderWithTooltip
            title='合作商补贴率(5%,7%]'
            tooltip={'合作商补贴率(5%,7%]商家数\n公式：partner_subsidy_amount/gtv_original ∈ (5%,7%]\n来源：ads_merchant_fee_daily'}
          />
        ),
        cell: ({ getValue }) => formatNumber(getValue<number | null>()),
        minSize: 160,
      },
      {
        accessorKey: 'partner_subsidy_rate_7_to_10',
        header: () => (
          <HeaderWithTooltip
            title='合作商补贴率(7%,10%]'
            tooltip={'合作商补贴率(7%,10%]商家数\n公式：partner_subsidy_amount/gtv_original ∈ (7%,10%]\n来源：ads_merchant_fee_daily'}
          />
        ),
        cell: ({ getValue }) => formatNumber(getValue<number | null>()),
        minSize: 160,
      },
      {
        accessorKey: 'partner_subsidy_rate_10_to_inf',
        header: () => (
          <HeaderWithTooltip
            title='合作商补贴率(10%,+∞]'
            tooltip={'合作商补贴率(10%,+∞]商家数\n公式：partner_subsidy_amount/gtv_original > 10%\n来源：ads_merchant_fee_daily'}
          />
        ),
        cell: ({ getValue }) => formatNumber(getValue<number | null>()),
        minSize: 170,
      },
    ],
  },
  {
    id: 'group_merchant_partner_ratio',
    header: '商代比分段',
    columns: [
      {
        accessorKey: 'merchant_partner_ratio_0_to_1',
        header: () => (
          <HeaderWithTooltip
            title='商代比(0,1]'
            tooltip={'商代比(0,1]商家数\n公式：merchant_subsidy_amount/partner_subsidy_amount ∈ (0,1]\n来源：ads_merchant_fee_daily'}
          />
        ),
        cell: ({ getValue }) => formatNumber(getValue<number | null>()),
        minSize: 120,
      },
      {
        accessorKey: 'merchant_partner_ratio_1_to_2',
        header: () => (
          <HeaderWithTooltip
            title='商代比(1,2]'
            tooltip={'商代比(1,2]商家数\n公式：merchant_subsidy_amount/partner_subsidy_amount ∈ (1,2]\n来源：ads_merchant_fee_daily'}
          />
        ),
        cell: ({ getValue }) => formatNumber(getValue<number | null>()),
        minSize: 120,
      },
      {
        accessorKey: 'merchant_partner_ratio_2_to_3',
        header: () => (
          <HeaderWithTooltip
            title='商代比(2,3]'
            tooltip={'商代比(2,3]商家数\n公式：merchant_subsidy_amount/partner_subsidy_amount ∈ (2,3]\n来源：ads_merchant_fee_daily'}
          />
        ),
        cell: ({ getValue }) => formatNumber(getValue<number | null>()),
        minSize: 120,
      },
      {
        accessorKey: 'merchant_partner_ratio_3_to_4',
        header: () => (
          <HeaderWithTooltip
            title='商代比(3,4]'
            tooltip={'商代比(3,4]商家数\n公式：merchant_subsidy_amount/partner_subsidy_amount ∈ (3,4]\n来源：ads_merchant_fee_daily'}
          />
        ),
        cell: ({ getValue }) => formatNumber(getValue<number | null>()),
        minSize: 120,
      },
      {
        accessorKey: 'merchant_partner_ratio_4_to_5',
        header: () => (
          <HeaderWithTooltip
            title='商代比(4,5]'
            tooltip={'商代比(4,5]商家数\n公式：merchant_subsidy_amount/partner_subsidy_amount ∈ (4,5]\n来源：ads_merchant_fee_daily'}
          />
        ),
        cell: ({ getValue }) => formatNumber(getValue<number | null>()),
        minSize: 120,
      },
      {
        accessorKey: 'merchant_partner_ratio_5_to_inf',
        header: () => (
          <HeaderWithTooltip
            title='商代比(5,+∞]'
            tooltip={'商代比(5,+∞]商家数\n公式：merchant_subsidy_amount/partner_subsidy_amount > 5\n来源：ads_merchant_fee_daily'}
          />
        ),
        cell: ({ getValue }) => formatNumber(getValue<number | null>()),
        minSize: 130,
      },
    ],
  },
]

export const tab4Columns: ColumnDef<CityOverviewRow>[] = [...basicColumns, ...subsidyColumns]
// 默认隐藏分段明细，只显示补贴汇总
export const tab4DefaultVisibility: VisibilityState = {
  partner_subsidy_rate_0_to_5: false,
  partner_subsidy_rate_5_to_7: false,
  partner_subsidy_rate_7_to_10: false,
  partner_subsidy_rate_10_to_inf: false,
  merchant_partner_ratio_0_to_1: false,
  merchant_partner_ratio_1_to_2: false,
  merchant_partner_ratio_2_to_3: false,
  merchant_partner_ratio_3_to_4: false,
  merchant_partner_ratio_4_to_5: false,
  merchant_partner_ratio_5_to_inf: false,
}

// ── Tab 5：异常单 ─────────────────────────────────────────────────────────────

const abnormalColumns: ColumnDef<CityOverviewRow>[] = [
  {
    id: 'group_abnormal_orders',
    header: '商家原因异常单',
    columns: [
      {
        accessorKey: 'abnormal_order_total',
        header: ({ column }) => <DataTableColumnHeader column={column} title='商家原因异常单合计' />,
        cell: ({ getValue }) => formatNumber(getValue<number | null>()),
        minSize: 150,
      },
      {
        accessorKey: 'abnormal_no_accept',
        header: ({ column }) => <DataTableColumnHeader column={column} title='商家不接单订单量' />,
        cell: ({ getValue }) => formatNumber(getValue<number | null>()),
        minSize: 140,
      },
      {
        accessorKey: 'abnormal_reject',
        header: ({ column }) => <DataTableColumnHeader column={column} title='商家拒单订单量' />,
        cell: ({ getValue }) => formatNumber(getValue<number | null>()),
        minSize: 130,
      },
      {
        accessorKey: 'abnormal_cancel_no_notify',
        header: ({ column }) => <DataTableColumnHeader column={column} title='商家取消不告知订单量' />,
        cell: ({ getValue }) => formatNumber(getValue<number | null>()),
        minSize: 160,
      },
      {
        accessorKey: 'abnormal_status',
        header: ({ column }) => <DataTableColumnHeader column={column} title='商家异常经营状态订单量' />,
        cell: ({ getValue }) => formatNumber(getValue<number | null>()),
        minSize: 170,
      },
      {
        accessorKey: 'abnormal_delay',
        header: ({ column }) => <DataTableColumnHeader column={column} title='商家配送延迟订单量' />,
        cell: ({ getValue }) => formatNumber(getValue<number | null>()),
        minSize: 150,
      },
      {
        accessorKey: 'abnormal_wrong_meal',
        header: ({ column }) => <DataTableColumnHeader column={column} title='商家少餐错餐订单量' />,
        cell: ({ getValue }) => formatNumber(getValue<number | null>()),
        minSize: 150,
      },
      {
        accessorKey: 'abnormal_complaint',
        header: ({ column }) => <DataTableColumnHeader column={column} title='商家违规投诉订单量' />,
        cell: ({ getValue }) => formatNumber(getValue<number | null>()),
        minSize: 150,
      },
      {
        accessorKey: 'abnormal_bad_review',
        header: ({ column }) => <DataTableColumnHeader column={column} title='差评商家订单量' />,
        cell: ({ getValue }) => formatNumber(getValue<number | null>()),
        minSize: 130,
      },
    ],
  },
]

export const tab5Columns: ColumnDef<CityOverviewRow>[] = [...basicColumns, ...abnormalColumns]
export const tab5DefaultVisibility: VisibilityState = {}

// ── Tab 6：全部字段 ───────────────────────────────────────────────────────────
// 包含所有列，默认隐藏所有分段明细列

export const allColumns: ColumnDef<CityOverviewRow>[] = [
  ...basicColumns,
  ...pnlColumns,
  ...merchantHealthColumns,
  ...feeRateColumns,
  ...subsidyColumns,
  ...abnormalColumns,
]

export const tab6DefaultVisibility: VisibilityState = {
  // 服务费率差额分段明细
  fee_rate_diff_neg_inf_to_neg10: false,
  fee_rate_diff_neg10_to_neg5: false,
  fee_rate_diff_neg5_to_neg1: false,
  fee_rate_diff_neg1_to_0: false,
  fee_rate_diff_0_to_5: false,
  fee_rate_diff_5_to_10: false,
  fee_rate_diff_10_to_inf: false,
  // PHF 保底收入分段明细
  phf_income_0_to_3p5: false,
  phf_income_3p5_to_4p0: false,
  phf_income_4p0_to_4p5: false,
  phf_income_4p5_to_5p0: false,
  phf_income_5p0_to_6p0: false,
  phf_income_6p0_to_inf: false,
  // 合作商补贴率分段
  partner_subsidy_rate_0_to_5: false,
  partner_subsidy_rate_5_to_7: false,
  partner_subsidy_rate_7_to_10: false,
  partner_subsidy_rate_10_to_inf: false,
  // 商代比分段
  merchant_partner_ratio_0_to_1: false,
  merchant_partner_ratio_1_to_2: false,
  merchant_partner_ratio_2_to_3: false,
  merchant_partner_ratio_3_to_4: false,
  merchant_partner_ratio_4_to_5: false,
  merchant_partner_ratio_5_to_inf: false,
}

// ── Tab 配置表 ────────────────────────────────────────────────────────────────

export const TAB_CONFIG = [
  {
    value: 'pnl',
    label: '盈亏概览',
    columns: tab1Columns,
    defaultVisibility: tab1DefaultVisibility,
    showHiddenTip: false,
  },
  {
    value: 'merchant',
    label: '商家健康',
    columns: tab2Columns,
    defaultVisibility: tab2DefaultVisibility,
    showHiddenTip: false,
  },
  {
    value: 'fee',
    label: '费率分析',
    columns: tab3Columns,
    defaultVisibility: tab3DefaultVisibility,
    showHiddenTip: true,
  },
  {
    value: 'subsidy',
    label: '补贴分析',
    columns: tab4Columns,
    defaultVisibility: tab4DefaultVisibility,
    showHiddenTip: true,
  },
  {
    value: 'abnormal',
    label: '异常单',
    columns: tab5Columns,
    defaultVisibility: tab5DefaultVisibility,
    showHiddenTip: false,
  },
  {
    value: 'all',
    label: '全部字段',
    columns: allColumns,
    defaultVisibility: tab6DefaultVisibility,
    showHiddenTip: true,
  },
] as const

export type TabValue = (typeof TAB_CONFIG)[number]['value']
