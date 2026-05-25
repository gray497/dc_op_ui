# PAGE-区域维度-外卖商家费率&PHF&配送费 - 开发设计规范

## 1. 概述
* **页面名称**：区域维度-外卖商家费率&PHF&配送费
* **数据粒度**：区域级别（按 `日期` + `区域` + `负责人` + `商家类型` + `业务品类` + `一级商家配送类型` 聚合）
* **总列数**：56列（A-BD列，去除了组织结构、商户ID、商户名称等）
* **数据源**：
  * `ads_merchant_fee_daily`（与商家维度共用相同的 ADS 预计算表，仅 `GROUP BY` 的商户字段替换为区域、品类、配送等维度）
  * 维度表关联

## 2. 报表字段及计算逻辑
* **A-F列 基础与核心维度**：`日` (report_date)、`区域` (region)、`负责人` (manager)、`商家类型` (merchant_type_name)、`业务品类` (category_name)、`一级商家配送类型` (delivery_type_name)。
* **G-M列 消费GTV和服务费**：
  * **消费GTV原价否拼好饭** (G)：`SUM(ads.gtv_no_phf)`
  * **商家实际服务费否拼好饭** (H)：`SUM(ads.fee_actual_no_phf)`
  * **商家标准服务费否拼好饭** (I)：`SUM(ads.fee_std_no_phf)`
  * **商家服务费差额否拼好饭** (J)：`H - I`
  * **商家支持服务费率否拼好饭** (K)：`H / G` (先 SUM 分子分母再除)
  * **商家支持服务费率标准** (L)：区域聚合取 `AVG(ads.commercial_support_rate)`
  * **商家支持服务费率差额** (M)：`K - L`
* **N-V列 拼好饭保底收入**：
  * 完成单量 (N)、拼单量 (O) 及占比 (P)：采用 `SUM` 聚合后相除。
  * **单均拼好饭实际保底收入** (Q)：`拼好饭实际服务费 SUM / 完成单量 SUM` (即 `R / N`)
  * **商家实际服务费（拼好饭）** (R)：`SUM(ads.phf_fee_actual)`
  * **单均拼好饭标准保底收入** (S)：该区域下的 `MAX(ads.phf_standard_income)`
  * **商家标准服务费（拼好饭）** (T)：`S * N`
  * **单均拼好饭保底收入差额** (U)：`Q - S`
  * **商家服务费差额（拼好饭）** (V)：`R - T`
* **W-Z列 配送费分析**：
  * **最小起送配送费** (W)：区域聚合取 `AVG(ads.min_delivery_fee)`
  * **单均消费C配原价收入** (X)：`消费C配原价收入 SUM / 消费订单量（否拼好饭） SUM` (即 `消费C配 / 否拼好饭订单量`)
  * **单均实付配送费（GTV）** (Y)：`实付配送费（GTV） SUM / 否拼好饭订单量 SUM`
  * **单均配送费差额** (Z)：`X - W`
* **AA-AB列 订单量与占比（否拼好饭）**：
  * 订单数采用 `SUM` 聚合，占比采用除法计算。
* **AC-AF列 补贴率及商代比**：
  * 各补贴率采用 `SUM(补贴金额) / SUM(消费GTV原价)`，商代比采用 `SUM(商家补贴) / SUM(合作商补贴)` 规则重算。
* **AG-BD列 服务费明细与基础指标**：
  * 服务费、配送费、补贴金额等采用 `SUM` 聚合；商业支持费率、配送面积、起送价等参数列采用 `AVG` 聚合。

