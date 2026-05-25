# PAGE-城市-股东利润表(MTD) - 开发设计规范

## 1. 概述
* **页面名称**：城市-股东利润表(MTD)
* **业务目的**：用于分析城市维度的股东经营利润表现，提供月度 MTD 累计视角和每日趋势深度下钻，还原财务报表各项直接/期间成本构成与最终净利润。
* **双 Tab 页面架构**：
  * **Tab 1：月维度 (MTD)**：按月份查询，包含「城市」与「区域」双子 Tab，通过 AgGrid 表格展示 MTD 累计数据。选择某行可在下方查看 Plotly 趋势图与环比 MTD 数据对照。
  * **Tab 2：高级查询**：支持自定义任意日期范围，查询日粒度趋势指标。

## 2. 数据源与分摊规则
* **日账单数据 (dj/dc)**：`dwd_partner_daily_bill`（到家/到餐收入、用户配送费、活动款等）
* **经营分析数据**：`dwd_partner_business_analysis_daily`（GTV、补贴、单量等）
* **配送日规模数据**：`dwd_delivery_station_scale_daily`（delivered_waybill_cnt 运单量）
* **月度分摊参数**：
  * `dwd_city_salary_delivery_monthly`（专送骑手、HD、跑腿单均成本参数；到家、到餐和管理人员月度薪资总额；社保、增值税、企业所得税等月度总额）
  * `dwd_push_order_monthly`（外卖、团购月推单费）
  * **分摊口径**：月度参数在折算至每日指标时，统一除以**当前月份自然天数**（即 `days_in_month`）进行每日均摊。

## 3. 指标分层计算公式 (日粒度)
* **到家-跑腿收入**：`跑腿单均收入 * 跑腿运单量`
* **到家-其他支出**：`到家-平台收入 - 到家-商家服务费 - 到家-用户配送费 - 到家-活动款`
* **到餐-其他支出**：`到餐-平台收入 - 到餐-商家服务费 - 到餐-活动款`
* **薪资-专送骑手**：`专送单均成本 * 专送运单量`
* **到家-HD费用支出**：`HD单均成本 * HD运单量`
* **到家-跑腿邮资**：`跑腿单均成本 * 跑腿运单量`
* **薪资/税费/推单费日分摊**：`对应月度值 / 当月天数`
* **到家-营收收入合计**：`到家-商家服务费 + 到家-用户配送费 + 到家-跑腿收入`
* **到家-成本合计**：`到家-活动款 + 到家-其他支出 + 薪资-专送骑手 + 到家-HD费用支出 + 到家-跑腿邮资 + 薪资-到家团队 + 外卖-推单费 + 到家-开票税费` (注：成本均为负值)
* **到家-利润**：`到家-营收收入合计 + 到家-成本合计`
* **到餐-营收收入合计**：`到餐-商家服务费`
* **到餐-成本合计**：`到餐-活动款 + 到餐-其他支出 + 薪资-到餐团队 + 团购-推单费 + 到餐-开票税费`
* **到餐-利润**：`到餐-营收收入合计 + 到餐-成本合计`
* **营业收入合计**：`到家-营收收入合计 + 到餐-营收收入合计`
* **直接成本合计**：`薪资-专送骑手 + 到家-HD费用支出 + 到家-跑腿邮资 + 到家-活动款 + 到家-其他支出 + 到餐-活动款 + 到餐-其他支出`
* **期间成本合计**：`薪资-到家团队 + 薪资-到餐团队 + 薪资-办公与管理人员 + 城市办公+其他支出 + 外卖-推单费 + 团购-推单费 + 到家-开票税费 + 到餐-开票税费 + 社保款 + 增值及附加税 + 企业所得税`
* **总成本**：`直接成本合计 + 期间成本合计`
* **净利润**：`营业收入合计 + 总成本`

