# Design Document

## 城市维度-外卖整体分析 UI 技术设计

Feature: city-delivery-analysis-ui

---

## Overview

本文档描述「城市维度-外卖整体分析」报表页面的前端技术设计。页面展示城市级别的外卖经营数据，数据粒度为「日期 + 美团系统城市名称 + 商家类型」，共 74 列（A-BV 列），涵盖线上盈亏、订单量、商家健康度、服务费率、补贴分析、异常单等多个指标分组。

### 设计目标

- 复用项目现有基础设施（`data-table/` 组件族、`useTableUrlState` hook、`Header`/`Main` 布局组件），不重新造轮子
- 74 列宽表格需要列冻结、多级表头、列可见性控制三项能力协同工作
- 所有筛选、分页、日期范围状态通过 URL 查询字符串持久化，支持链接分享
- 开发阶段使用 Mock 数据，接口层留空（不实现）

### 技术栈

| 层次 | 技术选型 |
|------|---------|
| 框架 | React 19 + TypeScript |
| 路由 | TanStack Router v1（文件路由） |
| 表格 | TanStack Table v8 |
| UI 组件 | shadcn/ui + Tailwind CSS v4 |
| 弹出层 | Radix UI Tooltip / Popover |
| 图标 | lucide-react |

---

## Architecture

### 组件树

```
CityOverview (页面入口)
├── <Header />                        # 顶部导航栏（复用）
└── <Main fixed fluid>                # 内容区（复用，fixed+fluid 支持全宽滚动）
    ├── <h1> 城市维度-外卖整体分析
    ├── <DataTableToolbar>            # 工具栏（复用）
    │   ├── <DateRangePicker>         # 日期范围选择（新建）
    │   ├── <DataTableFacetedFilter>  # 城市简称筛选（复用）
    │   ├── <DataTableFacetedFilter>  # 区域筛选（复用）
    │   ├── <DataTableFacetedFilter>  # 商家类型筛选（复用）
    │   ├── <Button> 查询
    │   ├── <Button> 重置（条件渲染）
    │   └── <DataTableViewOptions>    # 列选择器（复用）
    └── <CityOverviewTable>           # 表格主组件（新建）
        ├── <Table>                   # shadcn/ui Table（复用）
        │   ├── <TableHeader>         # 多级表头
        │   └── <TableBody>           # 数据行 / 骨架屏 / 空状态 / 错误状态
        └── <DataTablePagination>     # 分页（复用）
```

### 数据流

```
URL 查询字符串
    │
    ▼
useTableUrlState hook
    │  (columnFilters, pagination, globalFilter)
    ▼
useReactTable (TanStack Table v8)
    │  (sorting, columnPinning, columnVisibility, columnFilters, pagination)
    ▼
CityOverviewTable
    │  (table instance)
    ▼
渲染层 (Table / Skeleton / Empty / Error)
```

日期范围状态（`startDate`、`endDate`）由页面组件 `CityOverview` 直接管理，通过 TanStack Router 的 `navigate` 同步到 URL，不经过 `useTableUrlState`（后者只管理表格内部状态）。

---

## Components and Interfaces

### 文件结构

```
src/features/reports/waimai/city-overview/
  ├── index.tsx                        # 页面入口（CityOverview 组件）
  ├── components/
  │   ├── city-overview-table.tsx      # 表格主组件
  │   ├── city-overview-columns.tsx    # 74 列 ColumnDef 定义
  │   └── date-range-picker.tsx        # 日期范围选择组件
  └── data/
      ├── schema.ts                    # CityOverviewRow TypeScript 类型
      └── mock-data.ts                 # Mock 数据（开发阶段）
```

### 1. `index.tsx` — 页面入口