## 3. 核心 Doris 查询 SQL
```sql
WITH region_manager AS (
  SELECT region, MAX(manager) AS manager
  FROM dim_organization
  WHERE region IS NOT NULL AND region <> ''
  GROUP BY region
)
SELECT
  ads.report_date AS 日,
  org.region AS 区域,
  COALESCE(rm.manager, '') AS 负责人,
  COALESCE(mt.merchant_type_name, '') AS 商家类型,
  COALESCE(bc.category_name, '') AS 业务品类,
  COALESCE(dt.delivery_type_name, '') AS 一级商家配送类型,
  SUM(ads.gtv_no_phf) AS 消费GTV原价否拼好饭,
  SUM(ads.fee_actual_no_phf) AS 商家实际服务费否拼好饭,
  SUM(ads.fee_std_no_phf) AS 商家标准服务费否拼好饭,
  SUM(ads.fee_actual_no_phf) - SUM(ads.fee_std_no_phf) AS 商家服务费差额否拼好饭,
  CASE WHEN SUM(ads.gtv_no_phf) <> 0 THEN SUM(ads.fee_actual_no_phf) / SUM(ads.gtv_no_phf) ELSE NULL END AS 商家支持服务费率否拼好饭,
  AVG(ads.commercial_support_rate) AS 商家支持服务费率标准,
  CASE WHEN SUM(ads.gtv_no_phf) <> 0 THEN SUM(ads.fee_actual_no_phf) / SUM(ads.gtv_no_phf) - AVG(ads.commercial_support_rate) ELSE NULL END AS 商家支持服务费率差额,
  SUM(ads.phf_completed_orders) AS 拼好饭完成订单量,
  SUM(ads.phf_group_orders) AS 拼好饭拼单订单量,
  CASE WHEN SUM(ads.phf_completed_orders) <> 0 THEN SUM(ads.phf_group_orders) * 1.0 / SUM(ads.phf_completed_orders) ELSE NULL END AS 拼好饭拼单订单量占比,
  CASE WHEN SUM(ads.phf_completed_orders) <> 0 THEN SUM(ads.phf_fee_actual) * 1.0 / SUM(ads.phf_completed_orders) ELSE NULL END AS 单均拼好饭实际保底收入,
  SUM(ads.phf_fee_actual) AS 商家实际服务费拼好饭,
  MAX(ads.phf_standard_income) AS 单均拼好饭标准保底收入,
  CASE WHEN SUM(ads.phf_completed_orders) > 0 THEN COALESCE(MAX(ads.phf_standard_income), 0) * SUM(ads.phf_completed_orders) ELSE 0 END AS 商家标准服务费拼好饭,
  CASE WHEN SUM(ads.phf_completed_orders) <> 0 THEN SUM(ads.phf_fee_actual) * 1.0 / SUM(ads.phf_completed_orders) - COALESCE(MAX(ads.phf_standard_income), 0) ELSE NULL END AS 单均拼好饭保底收入差额,
  SUM(ads.phf_fee_actual) - CASE WHEN SUM(ads.phf_completed_orders) > 0 THEN COALESCE(MAX(ads.phf_standard_income), 0) * SUM(ads.phf_completed_orders) ELSE 0 END AS 商家服务费差额拼好饭,
  AVG(ads.min_delivery_fee) AS 最小起送配送费,
  CASE WHEN SUM(ads.order_count_no_phf) <> 0 THEN SUM(ads.delivery_income_original) * 1.0 / SUM(ads.order_count_no_phf) ELSE NULL END AS 单均消费C配原价收入,
  CASE WHEN SUM(ads.order_count_no_phf) <> 0 THEN SUM(ads.actual_delivery_fee_gtv) * 1.0 / SUM(ads.order_count_no_phf) ELSE NULL END AS 单均实付配送费GTV,
  CASE WHEN SUM(ads.order_count_no_phf) <> 0 THEN SUM(ads.delivery_income_original) * 1.0 / SUM(ads.order_count_no_phf) - AVG(COALESCE(ads.min_delivery_fee, 0)) ELSE NULL END AS 单均配送费差额,
  SUM(ads.order_count_no_phf) AS 消费订单量否拼好饭,
  CASE WHEN SUM(ads.order_count) <> 0 THEN SUM(ads.order_count_no_phf) * 1.0 / SUM(ads.order_count) ELSE NULL END AS 消费订单量占比否拼好饭,
  CASE WHEN SUM(ads.gtv_original) <> 0 THEN SUM(ads.partner_subsidy_amount) / SUM(ads.gtv_original) ELSE NULL END AS 消费原价合作商补贴率,
  CASE WHEN SUM(ads.gtv_original) <> 0 THEN SUM(ads.merchant_subsidy_amount) / SUM(ads.gtv_original) ELSE NULL END AS 消费原价商家补贴率,
  CASE WHEN SUM(ads.gtv_original) <> 0 THEN SUM(ads.meituan_subsidy_amount) / SUM(ads.gtv_original) ELSE NULL END AS 消费原价美团补贴率,
  CASE WHEN SUM(ads.partner_subsidy_amount) <> 0 THEN SUM(ads.merchant_subsidy_amount) / SUM(ads.partner_subsidy_amount) ELSE NULL END AS 商代比,
  SUM(ads.fee_takeout) AS 商家实际服务费外卖,
  SUM(ads.fee_shangou) AS 商家实际服务费闪购,
  SUM(ads.fee_medicine) AS 商家实际服务费医药,
  SUM(ads.user_delivery_fee) AS 用户配送费,
  SUM(ads.activity_fee) AS 活动款,
  SUM(ads.partner_service_fee) AS 合作商服务费,
  SUM(ads.gtv_original) AS 消费GTV原价,
  SUM(ads.gtv_actual) AS 消费GTV,
  SUM(ads.delivery_income_original) AS 消费C配原价收入,
  SUM(ads.actual_delivery_fee_gtv) AS 实付配送费GTV,
  SUM(ads.box_fee) AS 消费餐盒费,
  SUM(ads.order_count) AS 消费订单量,
  SUM(ads.partner_subsidy_amount) AS 合作商补贴金额,
  SUM(ads.merchant_subsidy_amount) AS 商家补贴金额,
  SUM(ads.meituan_subsidy_amount) AS 美团补贴金额,
  AVG(ads.commercial_support_rate) * 100 AS 商业支持服务费费率,
  AVG(ads.delivery_area) AS 商家配送面积平方公里,
  AVG(ads.min_order_amount) AS 起送价,
  SUM(ads.phf_original_gmv) AS 拼好饭原价交易额,
  SUM(ads.phf_actual_gmv) AS 拼好饭实付交易额
FROM ads_merchant_fee_daily ads
LEFT JOIN dim_organization org ON ads.organization_id = org.organization_id
LEFT JOIN dim_merchant_type mt ON ads.merchant_type_code = mt.merchant_type_code
LEFT JOIN dim_category bc ON ads.business_category_code = bc.category_code AND bc.category_level = 1
LEFT JOIN dim_delivery_type dt ON ads.delivery_type_l1_code = dt.delivery_type_code AND dt.level = 1
LEFT JOIN region_manager rm ON org.region = rm.region
WHERE ads.report_date BETWEEN :start_date AND :end_date
  AND org.region IS NOT NULL AND org.region <> ''
GROUP BY
  ads.report_date, org.region, rm.manager, mt.merchant_type_name, bc.category_name, dt.delivery_type_name
ORDER BY org.region, mt.merchant_type_name, bc.category_name, dt.delivery_type_name;
```

## 4. 前端 Streamlit-AgGrid 配置要点
* **行号配置**：首列固定为浅色居中 `#` 行号列。
* **数据过滤**：前端支持按「区域」、「商家类型」、「业务品类」和「一级商家配送类型」进行前端过滤。
* **AgGrid 参数**：表头自动折行（maxWidth=160），对 `商家服务费差额否拼好饭` 和 `商家服务费差额拼好饭` 应用条件格式化。
* **指标提示**：表头悬停提示对接 `config/takeout_region_metric_help.py`。