## 4. 核心 Doris 查询 SQL (日粒度基础层)
```sql
WITH bill_daily AS (
    SELECT
        bill_date AS dt,
        city_id,
        dj_platform_income, dj_merchant_service_fee, dj_user_delivery_fee,
        dj_delivery_order_count, dj_activity_fee, dj_penalty_fee,
        dj_partner_service_fee, dj_partner_cost_adjustment,
        dj_enterprise_delivery_fee, dj_enterprise_waybill_count, dj_invoice_amount,
        dc_platform_income, dc_merchant_service_fee, dc_activity_fee,
        dc_penalty_fee, dc_partner_service_fee, dc_partner_cost_adjustment, dc_invoice_amount
    FROM dwd_partner_daily_bill
    WHERE bill_date BETWEEN :start_date AND :end_date
),
biz_daily AS (
    SELECT
        b.stat_date AS dt,
        b.city_id,
        SUM(b.consume_gtv_original) AS consume_gtv_original,
        SUM(b.consume_gtv) AS consume_gtv,
        SUM(b.consume_c_delivery_original_income) AS consume_c_delivery_original_income,
        SUM(b.consume_actual_delivery_fee) AS consume_actual_delivery_fee,
        SUM(b.partner_subsidy_amount) AS partner_subsidy_amount,
        SUM(b.merchant_subsidy_amount) AS merchant_subsidy_amount,
        SUM(b.meituan_subsidy_amount) AS meituan_subsidy_amount,
        SUM(b.push_merchant_order_count) AS push_merchant_order_count,
        SUM(b.consume_order_count) AS consume_order_count
    FROM dwd_partner_business_analysis_daily b
    WHERE b.stat_date BETWEEN :start_date AND :end_date
    GROUP BY b.stat_date, b.city_id
),
delivery_daily AS (
    SELECT
        s.report_date AS dt,
        CAST(st.city_agent_city_id AS BIGINT) AS city_id,
        SUM(s.delivered_waybill_cnt) AS delivery_finish_order_count,
        SUM(CASE WHEN sb.service_brand_name='城市代理站' THEN s.delivered_waybill_cnt ELSE 0 END) AS dedicated_order_count,
        SUM(CASE WHEN sb.service_brand_name='众包站' THEN s.delivered_waybill_cnt ELSE 0 END) AS errand_order_count
    FROM dwd_delivery_station_scale_daily s
    LEFT JOIN dim_delivery_station st ON s.station_id = st.station_id
    LEFT JOIN dim_delivery_service_brand sb ON s.service_brand_id = sb.service_brand_id
    WHERE s.report_date BETWEEN :start_date AND :end_date AND st.city_agent_city_id IS NOT NULL
    GROUP BY s.report_date, CAST(st.city_agent_city_id AS BIGINT)
),
month_dim AS (
    SELECT
        date_month, city_id,
        salary_hd_team, salary_dc_team, salary_office_admin, office_other_expense,
        social_insurance, value_added_tax, corporate_income_tax,
        dedicated_unit_cost, hd_unit_cost, errand_unit_cost, errand_unit_revenue, invoice_tax_rate
    FROM dwd_city_salary_delivery_monthly
),
push_month AS (
    SELECT bill_month AS date_month, city_id, waimai_push_fee, tuangou_push_fee
    FROM dwd_push_order_monthly
),
base AS (
    SELECT
        b.dt, b.city_id,
        DAY(LAST_DAY(b.dt)) AS days_in_month,
        b.dj_platform_income, b.dj_merchant_service_fee, b.dj_user_delivery_fee,
        b.dj_delivery_order_count, b.dj_activity_fee, b.dj_invoice_amount,
        b.dc_platform_income, b.dc_merchant_service_fee, b.dc_activity_fee, b.dc_invoice_amount,
        z.consume_gtv_original, z.consume_gtv, z.consume_c_delivery_original_income,
        z.consume_actual_delivery_fee, z.partner_subsidy_amount, z.merchant_subsidy_amount,
        z.meituan_subsidy_amount, z.consume_order_count,
        d.delivery_finish_order_count, d.dedicated_order_count,
        (d.delivery_finish_order_count - d.dedicated_order_count - d.errand_order_count) AS hd_order_count,
        d.errand_order_count,
        m.salary_hd_team, m.salary_dc_team, m.salary_office_admin, m.office_other_expense,
        m.social_insurance, m.value_added_tax, m.corporate_income_tax,
        m.dedicated_unit_cost, m.hd_unit_cost, m.errand_unit_cost, m.errand_unit_revenue, m.invoice_tax_rate,
        p.waimai_push_fee, p.tuangou_push_fee
    FROM bill_daily b
    LEFT JOIN biz_daily z ON z.dt=b.dt AND z.city_id=b.city_id
    LEFT JOIN delivery_daily d ON d.dt=b.dt AND d.city_id=b.city_id
    LEFT JOIN month_dim m ON m.date_month = DATE_FORMAT(b.dt, '%Y-%m-01') AND m.city_id=b.city_id
    LEFT JOIN push_month p ON p.date_month = DATE_FORMAT(b.dt, '%Y-%m-01') AND p.city_id=b.city_id
),
calc AS (
    SELECT
        dt, city_id,
        dj_merchant_service_fee AS m_到家_商家服务费,
        dj_user_delivery_fee AS m_到家_用户配送费,
        dc_merchant_service_fee AS m_到餐_商家服务费,
        dj_activity_fee AS m_到家_活动款,
        dc_activity_fee AS m_到餐_活动款,
        dj_platform_income AS m_到家_平台收入,
        dc_platform_income AS m_到餐_平台收入,
        delivery_finish_order_count AS m_配送完成运单量,
        dedicated_order_count AS m_专送运单量,
        hd_order_count AS m_HD运单量,
        errand_order_count AS m_跑腿运单量,
        errand_unit_revenue * errand_order_count AS m_到家_跑腿收入,
        (dj_platform_income - dj_merchant_service_fee - dj_user_delivery_fee - dj_activity_fee) AS m_到家_其他支出,
        (dc_platform_income - dc_merchant_service_fee - dc_activity_fee) AS m_到餐_其他支出,
        dedicated_unit_cost * dedicated_order_count AS m_薪资_专送骑手,
        hd_unit_cost * hd_order_count AS m_到家_HD费用支出,
        errand_unit_cost * errand_order_count AS m_到家_跑腿邮资,
        salary_hd_team / NULLIF(days_in_month,0) AS m_薪资_到家团队,
        salary_dc_team / NULLIF(days_in_month,0) AS m_薪资_到餐团队,
        salary_office_admin / NULLIF(days_in_month,0) AS m_薪资_办公与管理人员,
        office_other_expense / NULLIF(days_in_month,0) AS m_城市办公_其他支出,
        social_insurance / NULLIF(days_in_month,0) AS m_社保款,
        value_added_tax / NULLIF(days_in_month,0) AS m_增值及附加税,
        corporate_income_tax / NULLIF(days_in_month,0) AS m_企业所得税,
        waimai_push_fee / NULLIF(days_in_month,0) AS m_外卖_推单费,
        tuangou_push_fee / NULLIF(days_in_month,0) AS m_团购_推单费,
        -dj_invoice_amount * invoice_tax_rate AS m_到家_开票税费,
        -dc_invoice_amount * invoice_tax_rate AS m_到餐_开票税费,
        consume_gtv_original AS m_消费GTV_原价,
        consume_gtv AS m_消费GTV,
        consume_c_delivery_original_income AS m_消费C配原价收入,
        consume_actual_delivery_fee AS m_消费实付配送费,
        partner_subsidy_amount AS m_合作商补贴金额,
        merchant_subsidy_amount AS m_商家补贴金额,
        meituan_subsidy_amount AS m_美团补贴金额,
        consume_order_count AS m_消费订单量
    FROM base
)
SELECT
    dt, city_id,
    (m_到家_商家服务费 + m_到家_用户配送费 + m_到家_跑腿收入) AS `到家-营收收入合计`,
    (m_到家_活动款 + m_到家_其他支出 + m_薪资_专送骑手 + m_到家_HD费用支出 + m_到家_跑腿邮资 + m_薪资_到家团队 + m_外卖_推单费 + m_到家_开票税费) AS `到家-成本合计`,
    ((m_到家_商家服务费 + m_到家_用户配送费 + m_到家_跑腿收入) + (m_到家_活动款 + m_到家_其他支出 + m_薪资_专送骑手 + m_到家_HD费用支出 + m_到家_跑腿邮资 + m_薪资_到家团队 + m_外卖_推单费 + m_到家_开票税费)) AS `到家-利润`,
    m_到餐_商家服务费 AS `到餐-营收收入合计`,
    (m_到餐_活动款 + m_到餐_其他支出 + m_薪资_到餐团队 + m_团购_推单费 + m_到餐_开票税费) AS `到餐-成本合计`,
    (m_到餐_商家服务费 + m_到餐_活动款 + m_到餐_其他支出 + m_薪资_到餐团队 + m_团购_推单费 + m_到餐_开票税费) AS `到餐-利润`,
    ((m_到家_商家服务费 + m_到家_用户配送费 + m_到家_跑腿收入) + m_到餐_商家服务费) AS `营业收入合计`,
    (m_薪资_专送骑手 + m_到家_HD费用支出 + m_到家_跑腿邮资 + m_到家_活动款 + m_到家_其他支出 + m_到餐_活动款 + m_到餐_其他支出) AS `直接成本合计`,
    (m_薪资_到家团队 + m_薪资_到餐团队 + m_薪资_办公与管理人员 + m_城市办公_其他支出 + m_外卖_推单费 + m_团购_推单费 + m_到家_开票税费 + m_到餐_开票税费 + m_社保款 + m_增值及附加税 + m_企业所得税) AS `期间成本合计`,
    ((m_到家_商家服务费 + m_到家_用户配送费 + m_到家_跑腿收入) + m_到餐_商家服务费) + ((m_薪资_专送骑手 + m_到家_HD费用支出 + m_到家_跑腿邮资 + m_到家_活动款 + m_到家_其他支出 + m_到餐_活动款 + m_到餐_其他支出) + (m_薪资_到家团队 + m_薪资_到餐团队 + m_薪资_办公与管理人员 + m_城市办公_其他支出 + m_外卖_推单费 + m_团购_推单费 + m_到家_开票税费 + m_到餐_开票税费 + m_社保款 + m_增值及附加税 + m_企业所得税)) AS `净利润`,
    m_消费GTV_原价 AS `消费GTV（原价）`,
    m_消费GTV AS `消费GTV`,
    m_合作商补贴金额 AS `合作商补贴金额`,
    m_商家补贴金额 AS `商家补贴金额`,
    m_美团补贴金额 AS `美团补贴金额`,
    m_消费订单量 AS `消费订单量`
FROM calc;
```

