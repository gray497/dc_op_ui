# PAGE-商家维度-外卖商家费率&PHF&配送费 - 开发设计规范

## 1. 概述
* **页面名称**：商家维度-外卖商家费率&PHF&配送费
* **数据粒度**：商家级别（按 `日期` + `商家ID` 聚合）
* **总列数**：60列（A-BH列）
* **数据源**：
  * `ads_merchant_fee_daily`（包含已预聚合的订单、GTV、费用及拼好饭参数）
  * 维度表关联：`dim_organization`、`dim_merchant`、`dim_bd`、`dim_merchant_type`、`dim_delivery_type`、`dim_category`

## 2. 报表字段及计算逻辑
* **A-J列 基础维度**：`日` (report_date)、`外卖组织结构` (organization_name)、`商家名称` (merchant_name)、`商家ID` (merchant_id)、`合作BD` (bd_name)、`商家类型` (merchant_type_name)、`业务品类` (category_name, level=1)、`一级品类` (category_name, level=2)、`一级商家配送类型` (delivery_type_name, level=1)、`区域` (region)。
* **K-Q列 消费GTV和服务费**：
  * **消费GTV（原价-否拼好饭）** (K)：`gtv_original - phf_original_gmv` (ADS中预存为 `gtv_no_phf`)
  * **商家实际服务费（否拼好饭）** (L)：`fee_takeout + fee_shangou + fee_medicine` (ADS中预存为 `fee_actual_no_phf`)
  * **商家标准服务费（否拼好饭）** (M)：`消费GTV（原价-否拼好饭） * 商业支持服务费率` (ADS中预存为 `fee_std_no_phf`)
  * **商家服务费差额（否拼好饭）** (N)：`实际服务费 - 标准服务费` (即 `L - M`)
  * **商家支持服务费率（否拼好饭）** (O)：`实际服务费 / 消费GTV（原价-否拼好饭）` (即 `L / K`)
  * **商家支持服务费率（标准）** (P)：`commercial_support_rate`
  * **商家支持服务费率差额** (Q)：`实际服务费率 - 标准服务费率` (即 `O - P`)
* **R-Z列 拼好饭保底收入**：
  * **拼好饭完成订单量** (R) & **拼好饭拼单订单量** (S) & **占比** (T)：`phf_completed_orders`、`phf_group_orders` 及其占比。
  * **单均拼好饭实际保底收入** (U)：`拼好饭实际服务费 / 拼好饭完成订单量` (即 `V / R`)
  * **商家实际服务费（拼好饭）** (V)：`phf_fee_actual`
  * **单均拼好饭标准保底收入** (W)：拼好饭标准保底价格（关联城市配置 `dim_organization.pinhao_standard_income`）。
  * **商家标准服务费（拼好饭）** (X)：`单均标准保底 * 完成订单量` (即 `W * R`)
  * **单均拼好饭保底收入差额** (Y)：`实际保底单价 - 标准保底单价` (即 `U - W`)
  * **商家服务费差额（拼好饭）** (Z)：`实际服务费 - 标准服务费` (即 `V - X`)
* **AA-AD列 配送费分析**：
  * **最小起送配送费** (AA)：`min_delivery_fee`
  * **单均消费C配原价收入** (AB)：`消费C配原价收入 / 消费订单量（否拼好饭）` (即 `AT / AE`)
  * **单均实付配送费（GTV）** (AC)：`实付配送费（GTV） / 消费订单量（否拼好饭）` (即 `AU / AE`)
  * **单均配送费差额** (AD)：`单均C配原价收入 - 最小起送` (即 `AB - AA`)
* **AE-AF列 订单量与占比（否拼好饭）**：
  * **消费订单量（否拼好饭）** (AE)：`order_count - phf_completed_orders` (ADS中预存为 `order_count_no_phf`)
  * **消费订单量占比（否拼好饭）** (AF)：`AE / 消费订单量`