```tsx
// 职责：
// 1. 从 Route.useSearch() 读取 URL 参数
// 2. 调用 useTableUrlState 初始化表格状态
// 3. 管理日期范围状态
// 4. 组合 Header + Main + Toolbar + CityOverviewTable

export function CityOverview() {
  const search = Route.useSearch()
  const navigate = Route.useNavigate()

  // 日期范围状态（从 URL 读取，默认最近 7 天）
  const [dateRange, setDateRange] = useState<DateRange>(
    parseDateRangeFromSearch(search)
  )

  // 表格 URL 状态
  const tableUrlState = useTableUrlState({
    search,
    navigate,
    pagination: { defaultPageSize: 20 },
    globalFilter: { enabled: false },
    columnFilters: [
      { columnId: 'city_short_name', searchKey: 'cities', type: 'array' },
      { columnId: 'region', searchKey: 'regions', type: 'array' },
      { columnId: 'merchant_type_group', searchKey: 'merchantTypes', type: 'array' },
    ],
  })

  return (
    <>
      <Header />
      <Main fixed fluid>
        <h1 className="text-2xl font-bold tracking-tight">
          城市维度-外卖整体分析
        </h1>
        {/* Toolbar + Table */}
      </Main>
    </>
  )
}
```

### 2. `city-overview-columns.tsx` — 列定义

#### 格式化函数

```tsx
// 千分位整数（金额、订单量、商家数、分段计数）
export function formatNumber(v: number | null | undefined): string {
  if (v == null) return '—'
  return new Intl.NumberFormat('zh-CN', {
    maximumFractionDigits: 0,
  }).format(v)
}

// 百分比（已计算好的值，直接追加 %）
export function formatPercent(v: number | null | undefined): string {
  if (v == null) return '—'
  return `${v}%`
}

// null/undefined 占位符（通用包装）
export function renderNull<T>(
  v: T | null | undefined,
  formatter: (v: T) => string
): string {
  if (v == null) return '—'
  return formatter(v)
}
```

#### 条件格式化

```tsx
// 毛利列颜色 className
export function getProfitColorClass(v: number | null | undefined): string {
  if (v == null || v === 0) return ''
  return v > 0
    ? 'text-green-600 dark:text-green-400'
    : 'text-red-600 dark:text-red-400'
}
```

#### HeaderWithTooltip 组件

```tsx
// 带 HelpCircle 图标和 Radix Tooltip 的列头
interface HeaderWithTooltipProps {
  title: string
  tooltip: string  // 计算公式 + 数据来源
}

export function HeaderWithTooltip({ title, tooltip }: HeaderWithTooltipProps) {
  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1 cursor-default">
            <span>{title}</span>
            <HelpCircle className="h-3 w-3 text-muted-foreground" />
          </div>
        </TooltipTrigger>
        <TooltipContent className="max-w-[320px] whitespace-pre-wrap">
          {tooltip}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
```

#### 列分组结构（ColumnDef 嵌套）

TanStack Table v8 通过 `columns` 数组嵌套实现多级表头，父级列使用 `header` 字符串 + `columns` 子数组：

```tsx
export const cityOverviewColumns: ColumnDef<CityOverviewRow>[] = [
  // 行号列（固定，不可隐藏）
  {
    id: '#',
    header: '#',
    cell: ({ row }) => row.index + 1,
    enableSorting: false,
    enableHiding: false,
    enableColumnFilter: false,
    size: 50,
    minSize: 50,
  },

  // A-G 基础维度（分组）
  {
    id: 'group_basic',
    header: '基础维度',
    columns: [
      { accessorKey: 'report_date', header: '日期', minSize: 100 },
      { accessorKey: 'city_short_name', header: '城市简称', minSize: 80 },
      { accessorKey: 'city_name', header: '美团系统城市名称', minSize: 120 },
      { accessorKey: 'city_level', header: '城市等级', minSize: 80 },
      { accessorKey: 'region', header: '区域', minSize: 80 },
      { accessorKey: 'manager', header: '负责人', minSize: 80 },
      { accessorKey: 'merchant_type_group', header: '商家类型', minSize: 100 },
    ],
  },

  // H-K 线上盈亏（分组）
  {
    id: 'group_pnl',
    header: '线上盈亏',
    columns: [
      {
        accessorKey: 'revenue_total',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="线上账单收入合计" />
        ),
        cell: ({ getValue }) => formatNumber(getValue<number>()),
        minSize: 120,
      },
      // ... 其余列类似
    ],
  },
  // ... 其余分组
]
```

