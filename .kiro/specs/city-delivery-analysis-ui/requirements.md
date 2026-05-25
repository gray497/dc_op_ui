# Requirements Document

## Introduction

本文档描述「城市维度-外卖整体分析」报表页面的前端 UI 需求。该页面展示城市级别的外卖经营数据，数据粒度为「日期 + 美团系统城市名称 + 商家类型」，共 74 列（A-BV 列），涵盖线上盈亏、订单量、商家健康度、服务费率、补贴分析、异常单等多个指标分组。

前端技术栈为 React + TanStack Table v8 + shadcn/ui + Tailwind CSS，与项目现有报表页面保持一致，不涉及接口数据层实现。

---

## Glossary

- **Report_Page**：「城市维度-外卖整体分析」报表页面整体
- **Data_Table**：页面核心数据表格组件，基于 TanStack Table v8 实现
- **Toolbar**：表格上方的工具栏区域，包含筛选器与列选择器
- **Filter_Bar**：工具栏中的多选筛选器组合（城市简称、区域、商家类型）
- **Column_Selector**：列可见性控制下拉组件（视图切换器）
- **Column_Group**：表头分组，将 74 列按业务含义归入若干父级表头
- **Row_Number_Column**：首列固定行号列（`#`）
- **Frozen_Column**：水平滚动时保持固定不动的列
- **Number_Formatter**：整数千分位格式化函数（如 `1,234,567`）
- **Percent_Formatter**：百分比格式化函数，在已计算好的小数值末尾追加 `%`（如 `12.34%`）
- **Conditional_Formatter**：条件格式化函数，根据数值正负渲染不同颜色
- **Header_Tooltip**：列头悬停提示，展示指标公式与数据血缘
- **Date_Range_Picker**：日期范围选择组件，用于选择报表查询的起止日期
- **Merchant_Type**：商家类型，枚举值包括「全国KA」「区域KA」「城市商家」「闪购」「医药商家」

---

## Requirements

### Requirement 1: 页面整体布局

**User Story:** 作为运营分析师，我希望进入报表页面后看到统一的页面结构，以便快速定位筛选区和数据表格。

#### Acceptance Criteria

1. THE Report_Page SHALL 渲染顶部 `<Header />` 导航栏与 `<Main />` 内容区，与项目其他报表页面布局保持一致。
2. THE Report_Page SHALL 在内容区顶部展示页面标题「城市维度-外卖整体分析」，字号为 `text-2xl font-bold tracking-tight`。
3. THE Report_Page SHALL 在页面标题下方渲染 Toolbar，Toolbar 下方渲染 Data_Table。
4. WHEN Data_Table 的数据行数超过可视区域高度，THE Data_Table SHALL 支持垂直滚动，表头行保持固定不动。
5. WHEN Data_Table 的列数超过可视区域宽度，THE Data_Table SHALL 支持水平滚动，Frozen_Column 保持固定不动。

---

### Requirement 2: 日期范围筛选

**User Story:** 作为运营分析师，我希望通过日期范围选择器指定查询的起止日期，以便查看特定时间段的数据。

#### Acceptance Criteria

1. THE Toolbar SHALL 渲染一个 Date_Range_Picker 组件，包含「开始日期」与「结束日期」两个日期输入控件。
2. WHEN 用户选择开始日期或结束日期，THE Date_Range_Picker SHALL 将所选日期以 `YYYY-MM-DD` 格式存储到组件状态中。
3. WHEN 用户选择开始日期后，IF 所选开始日期晚于当前已选结束日期，THEN THE Date_Range_Picker SHALL 立即将结束日期自动重置为与开始日期相同。
4. THE Date_Range_Picker SHALL 默认展示最近 7 天的日期范围（含今日）。
5. WHEN 用户点击「查询」按钮，THE Report_Page SHALL 使用当前日期范围触发数据加载，并将日期参数同步到 URL 查询字符串（`startDate`、`endDate`）。

---

### Requirement 3: 多维度多选筛选器

**User Story:** 作为运营分析师，我希望通过城市简称、区域、商家类型多选框在前端过滤表格数据，以便聚焦关注的城市或商家类型。

#### Acceptance Criteria