### 月度 MTD 二次聚合规则 (月份维度)
若要求取 MTD 数据，需在上述日维度结果集之上：
* **求和项**（营收、成本、利润、订单量、金额等）：`SUM(metric_daily)`
* **比率项**：重算分子分母。例如：
  * `到家-利润率 MTD = SUM(到家-利润) / SUM(到家-营收收入合计)`
  * `消费原价合作商补贴率 MTD = SUM(合作商补贴金额) / SUM(消费GTV原价)`
  * `补贴商代比 MTD = SUM(商家补贴金额) / SUM(合作商补贴金额)`
* **均值项**（专送单量占比等）：`SUM(专送运单量) / SUM(配送完成运单量)`

## 5. 前端 AgGrid 与 Plotly 趋势图联动
* **行号配置**：首列固定为浅色居中 `#` 行号列。
* **选中行联动机制**：AgGrid 表格单选模式，监听选中行的变化，当用户选中某一行时，通过 `st.session_state` 记录选中的 `城市简称/区域` 和 `月份`。
* **趋势下钻 Fragment**：将指标 Pills 按钮组、Multiselect、Plotly 折线趋势图和右侧 MTD 环比数据表放在一个单独的 `@st.fragment` 容器中，保证在交互切换指标时不会重载 AgGrid 主表，避免页面闪烁。