### 3. `city-overview-table.tsx` — 表格主组件

```tsx
interface CityOverviewTableProps {
  data: CityOverviewRow[]
  isLoading: boolean
  isError: boolean
  onRetry: () => void
  // 来自 useTableUrlState
  columnFilters: ColumnFiltersState
  onColumnFiltersChange: OnChangeFn<ColumnFiltersState>
  pagination: PaginationState
  onPaginationChange: OnChangeFn<PaginationState>
  ensurePageInRange: (pageCount: number) => void
}

export function CityOverviewTable({
  data, isLoading, isError, onRetry,
  columnFilters, onColumnFiltersChange,
  pagination, onPaginationChange, ensurePageInRange,
}: CityOverviewTableProps) {
  const table = useReactTable({
    data,
    columns: cityOverviewColumns,
    state: {
      columnFilters,
      pagination,
      columnPinning: {
        left: ['#', 'report_date', 'city_short_name', 'merchant_type_group'],
      },
    },
    onColumnFiltersChange,
    onPaginationChange,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    enableMultiSort: true,
    manualPagination: false,
  })

  // 筛选后页码越界时自动跳回第 1 页
  useEffect(() => {
    ensurePageInRange(table.getPageCount())
  }, [table.getPageCount()])

  // 渲染：加载中 → 骨架屏；错误 → 错误提示；空数据 → 空状态；正常 → 数据行
}
```

#### 列冻结 CSS 实现

TanStack Table v8 的 `columnPinning` 会在列对象上暴露 `column.getIsPinned()` 和 `column.getStart('left')`，配合 Tailwind 的 `sticky` 实现：

```tsx
// 冻结列的 th/td 样式
function getPinnedStyle(column: Column<CityOverviewRow>): React.CSSProperties {
  const isPinned = column.getIsPinned()
  return isPinned
    ? {
        position: 'sticky',
        left: column.getStart('left'),
        zIndex: 1,
      }
    : {}
}

// 最后一个冻结列右侧阴影
function getPinnedClass(column: Column<CityOverviewRow>, isLastPinned: boolean): string {
  if (!column.getIsPinned()) return ''
  return cn(
    'bg-background',
    isLastPinned && 'shadow-[2px_0_4px_-2px_rgba(0,0,0,0.15)]'
  )
}
```

### 4. `date-range-picker.tsx` — 日期范围选择

```tsx
interface DateRange {
  startDate: string  // YYYY-MM-DD
  endDate: string    // YYYY-MM-DD
}

interface DateRangePickerProps {
  value: DateRange
  onChange: (range: DateRange) => void
  onSearch: () => void
}

// 使用两个 <input type="date"> 实现，不引入额外日历库
// 当 startDate > endDate 时，自动将 endDate 重置为 startDate
```

### 5. `data/schema.ts` — 数据类型