1. THE Filter_Bar SHALL 渲染三个独立的 `DataTableFacetedFilter` 多选筛选器，分别对应「城市简称」（`city_short_name`）、「区域」（`region`）、「商家类型」（`merchant_type_group`）列。
2. WHEN 用户在某个筛选器中选择一个或多个选项，THE Data_Table SHALL 仅展示满足所有已选条件的数据行（多筛选器之间为 AND 关系，同一筛选器内多选项之间为 OR 关系）。
3. THE Filter_Bar SHALL 在每个筛选器选项旁展示该选项在当前数据集中的行数（facet count）。
4. WHEN 用户点击「重置」按钮，THE Filter_Bar SHALL 清除所有筛选器的已选状态，Data_Table 恢复展示全量数据。
5. WHEN 任意筛选器存在已选项，THE Toolbar SHALL 展示「重置」按钮；WHEN 所有筛选器均无已选项，THE Toolbar SHALL 隐藏「重置」按钮。
6. THE Filter_Bar 的筛选状态 SHALL 通过 URL 查询字符串持久化（`cities`、`regions`、`merchantTypes` 参数），支持页面刷新后恢复筛选状态。

---

### Requirement 4: 列可见性控制

**User Story:** 作为运营分析师，我希望动态控制表格中可见的指标列，以便在 74 列中聚焦关注的指标分组。

#### Acceptance Criteria

1. THE Column_Selector SHALL 渲染为工具栏右侧的「视图」下拉按钮，使用 `DataTableViewOptions` 组件实现。
2. THE Column_Selector SHALL 按指标分组（线上盈亏、订单量与跨期分析、交易商家健康度、亏损毛利明细、服务费率差额、拼好饭保底收入、配送费差额、合作商补贴分析、合作商补贴率分段、商代比分段、商家原因异常单）对列进行分组展示。
3. WHEN 用户在 Column_Selector 中取消勾选某列，THE Data_Table SHALL 立即隐藏对应列，不触发数据重新加载。
4. WHEN 用户在 Column_Selector 中勾选某列，THE Data_Table SHALL 立即显示对应列。
5. THE Column_Selector SHALL 默认展示所有列（全部勾选状态）。
6. THE Column_Selector 中的列名 SHALL 使用中文业务名称，与表头显示名称保持一致。

---

### Requirement 5: 数据表格列配置

**User Story:** 作为运营分析师，我希望表格按照规范的列顺序和分组展示 74 列数据，以便快速阅读和对比各城市指标。

#### Acceptance Criteria

1. THE Data_Table SHALL 渲染 Row_Number_Column 作为第一列，列头显示 `#`，单元格展示从 1 开始的连续行号（排序或筛选后行号重新从 1 开始计数），背景色使用浅色（`bg-muted/50`），文字居中对齐，该列不可排序、不可隐藏、不可过滤。
2. THE Data_Table SHALL 按以下顺序渲染 74 个数据列，列头文字与规范文档中的字段名称保持一致：A-G 基础维度（7 列）、H-K 线上盈亏（4 列）、L-Q 订单量与跨期分析（6 列）、R-AB 交易商家健康度（11 列）、AC-AG 亏损毛利明细（5 列）、AH-AO 服务费率差额分段（8 列）、AP-AV 拼好饭保底收入分段（7 列）、AW 配送费差额（1 列）、AX-BC 合作商补贴分析（6 列）、BD-BG 合作商补贴率分段（4 列）、BH-BM 商代比分段（6 列）、BN-BV 商家原因异常单（9 列）。
3. THE Data_Table SHALL 使用多级表头（column groups），将上述各分组列归入对应的父级表头，父级表头文字与分组名称一致。
4. THE Data_Table SHALL 支持按任意数值列点击列头进行升序/降序排序，排序图标使用 `DataTableColumnHeader` 组件。
5. THE Data_Table SHALL 支持多列同时排序（multi-sort），用户按住 Shift 键点击列头时追加排序条件。

---

### Requirement 6: 列冻结

**User Story:** 作为运营分析师，我希望在水平滚动时始终看到行号和基础维度列，以便对照城市名称阅读右侧指标数据。

#### Acceptance Criteria