* **AG-AJ列 补贴率与商代比**：
  * **消费原价合作商补贴率** (AG)：`合作商补贴金额 / 消费GTV原价` (即 `AX / AR`)
  * **消费原价商家补贴率** (AH)：`商家补贴金额 / 消费GTV原价` (即 `AY / AR`)
  * **消费原价美团补贴率** (AI)：`美团补贴金额 / 消费GTV原价` (即 `AZ / AR`)
  * **商代比** (AJ)：`商家补贴金额 / 合作商补贴金额` (即 `AY / AX`)
* **AK-AN列 服务费明细**：`商家实际服务费（外卖）` (fee_takeout)、`商家实际服务费（拼好饭）` (phf_fee_actual)、`商家实际服务费（闪购）` (fee_shangou)、`商家实际服务费（医药）` (fee_medicine)。
* **AO-BH列 其他基础指标**：包含用户配送费、活动款、合作商服务费、消费GTV（原价）、消费GTV（实付）、消费C配原价收入、实付配送费GTV、餐盒费、订单量、合作商/商家/美团补贴金额、配送面积、最小起送价、拼好饭原价及实付交易额等。

## 3. 核心 Doris 查询 SQL
```sql
SELECT
  ads.report_date AS 日,
  org.organization_name AS 外卖组织结构,
  COALESCE(dm.merchant_name, '') AS 商家名称,
  ads.merchant_id AS 商家ID,
  COALESCE(bd.bd_name, '') AS 合作BD,
  COALESCE(mt.merchant_type_name, '') AS 商家类型,
  COALESCE(bc.category_name, '') AS 业务品类,
  COALESCE(pc.category_name, '') AS 一级品类,
  COALESCE(dt.delivery_type_name, '') AS 一级商家配送类型,
  org.region AS 区域,
  ads.gtv_no_phf AS 消费GTV原价否拼好饭,
  ads.fee_actual_no_phf AS 商家实际服务费否拼好饭,
  ads.fee_std_no_phf AS 商家标准服务费否拼好饭,
  ads.fee_actual_no_phf - ads.fee_std_no_phf AS 商家服务费差额否拼好饭,
  CASE WHEN ads.gtv_no_phf <> 0 THEN ads.fee_actual_no_phf / ads.gtv_no_phf ELSE NULL END AS 商家支持服务费率否拼好饭,
  ads.commercial_support_rate AS 商家支持服务费率标准,
  CASE WHEN ads.gtv_no_phf <> 0 THEN ads.fee_actual_no_phf / ads.gtv_no_phf - ads.commercial_support_rate ELSE NULL END AS 商家支持服务费率差额,
  ads.phf_completed_orders AS 拼好饭完成订单量,
  ads.phf_group_orders AS 拼好饭拼单订单量,
  CASE WHEN ads.phf_completed_orders <> 0 THEN ads.phf_group_orders * 1.0 / ads.phf_completed_orders ELSE NULL END AS 拼好饭拼单订单量占比,
  CASE WHEN ads.phf_completed_orders <> 0 THEN ads.phf_fee_actual * 1.0 / ads.phf_completed_orders ELSE NULL END AS 单均拼好饭实际保底收入,
  ads.phf_fee_actual AS 商家实际服务费拼好饭,
  ads.phf_standard_income AS 单均拼好饭标准保底收入,
  CASE WHEN ads.phf_completed_orders > 0 THEN COALESCE(ads.phf_standard_income, 0) * ads.phf_completed_orders ELSE 0 END AS 商家标准服务费拼好饭,
  CASE WHEN ads.phf_completed_orders <> 0 THEN ads.phf_fee_actual * 1.0 / ads.phf_completed_orders - COALESCE(ads.phf_standard_income, 0) ELSE NULL END AS 单均拼好饭保底收入差额,
  ads.phf_fee_actual - CASE WHEN ads.phf_completed_orders > 0 THEN COALESCE(ads.phf_standard_income, 0) * ads.phf_completed_orders ELSE 0 END AS 商家服务费差额拼好饭,
  ads.min_delivery_fee AS 最小起送配送费,
  CASE WHEN ads.order_count_no_phf <> 0 THEN ads.delivery_income_original * 1.0 / ads.order_count_no_phf ELSE NULL END AS 单均消费C配原价收入,
  CASE WHEN ads.order_count_no_phf <> 0 THEN ads.actual_delivery_fee_gtv * 1.0 / ads.order_count_no_phf ELSE NULL END AS 单均实付配送费GTV,
  CASE WHEN ads.order_count_no_phf <> 0 THEN ads.delivery_income_original * 1.0 / ads.order_count_no_phf - COALESCE(ads.min_delivery_fee, 0) ELSE NULL END AS 单均配送费差额,
  ads.order_count_no_phf AS 消费订单量否拼好饭,
  CASE WHEN ads.order_count <> 0 THEN ads.order_count_no_phf * 1.0 / ads.order_count ELSE NULL END AS 消费订单量占比否拼好饭,
  CASE WHEN ads.gtv_original <> 0 THEN ads.partner_subsidy_amount * 1.0 / ads.gtv_original ELSE NULL END AS 消费原价合作商补贴率,
  CASE WHEN ads.gtv_original <> 0 THEN ads.merchant_subsidy_amount * 1.0 / ads.gtv_original ELSE NULL END AS 消费原价商家补贴率,
  CASE WHEN ads.gtv_original <> 0 THEN ads.meituan_subsidy_amount * 1.0 / ads.gtv_original ELSE NULL END AS 消费原价美团补贴率,
  CASE WHEN ads.partner_subsidy_amount <> 0 THEN ads.merchant_subsidy_amount * 1.0 / ads.partner_subsidy_amount ELSE NULL END AS 商代比,
  ads.fee_takeout AS 商家实际服务费外卖,
  ads.fee_shangou AS 商家实际服务费闪购,
  ads.fee_medicine AS 商家实际服务费医药,
  ads.user_delivery_fee AS 用户配送费,
  ads.activity_fee AS 活动款,
  ads.partner_service_fee AS 合作商服务费,
  ads.gtv_original AS 消费GTV原价,
  ads.gtv_actual AS 消费GTV,
  ads.delivery_income_original AS 消费C配原价收入,
  ads.actual_delivery_fee_gtv AS 实付配送费GTV,
  ads.box_fee AS 消费餐盒费,
  ads.order_count AS 消费订单量,
  ads.partner_subsidy_amount AS 合作商补贴金额,
  ads.merchant_subsidy_amount AS 商家补贴金额,
  ads.meituan_subsidy_amount AS 美团补贴金额,
  ads.commercial_support_rate * 100 AS 商业支持服务费费率,
  ads.delivery_area AS 商家配送面积平方公里,
  ads.min_order_amount AS 起送价,
  ads.phf_original_gmv AS 拼好饭原价交易额,
  ads.phf_actual_gmv AS 拼好饭实付交易额
FROM ads_merchant_fee_daily ads
LEFT JOIN dim_organization org ON ads.organization_id = org.organization_id
LEFT JOIN dim_merchant dm ON ads.merchant_id = dm.merchant_id
LEFT JOIN dim_bd bd ON ads.bd_id = bd.bd_id
LEFT JOIN dim_merchant_type mt ON ads.merchant_type_code = mt.merchant_type_code
LEFT JOIN dim_delivery_type dt ON ads.delivery_type_l1_code = dt.delivery_type_code AND dt.level = 1
LEFT JOIN dim_category bc ON ads.business_category_code = bc.category_code AND bc.category_level = 1
LEFT JOIN dim_category pc ON ads.primary_category_code = pc.category_code AND pc.category_level = 2
WHERE ads.report_date BETWEEN :start_date AND :end_date
ORDER BY org.region, org.organization_name, ads.merchant_id;
```

## 4. 前端 Streamlit-AgGrid 配置要点
* **数据缓存与过滤**：支持按「外卖组织结构」、「区域」、「合作BD」、「商家类型」和「一级商家配送类型」进行前端多选过滤。
* **AgGrid 参数**：
  * 首列固定为浅色居中 `#` 行号列。
  * `minWidth=80`, `maxWidth=160` 确保表头在超宽时自动折行。
  * 对 `商家服务费差额否拼好饭` 和 `商家服务费差额拼好饭` 指标列应用条件格式化，正值显绿色，负值显红色。
* **指标提示**：配置 `headerTooltip`，对接 `config/takeout_merchant_metric_help.py`。