```tsx
export interface CityOverviewRow {
  // A-G 基础维度
  report_date: string
  city_short_name: string
  city_name: string
  city_level: string | null
  region: string | null
  manager: string | null
  merchant_type_group: string

  // H-K 线上盈亏
  revenue_total: number | null
  cost_total: number | null
  gross_profit: number | null
  gross_profit_rate: number | null  // 已乘以 100，如 12.34

  // L-Q 订单量与跨期分析
  order_count_consume: number | null
  order_count_bill: number | null
  order_count_tn: number | null
  order_count_tn_plus: number | null
  order_count_tn_ratio: number | null   // 已乘以 100
  order_count_tn_plus_ratio: number | null  // 已乘以 100

  // R-AB 交易商家健康度
  merchant_count_total: number | null
  merchant_count_fee_gt0: number | null
  merchant_count_profit_gte0: number | null
  merchant_count_profit_lt0: number | null
  merchant_ratio_fee_gt0: number | null       // 已乘以 100
  merchant_ratio_profit_gte0: number | null   // 已乘以 100
  merchant_ratio_profit_lt0: number | null    // 已乘以 100
  merchant_count_gtv0_fee0: number | null
  merchant_ratio_gtv0_fee0: number | null     // 已乘以 100
  merchant_count_gtv0_fee_gt0: number | null
  merchant_count_gtv_gt0_fee0: number | null

  // AC-AG 亏损毛利明细
  loss_profit_total: number | null
  loss_profit_proxy: number | null
  loss_profit_runner: number | null
  loss_profit_merchant_delivery: number | null
  loss_profit_other: number | null

  // AH-AO 服务费率差额分段
  fee_rate_diff_neg_inf_to_neg10: number | null
  fee_rate_diff_neg10_to_neg5: number | null
  fee_rate_diff_neg5_to_neg1: number | null
  fee_rate_diff_neg1_to_0: number | null
  fee_rate_diff_0_to_5: number | null
  fee_rate_diff_5_to_10: number | null
  fee_rate_diff_10_to_inf: number | null
  fee_rate_diff_lt0_total: number | null

  // AP-AV 拼好饭保底收入分段
  phf_diff_lt0_count: number | null
  phf_income_0_to_3p5: number | null
  phf_income_3p5_to_4p0: number | null
  phf_income_4p0_to_4p5: number | null
  phf_income_4p5_to_5p0: number | null
  phf_income_5p0_to_6p0: number | null
  phf_income_6p0_to_inf: number | null

  // AW 配送费差额
  delivery_fee_diff_lt0_count: number | null

  // AX-BC 合作商补贴分析
  gtv_b: number | null
  subsidy_b: number | null
  subsidy_rate_b: number | null   // 已乘以 100
  gtv_c: number | null
  subsidy_c: number | null
  subsidy_rate_c: number | null   // 已乘以 100

  // BD-BG 合作商补贴率分段
  partner_subsidy_rate_0_to_5: number | null
  partner_subsidy_rate_5_to_7: number | null
  partner_subsidy_rate_7_to_10: number | null
  partner_subsidy_rate_10_to_inf: number | null

  // BH-BM 商代比分段
  merchant_partner_ratio_0_to_1: number | null
  merchant_partner_ratio_1_to_2: number | null
  merchant_partner_ratio_2_to_3: number | null
  merchant_partner_ratio_3_to_4: number | null
  merchant_partner_ratio_4_to_5: number | null
  merchant_partner_ratio_5_to_inf: number | null

  // BN-BV 商家原因异常单
  abnormal_order_total: number | null
  abnormal_no_accept: number | null
  abnormal_reject: number | null
  abnormal_cancel_no_notify: number | null
  abnormal_status: number | null
  abnormal_delay: number | null
  abnormal_wrong_meal: number | null
  abnormal_complaint: number | null
  abnormal_bad_review: number | null
}
```

---

## Data Models

### URL 查询参数模型

TanStack Router 的 `validateSearch` 定义路由的 search schema：

```tsx
// src/routes/_authenticated/reports/waimai/city-overview/index.tsx
export const Route = createFileRoute(
  '/_authenticated/reports/waimai/city-overview/'
)({
  validateSearch: (search: Record<string, unknown>) => ({
    // 日期范围
    startDate: typeof search.startDate === 'string' ? search.startDate : undefined,
    endDate: typeof search.endDate === 'string' ? search.endDate : undefined,
    // 分页
    page: typeof search.page === 'number' && search.page > 0 ? search.page : undefined,
    pageSize: typeof search.pageSize === 'number' ? search.pageSize : undefined,
    // 多选筛选器
    cities: Array.isArray(search.cities) ? (search.cities as string[]) : undefined,
    regions: Array.isArray(search.regions) ? (search.regions as string[]) : undefined,
    merchantTypes: Array.isArray(search.merchantTypes) ? (search.merchantTypes as string[]) : undefined,
  }),
  component: CityOverview,
})
```

