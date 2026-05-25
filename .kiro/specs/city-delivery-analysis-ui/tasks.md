# Implementation Plan: 城市维度-外卖整体分析 UI

## Overview

按照「schema → 列定义 → 表格组件 → 页面入口 → 路由更新」的依赖顺序，逐步实现「城市维度-外卖整体分析」报表页面。开发阶段使用 Mock 数据，接口层留空。所有筛选、分页、日期范围状态通过 URL 查询字符串持久化。

---

## Tasks

- [x] 1. 定义数据类型与 Mock 数据

  - [x] 1.1 创建 `data/schema.ts`，定义 `CityOverviewRow` TypeScript 接口
    - 按设计文档定义全部 74 个字段（A-BV 列），字段类型严格区分 `string`、`number | null`
    - 导出 `CityOverviewRow` 接口供后续文件引用
    - _需求：5.2_

  - [x] 1.2 创建 `data/mock-data.ts`，生成开发阶段 Mock 数据
    - 导入 `CityOverviewRow` 类型
    - 生成至少 50 条覆盖多城市、多区域、多商家类型的 Mock 行，包含 `null` 值场景
    - 导出 `mockCityOverviewData: CityOverviewRow[]` 常量
    - _需求：11.1（骨架屏行数与 pageSize 一致，需要足量数据触发分页）_

- [x] 2. 实现格式化函数与列定义

  - [x] 2.1 创建 `components/city-overview-columns.tsx`，实现格式化工具函数
    - 实现 `formatNumber(v)`：千分位整数格式化，`null/undefined` 返回 `—`
    - 实现 `formatPercent(v)`：末尾追加 `%`，不额外乘以 100，`null/undefined` 返回 `—`
    - 实现 `getProfitColorClass(v)`：正数返回绿色类名，负数返回红色类名，零或 null 返回空字符串
    - 实现 `HeaderWithTooltip` 组件：带 `HelpCircle` 图标和 Radix Tooltip，延迟 300ms 显示，宽度不超过 320px
    - _需求：7.1、7.3、7.5、8.1、8.2、8.3、9.1、9.2、9.4、9.5_

  - [ ]* 2.2 为 `formatNumber` 编写属性测试
    - **Property 1：千分位格式化不丢失数值**
    - 使用 fast-check，对任意整数 `n`，`formatNumber(n)` 去掉逗号后应等于 `n.toString()`
    - **验证需求：7.1**

  - [ ]* 2.3 为 `formatPercent` 编写属性测试
    - **Property 2：百分比格式化保留原始数值**
    - 使用 fast-check，对任意浮点数 `v`，输出以 `%` 结尾且去掉 `%` 后等于 `v.toString()`
    - **验证需求：7.3**

  - [ ]* 2.4 为 `getProfitColorClass` 编写属性测试
    - **Property 3：条件格式化颜色与数值正负一致**
    - 使用 fast-check，`v > 0` 时包含 `green`，`v < 0` 时包含 `red`，`v === 0` 或 `null` 时返回空字符串
    - **验证需求：8.1、8.2、8.3**

  - [x] 2.5 在 `city-overview-columns.tsx` 中定义全部 74 列的 `ColumnDef<CityOverviewRow>[]`
    - 行号列 `#`：不可排序、不可隐藏、不可过滤，`bg-muted/50`，文字居中，`size: 50`
    - 按分组嵌套定义多级表头（基础维度、线上盈亏、订单量与跨期分析、交易商家健康度、亏损毛利明细、服务费率差额分段、拼好饭保底收入分段、配送费差额、合作商补贴分析、合作商补贴率分段、商代比分段、商家原因异常单）
    - 数值列使用 `DataTableColumnHeader` 支持排序
    - 占比列、毛利率列、分段计数列、合作商补贴率列使用 `HeaderWithTooltip`，填写 `COLUMN_TOOLTIPS` 常量
    - 毛利列及亏损毛利明细列应用 `getProfitColorClass` + `formatNumber` 双重格式化
    - 导出 `cityOverviewColumns`
    - _需求：5.1、5.2、5.3、5.4、5.5、7.2、7.4、8.4、8.5、9.1、9.3_

- [x] 3. 实现日期范围选择组件

  - [x] 3.1 创建 `components/date-range-picker.tsx`，实现 `DateRangePicker` 组件
    - 使用两个 `<input type="date">` 实现，不引入额外日历库
    - 接收 `value: { startDate: string; endDate: string }`、`onChange`、`onSearch` props
    - 当 `startDate > endDate` 时，自动将 `endDate` 重置为 `startDate`
    - 导出 `applyDateRangeConstraint` 纯函数（供属性测试使用）
    - _需求：2.1、2.2、2.3_

  - [ ]* 3.2 为日期范围自动修正逻辑编写属性测试
    - **Property 5：日期范围自动修正**
    - 使用 fast-check，对任意 `startDate > endDate` 的输入，调用 `applyDateRangeConstraint` 后 `endDate === startDate`
    - **验证需求：2.3**