1. THE Data_Table SHALL 将 Row_Number_Column（`#`）固定在表格最左侧，水平滚动时不随内容区滚动。
2. THE Data_Table SHALL 将「日期」（`report_date`）、「城市简称」（`city_short_name`）、「商家类型」（`merchant_type_group`）三列固定在表格左侧（紧随行号列之后），水平滚动时保持可见。
3. WHEN 表格发生水平滚动，THE Frozen_Column 的右侧边缘 SHALL 渲染一条阴影分隔线，以视觉区分固定区域与滚动区域。

---

### Requirement 7: 数值格式化

**User Story:** 作为运营分析师，我希望金额、订单量、商家数等数值以千分位格式展示，占比和毛利率以百分比格式展示，以便快速读取数量级。

#### Acceptance Criteria

1. THE Number_Formatter SHALL 将整数数值格式化为千分位字符串（如 `1,234,567`），小数部分保留 0 位。
2. THE Data_Table SHALL 对金额列（线上账单收入合计、线上账单成本合计、线上账单毛利、代理商补贴金额B端、代理商补贴金额C端、消费GTV原价B端、消费GTV原价C端、毛利<0各列）、订单量列（消费订单量、线上账单订单量、T-n线上账单订单量、T+n线上账单订单量、商家原因异常单各列）、商家数列（全量商家数及所有商家数计数列）、分段计数列应用 Number_Formatter。
3. THE Percent_Formatter SHALL 在已计算好的数值（如 `12.34`）末尾追加 `%` 符号，不进行额外乘以 100 的运算（如 `12.34%`）。
4. THE Data_Table SHALL 对占比列（线上账单毛利率、T-n线上账单订单占比、T+n线上账单订单占比、商家服务费>0商家占比、线上账单毛利≥0交易商家占比、线上账单毛利<0交易商家占比、消费GTV为0且商家服务费为0商家占比、消费原价合作商补贴率B端、消费原价合作商补贴率C端）应用 Percent_Formatter。
5. WHEN 单元格数值为 `null` 或 `undefined`，THE Data_Table SHALL 渲染占位符 `—`，不渲染 `0` 或 `NaN`。

---

### Requirement 8: 条件格式化

**User Story:** 作为运营分析师，我希望「线上账单毛利」列的单元格根据正负值显示不同颜色，以便快速识别亏损城市。

#### Acceptance Criteria

1. WHEN 「线上账单毛利」列单元格数值大于 0，THE Data_Table SHALL 以绿色文字（`text-green-600 dark:text-green-400`）渲染该单元格。
2. WHEN 「线上账单毛利」列单元格数值小于 0，THE Data_Table SHALL 以红色文字（`text-red-600 dark:text-red-400`）渲染该单元格。
3. WHEN 「线上账单毛利」列单元格数值等于 0，THE Data_Table SHALL 以默认文字颜色渲染该单元格。
4. THE Conditional_Formatter SHALL 同时对「线上账单毛利<0交易商家毛利合计」及其按配送类型拆分的 4 个子列（毛利<0_代理、毛利<0_跑腿、毛利<0_商家配送、毛利<0_其他配送）应用相同的条件格式规则。
5. THE Conditional_Formatter SHALL 在应用颜色的同时保留 Number_Formatter 的千分位格式化输出。

---

### Requirement 9: 列头悬停提示

**User Story:** 作为运营分析师，我希望将鼠标悬停在带有 `❓` 标记的列头上时，能看到该指标的计算公式和数据血缘，以便理解指标含义。

#### Acceptance Criteria

1. THE Data_Table SHALL 对占比列、毛利率列、所有分段计数列、合作商补贴率列、商代比分段列的列头渲染 `❓` 图标（使用 `HelpCircle` lucide 图标，尺寸 `h-3 w-3`，颜色 `text-muted-foreground`）。
2. WHEN 用户将鼠标悬停在带有 `❓` 图标的列头上，THE Data_Table SHALL 通过 Radix UI `Tooltip` 组件展示该指标的计算公式与数据来源表名。
3. THE Header_Tooltip 的内容 SHALL 包含：指标中文名称、计算公式（使用字段英文名）、数据来源表（`ads_merchant_pnl_daily` / `ads_merchant_fee_daily` / `mv_subsidy_daily`）。
4. THE Header_Tooltip SHALL 在鼠标悬停 300ms 后显示，鼠标移出后立即隐藏。
5. THE Header_Tooltip 的宽度 SHALL 不超过 320px，内容超长时自动换行。