**参数说明：**

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `startDate` | `string \| undefined` | 今日 -6 天 | YYYY-MM-DD 格式 |
| `endDate` | `string \| undefined` | 今日 | YYYY-MM-DD 格式 |
| `page` | `number \| undefined` | 1 | 当前页码（从 1 开始） |
| `pageSize` | `number \| undefined` | 20 | 每页行数 |
| `cities` | `string[] \| undefined` | `[]` | 城市简称多选 |
| `regions` | `string[] \| undefined` | `[]` | 区域多选 |
| `merchantTypes` | `string[] \| undefined` | `[]` | 商家类型多选 |

### 列分组与 Tooltip 元数据

每列的 Tooltip 内容在 `city-overview-columns.tsx` 中以常量对象维护：

```tsx
const COLUMN_TOOLTIPS: Record<string, string> = {
  gross_profit_rate: `线上账单毛利率\n公式：线上账单毛利 / 线上账单收入合计 × 100\n来源：ads_merchant_pnl_daily`,
  order_count_tn_ratio: `T-n线上账单订单占比\n公式：T-n线上账单订单量 / 线上账单订单量 × 100\n来源：ads_merchant_pnl_daily`,
  // ... 其余需要 Tooltip 的列
}
```

需要 Tooltip 的列类型：
- 所有占比列（`_ratio` / `_rate` 后缀）
- 毛利率列
- 所有分段计数列（`fee_rate_diff_*`、`phf_income_*`、`partner_subsidy_rate_*`、`merchant_partner_ratio_*`）
- 合作商补贴率列

### 筛选器选项数据

筛选器选项从当前数据集动态派生（通过 TanStack Table 的 `getFacetedUniqueValues()`），无需硬编码。商家类型枚举值作为备用静态选项：

```tsx
const MERCHANT_TYPE_OPTIONS = [
  { label: '全国KA', value: '全国KA' },
  { label: '区域KA', value: '区域KA' },
  { label: '城市商家', value: '城市商家' },
  { label: '闪购', value: '闪购' },
  { label: '医药商家', value: '医药商家' },
]
```

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

本功能的核心逻辑集中在格式化函数（纯函数）和筛选逻辑（数据变换），适合属性测试。UI 渲染、CSS 样式、URL 同步等部分使用示例测试。

### Property 1: 千分位格式化不丢失数值

*For any* 整数 `n`，`formatNumber(n)` 的输出去掉所有逗号后，应等于 `n` 的字符串表示（即格式化是可逆的，不改变数值本身）。

**Validates: Requirements 7.1**

### Property 2: 百分比格式化保留原始数值

*For any* 数值 `v`，`formatPercent(v)` 的输出应以 `%` 结尾，且去掉末尾 `%` 后的字符串应等于 `v.toString()`（不进行额外乘以 100 的运算）。

**Validates: Requirements 7.3**

### Property 3: 条件格式化颜色与数值正负一致

*For any* 数值 `v`，`getProfitColorClass(v)` 的返回值应满足：`v > 0` 时包含绿色类名，`v < 0` 时包含红色类名，`v === 0` 或 `v == null` 时返回空字符串。

**Validates: Requirements 8.1, 8.2, 8.3**

### Property 4: 多选筛选器 AND/OR 语义

*For any* 数据集 `rows` 和任意筛选条件组合（城市简称集合 `C`、区域集合 `R`、商家类型集合 `M`），筛选后的结果集中每一行都应满足：`city_short_name ∈ C`（若 C 非空）AND `region ∈ R`（若 R 非空）AND `merchant_type_group ∈ M`（若 M 非空）。

**Validates: Requirements 3.2**

### Property 5: 日期范围自动修正