- [x] 4. 实现表格主组件

  - [x] 4.1 创建 `components/city-overview-table.tsx`，实现 `CityOverviewTable` 组件
    - 接收 `data`、`isLoading`、`isError`、`onRetry`、`columnFilters`、`onColumnFiltersChange`、`pagination`、`onPaginationChange`、`ensurePageInRange` props
    - 调用 `useReactTable`，配置 `columnPinning: { left: ['#', 'report_date', 'city_short_name', 'merchant_type_group'] }`
    - 实现 `getPinnedStyle` / `getPinnedClass` 工具函数，最后一个冻结列右侧渲染阴影分隔线
    - 实现多级表头渲染（遍历 `table.getHeaderGroups()`）
    - 实现四种渲染状态：加载中（骨架屏，行数 = `pageSize`）、错误（错误提示 + 重试按钮）、空数据（「暂无数据」提示）、正常数据行
    - 使用 `useEffect` 监听 `table.getPageCount()` 变化，调用 `ensurePageInRange`
    - 底部渲染 `DataTablePagination`
    - _需求：1.4、1.5、6.1、6.2、6.3、10.1、10.2、10.3、10.5、11.1、11.2、11.3_

  - [ ]* 4.2 为多选筛选器 AND/OR 语义编写属性测试
    - **Property 4：多选筛选器 AND/OR 语义**
    - 使用 fast-check，对任意数据集和筛选条件组合，筛选结果中每行均满足所有非空筛选集合的 AND 条件
    - **验证需求：3.2**

  - [ ]* 4.3 为列可见性切换幂等性编写属性测试
    - **Property 6：列可见性切换幂等性**
    - 使用 fast-check，连续两次 `toggleVisibility(false)` 后 `getIsVisible()` 返回 `false`；连续两次 `toggleVisibility(true)` 后返回 `true`
    - **验证需求：4.3、4.4**

- [x] 5. 检查点 — 确保所有测试通过
  - 运行 `pnpm vitest run`，确保所有属性测试和单元测试通过，如有问题请向用户反馈。

- [x] 6. 实现页面入口组件

  - [x] 6.1 替换 `src/features/reports/waimai/city-overview/index.tsx` 页面入口
    - 从 `Route.useSearch()` 读取 URL 参数，调用 `useTableUrlState` 初始化表格状态
    - 配置三个 `columnFilters`：`city_short_name → cities`、`region → regions`、`merchant_type_group → merchantTypes`
    - 管理日期范围状态（从 URL 读取，默认最近 7 天），实现 `parseDateRangeFromSearch` 工具函数
    - 渲染 `<Header />`、`<Main fixed fluid>`、页面标题、`<DataTableToolbar>`（含 `DateRangePicker`、三个 `DataTableFacetedFilter`、查询按钮、条件渲染的重置按钮、`DataTableViewOptions`）、`<CityOverviewTable>`
    - 使用 `mockCityOverviewData` 作为数据源，`isLoading: false`，`isError: false`
    - _需求：1.1、1.2、1.3、2.4、2.5、3.1、3.3、3.4、3.5、3.6、4.1、4.5、4.6、10.4、13.1、13.2、13.3、13.4、13.5_

- [x] 7. 更新路由文件

  - [x] 7.1 更新 `src/routes/_authenticated/reports/waimai/city-overview/index.tsx`，添加 `validateSearch`
    - 添加 `isValidDate` 工具函数，验证 `YYYY-MM-DD` 格式
    - 在 `validateSearch` 中对 `startDate`、`endDate`、`page`、`pageSize`、`cities`、`regions`、`merchantTypes` 进行类型检查，非法值返回 `undefined`
    - 将 `component` 指向 `CityOverview`（从 `features/` 导入）
    - _需求：13.4、13.5_

- [x] 8. 最终检查点 — 确保所有测试通过
  - 运行 `pnpm vitest run`，确保全部测试通过；在浏览器中验证页面渲染、列冻结、筛选、分页、URL 同步功能正常，如有问题请向用户反馈。

---

## Notes

- 标有 `*` 的子任务为可选任务，可跳过以加快 MVP 交付
- 每个任务均引用了具体需求条款，便于追溯
- 属性测试使用 fast-check（`pnpm add -D fast-check`），每个属性运行至少 100 次迭代
- 单元测试使用 Vitest + React Testing Library（项目已有配置）
- 开发阶段接口层留空，数据来源为 `mock-data.ts`；接口接入时只需替换 `index.tsx` 中的数据源

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2", "2.1"] },
    { "id": 2, "tasks": ["2.2", "2.3", "2.4", "3.1"] },
    { "id": 3, "tasks": ["2.5", "3.2"] },
    { "id": 4, "tasks": ["4.1"] },
    { "id": 5, "tasks": ["4.2", "4.3"] },
    { "id": 6, "tasks": ["6.1"] },
    { "id": 7, "tasks": ["7.1"] }
  ]
}
```