---

### Requirement 10: 表格分页

**User Story:** 作为运营分析师，我希望大数据量时表格支持分页，以便保持页面渲染性能。

#### Acceptance Criteria

1. THE Data_Table SHALL 在表格底部渲染 `DataTablePagination` 分页组件。
2. THE Data_Table SHALL 默认每页展示 20 行数据，支持用户切换为 50 行或 100 行。
3. WHEN 数据总行数不超过当前每页行数，THE Data_Table SHALL 隐藏分页组件。
4. THE Data_Table 的分页状态（当前页码、每页行数）SHALL 通过 URL 查询字符串（`page`、`pageSize`）持久化，支持页面刷新后恢复分页位置。
5. WHEN 筛选条件变更导致当前页码超出总页数，THE Data_Table SHALL 自动跳转回第 1 页。

---

### Requirement 11: 加载状态与空状态

**User Story:** 作为运营分析师，我希望在数据加载中和无数据时看到明确的状态提示，以便了解当前页面状态。

#### Acceptance Criteria

1. WHILE 数据处于加载中状态，THE Data_Table SHALL 渲染骨架屏（skeleton rows），行数与当前每页行数一致，列宽与实际列宽一致。
2. WHEN 数据加载完成且结果为空（0 行），THE Data_Table SHALL 在表格内容区居中展示「暂无数据」提示文字，并附带说明「请调整筛选条件后重试」。
3. WHEN 数据加载失败，THE Data_Table SHALL 展示错误提示，包含错误描述文字和「重试」按钮。
4. WHEN 用户点击「重试」按钮，THE Report_Page SHALL 重新触发数据加载。
5. WHILE 数据处于加载中状态，THE Toolbar 中的筛选器和查询按钮 SHALL 保持可交互状态（不禁用）。

---

### Requirement 12: 响应式布局与可用性

**User Story:** 作为运营分析师，我希望在不同屏幕尺寸下都能正常使用报表页面，以便在笔记本和大屏显示器上均有良好体验。

#### Acceptance Criteria

1. THE Report_Page SHALL 在视口宽度不小于 1280px 时完整展示 Toolbar 的所有筛选器控件（不折叠）。
2. WHEN 视口宽度小于 1280px，THE Toolbar SHALL 将筛选器控件换行排列，不发生水平溢出。
3. THE Data_Table SHALL 设置最小列宽：基础维度列最小宽度为 80px，数值指标列最小宽度为 100px，分段计数列最小宽度为 90px。
4. THE Data_Table SHALL 支持键盘导航：用户可通过 Tab 键在 Toolbar 控件之间切换焦点。
5. THE Data_Table 的所有交互控件（筛选器、列选择器、排序按钮、分页控件）SHALL 同时具备可访问的 `aria-label` 属性与屏幕阅读器兼容性，确保屏幕阅读器可正确朗读控件用途。

---

### Requirement 13: URL 状态持久化

**User Story:** 作为运营分析师，我希望页面的筛选、分页、日期范围等状态能通过 URL 保存，以便分享链接给同事时对方看到相同的视图。

#### Acceptance Criteria

1. THE Report_Page SHALL 使用 `useTableUrlState` hook 管理分页状态，将 `page` 和 `pageSize` 同步到 URL 查询字符串。
2. THE Report_Page SHALL 将多选筛选器状态（`cities`、`regions`、`merchantTypes`）以数组形式同步到 URL 查询字符串。
3. THE Report_Page SHALL 将日期范围（`startDate`、`endDate`）同步到 URL 查询字符串，格式为 `YYYY-MM-DD`。
4. WHEN 用户直接访问带有完整查询参数的 URL，THE Report_Page SHALL 从 URL 中恢复所有筛选、分页和日期范围状态，并以该状态渲染页面。
5. IF URL 中的查询参数值不合法（如日期格式错误、页码为负数），THEN THE Report_Page SHALL 忽略该参数并使用默认值，不抛出运行时错误。