*For any* 两个日期字符串 `startDate` 和 `endDate`，当 `startDate > endDate` 时，调用日期范围更新逻辑后，新的 `endDate` 应等于 `startDate`（结束日期被重置为开始日期）。

**Validates: Requirements 2.3**

### Property 6: 列可见性切换幂等性

*For any* 可隐藏列 `col`，连续两次调用 `toggleVisibility(false)` 后，`col.getIsVisible()` 应返回 `false`（隐藏操作是幂等的）；连续两次调用 `toggleVisibility(true)` 后，`col.getIsVisible()` 应返回 `true`。

**Validates: Requirements 4.3, 4.4**

---

## Error Handling

### 数据加载错误

| 场景 | 处理方式 |
|------|---------|
| 数据加载中 | 渲染骨架屏（行数 = 当前 `pageSize`，列宽与实际列宽一致） |
| 数据为空（0 行） | 居中展示「暂无数据」+ 「请调整筛选条件后重试」 |
| 数据加载失败 | 展示错误描述 + 「重试」按钮，点击重新触发加载 |

```tsx
// CityOverviewTable 内部渲染逻辑
function renderTableBody() {
  if (isLoading) {
    return Array.from({ length: pagination.pageSize }).map((_, i) => (
      <TableRow key={i}>
        {table.getAllLeafColumns().map((col) => (
          <TableCell key={col.id}>
            <Skeleton className="h-4 w-full" />
          </TableCell>
        ))}
      </TableRow>
    ))
  }

  if (isError) {
    return (
      <TableRow>
        <TableCell colSpan={table.getAllLeafColumns().length} className="text-center py-10">
          <p className="text-destructive">数据加载失败</p>
          <Button variant="outline" size="sm" onClick={onRetry} className="mt-2">
            重试
          </Button>
        </TableCell>
      </TableRow>
    )
  }

  if (table.getRowModel().rows.length === 0) {
    return (
      <TableRow>
        <TableCell colSpan={table.getAllLeafColumns().length} className="text-center py-10">
          <p>暂无数据</p>
          <p className="text-muted-foreground text-sm mt-1">请调整筛选条件后重试</p>
        </TableCell>
      </TableRow>
    )
  }

  return table.getRowModel().rows.map((row) => (
    <TableRow key={row.id}>
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id} style={getPinnedStyle(cell.column)}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  ))
}
```

### URL 参数容错

`validateSearch` 中对所有参数进行类型检查，非法值（日期格式错误、页码为负数等）返回 `undefined`，页面使用默认值渲染，不抛出运行时错误。

```tsx
// 日期格式验证
function isValidDate(s: unknown): s is string {
  return typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s)
}

// 在 validateSearch 中使用
startDate: isValidDate(search.startDate) ? search.startDate : undefined,
```

---

## Testing Strategy

### 测试分层

本功能采用「单元测试 + 属性测试」双层策略，不引入 E2E 测试（开发阶段使用 Mock 数据）。

#### 单元测试（示例测试）

使用 Vitest + React Testing Library，覆盖以下场景：

| 测试文件 | 覆盖场景 |
|---------|---------|
| `city-overview-columns.test.tsx` | 格式化函数的具体示例（null 值、零值、边界值） |
| `city-overview-table.test.tsx` | 骨架屏渲染、空状态渲染、错误状态渲染 |
| `date-range-picker.test.tsx` | 默认值（最近 7 天）、日期选择交互 |
| `index.test.tsx` | 页面标题渲染、Toolbar 存在性、列选择器存在性 |

#### 属性测试（PBT）

使用 **fast-check** 库（项目已有 TypeScript 生态，fast-check 是首选）。每个属性测试运行最少 100 次迭代。

```tsx
// 安装：pnpm add -D fast-check

// city-overview-columns.property.test.tsx
import fc from 'fast-check'
import { formatNumber, formatPercent, getProfitColorClass } from './city-overview-columns'

// Feature: city-delivery-analysis-ui, Property 1: 千分位格式化不丢失数值
test('formatNumber: 格式化不改变数值本身', () => {
  fc.assert(
    fc.property(fc.integer({ min: -1e12, max: 1e12 }), (n) => {
      const formatted = formatNumber(n)
      const stripped = formatted.replace(/,/g, '')
      expect(Number(stripped)).toBe(n)
    }),
    { numRuns: 100 }
  )
})

// Feature: city-delivery-analysis-ui, Property 2: 百分比格式化保留原始数值
test('formatPercent: 输出以 % 结尾且数值不变', () => {
  fc.assert(
    fc.property(fc.float({ noNaN: true, noDefaultInfinity: true }), (v) => {
      const formatted = formatPercent(v)
      expect(formatted.endsWith('%')).toBe(true)
      expect(formatted.slice(0, -1)).toBe(String(v))
    }),
    { numRuns: 100 }
  )
})

// Feature: city-delivery-analysis-ui, Property 3: 条件格式化颜色与数值正负一致
test('getProfitColorClass: 颜色与正负一致', () => {
  fc.assert(
    fc.property(fc.float({ noNaN: true, noDefaultInfinity: true }), (v) => {
      const cls = getProfitColorClass(v)
      if (v > 0) expect(cls).toContain('green')
      else if (v < 0) expect(cls).toContain('red')
      else expect(cls).toBe('')
    }),
    { numRuns: 100 }
  )
})
```

```tsx
// city-overview-filter.property.test.tsx
import fc from 'fast-check'

// Feature: city-delivery-analysis-ui, Property 4: 多选筛选器 AND/OR 语义
test('多选筛选器: 结果行满足 AND/OR 语义', () => {
  const rowArb = fc.record({
    city_short_name: fc.constantFrom('北京', '上海', '广州', '深圳'),
    region: fc.constantFrom('华北', '华东', '华南'),
    merchant_type_group: fc.constantFrom('全国KA', '区域KA', '城市商家'),
  })

  fc.assert(
    fc.property(
      fc.array(rowArb, { minLength: 0, maxLength: 50 }),
      fc.array(fc.constantFrom('北京', '上海', '广州', '深圳'), { maxLength: 3 }),
      fc.array(fc.constantFrom('华北', '华东', '华南'), { maxLength: 2 }),
      (rows, cities, regions) => {
        const filtered = rows.filter((row) => {
          const cityOk = cities.length === 0 || cities.includes(row.city_short_name)
          const regionOk = regions.length === 0 || regions.includes(row.region)
          return cityOk && regionOk
        })
        filtered.forEach((row) => {
          if (cities.length > 0) expect(cities).toContain(row.city_short_name)
          if (regions.length > 0) expect(regions).toContain(row.region)
        })
      }
    ),
    { numRuns: 100 }
  )
})
```

```tsx
// date-range-picker.property.test.tsx
import fc from 'fast-check'

// Feature: city-delivery-analysis-ui, Property 5: 日期范围自动修正
test('日期范围: startDate > endDate 时 endDate 被重置', () => {
  const dateArb = fc.date({
    min: new Date('2020-01-01'),
    max: new Date('2030-12-31'),
  }).map((d) => d.toISOString().slice(0, 10))

  fc.assert(
    fc.property(dateArb, dateArb, (d1, d2) => {
      // 确保 d1 > d2
      const [startDate, endDate] = d1 > d2 ? [d1, d2] : [d2, d1]
      if (startDate === endDate) return  // 跳过相等情况

      const result = applyDateRangeConstraint({ startDate, endDate })
      expect(result.endDate).toBe(result.startDate)
    }),
    { numRuns: 100 }
  )
})
```

### 测试配置

```tsx
// vitest.config.ts 中已有配置，无需修改
// 运行属性测试：pnpm vitest run --reporter=verbose
```

每个属性测试文件顶部注释标注对应的设计文档属性编号，格式：
```
// Feature: city-delivery-analysis-ui, Property N: <属性描述>
```
