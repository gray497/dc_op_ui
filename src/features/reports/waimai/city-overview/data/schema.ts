/**
 * 城市维度-外卖整体分析 数据行类型定义
 *
 * 对应报表列 A-BV（共 74 列），字段命名遵循 snake_case。
 * - 维度字段（字符串）：`string` 或 `string | null`
 * - 指标字段（数值）：`number | null`（null 表示无数据）
 * - 百分比字段已乘以 100，例如 12.34 表示 12.34%
 */
export interface CityOverviewRow {
  // ── A-G 基础维度 ──────────────────────────────────────────────────────────
  /** A 日期，格式 YYYY-MM-DD */
  report_date: string
  /** B 城市简称 */
  city_short_name: string
  /** C 美团系统城市名称 */
  city_name: string
  /** D 城市等级 */
  city_level: string | null
  /** E 区域 */
  region: string | null
  /** F 负责人 */
  manager: string | null
  /** G 商家类型分组 */
  merchant_type_group: string

  // ── H-K 线上盈亏 ──────────────────────────────────────────────────────────
  /** H 线上账单收入合计 */
  revenue_total: number | null
  /** I 线上账单成本合计 */
  cost_total: number | null
  /** J 线上账单毛利 */
  gross_profit: number | null
  /** K 线上账单毛利率（已乘以 100，如 12.34 表示 12.34%） */
  gross_profit_rate: number | null

  // ── L-Q 订单量与跨期分析 ──────────────────────────────────────────────────
  /** L 线上消费订单量 */
  order_count_consume: number | null
  /** M 线上账单订单量 */
  order_count_bill: number | null
  /** N T-n 线上账单订单量 */
  order_count_tn: number | null
  /** O T-n+ 线上账单订单量 */
  order_count_tn_plus: number | null
  /** P T-n 线上账单订单占比（已乘以 100） */
  order_count_tn_ratio: number | null
  /** Q T-n+ 线上账单订单占比（已乘以 100） */
  order_count_tn_plus_ratio: number | null

  // ── R-AB 交易商家健康度 ────────────────────────────────────────────────────
  /** R 交易商家总数 */
  merchant_count_total: number | null
  /** S 服务费率 > 0 的商家数 */
  merchant_count_fee_gt0: number | null
  /** T 毛利 ≥ 0 的商家数 */
  merchant_count_profit_gte0: number | null
  /** U 毛利 < 0 的商家数 */
  merchant_count_profit_lt0: number | null
  /** V 服务费率 > 0 的商家占比（已乘以 100） */
  merchant_ratio_fee_gt0: number | null
  /** W 毛利 ≥ 0 的商家占比（已乘以 100） */
  merchant_ratio_profit_gte0: number | null
  /** X 毛利 < 0 的商家占比（已乘以 100） */
  merchant_ratio_profit_lt0: number | null
  /** Y GTV > 0 且服务费率 = 0 的商家数 */
  merchant_count_gtv0_fee0: number | null
  /** Z GTV > 0 且服务费率 = 0 的商家占比（已乘以 100） */
  merchant_ratio_gtv0_fee0: number | null
  /** AA GTV > 0 且服务费率 > 0 的商家数 */
  merchant_count_gtv0_fee_gt0: number | null
  /** AB GTV > 0 且服务费率 = 0 的商家数（另一口径） */
  merchant_count_gtv_gt0_fee0: number | null

  // ── AC-AG 亏损毛利明细 ────────────────────────────────────────────────────
  /** AC 亏损毛利合计 */
  loss_profit_total: number | null
  /** AD 代理商亏损毛利 */
  loss_profit_proxy: number | null
  /** AE 跑腿亏损毛利 */
  loss_profit_runner: number | null
  /** AF 商家配送亏损毛利 */
  loss_profit_merchant_delivery: number | null
  /** AG 其他亏损毛利 */
  loss_profit_other: number | null

  // ── AH-AO 服务费率差额分段 ────────────────────────────────────────────────
  /** AH 服务费率差额 < -10% 的商家数 */
  fee_rate_diff_neg_inf_to_neg10: number | null
  /** AI 服务费率差额 [-10%, -5%) 的商家数 */
  fee_rate_diff_neg10_to_neg5: number | null
  /** AJ 服务费率差额 [-5%, -1%) 的商家数 */
  fee_rate_diff_neg5_to_neg1: number | null
  /** AK 服务费率差额 [-1%, 0%) 的商家数 */
  fee_rate_diff_neg1_to_0: number | null
  /** AL 服务费率差额 [0%, 5%) 的商家数 */
  fee_rate_diff_0_to_5: number | null
  /** AM 服务费率差额 [5%, 10%) 的商家数 */
  fee_rate_diff_5_to_10: number | null
  /** AN 服务费率差额 ≥ 10% 的商家数 */
  fee_rate_diff_10_to_inf: number | null
  /** AO 服务费率差额 < 0 的商家总数 */
  fee_rate_diff_lt0_total: number | null

  // ── AP-AV 拼好饭保底收入分段 ──────────────────────────────────────────────
  /** AP 拼好饭保底收入差额 < 0 的商家数 */
  phf_diff_lt0_count: number | null
  /** AQ 拼好饭保底收入 [0, 3.5) 的商家数 */
  phf_income_0_to_3p5: number | null
  /** AR 拼好饭保底收入 [3.5, 4.0) 的商家数 */
  phf_income_3p5_to_4p0: number | null
  /** AS 拼好饭保底收入 [4.0, 4.5) 的商家数 */
  phf_income_4p0_to_4p5: number | null
  /** AT 拼好饭保底收入 [4.5, 5.0) 的商家数 */
  phf_income_4p5_to_5p0: number | null
  /** AU 拼好饭保底收入 [5.0, 6.0) 的商家数 */
  phf_income_5p0_to_6p0: number | null
  /** AV 拼好饭保底收入 ≥ 6.0 的商家数 */
  phf_income_6p0_to_inf: number | null

  // ── AW 配送费差额 ─────────────────────────────────────────────────────────
  /** AW 配送费差额 < 0 的商家数 */
  delivery_fee_diff_lt0_count: number | null

  // ── AX-BC 合作商补贴分析 ──────────────────────────────────────────────────
  /** AX B 类合作商 GTV */
  gtv_b: number | null
  /** AY B 类合作商补贴金额 */
  subsidy_b: number | null
  /** AZ B 类合作商补贴率（已乘以 100） */
  subsidy_rate_b: number | null
  /** BA C 类合作商 GTV */
  gtv_c: number | null
  /** BB C 类合作商补贴金额 */
  subsidy_c: number | null
  /** BC C 类合作商补贴率（已乘以 100） */
  subsidy_rate_c: number | null

  // ── BD-BG 合作商补贴率分段 ────────────────────────────────────────────────
  /** BD 合作商补贴率 [0%, 5%) 的商家数 */
  partner_subsidy_rate_0_to_5: number | null
  /** BE 合作商补贴率 [5%, 7%) 的商家数 */
  partner_subsidy_rate_5_to_7: number | null
  /** BF 合作商补贴率 [7%, 10%) 的商家数 */
  partner_subsidy_rate_7_to_10: number | null
  /** BG 合作商补贴率 ≥ 10% 的商家数 */
  partner_subsidy_rate_10_to_inf: number | null

  // ── BH-BM 商代比分段 ──────────────────────────────────────────────────────
  /** BH 商代比 [0, 1) 的商家数 */
  merchant_partner_ratio_0_to_1: number | null
  /** BI 商代比 [1, 2) 的商家数 */
  merchant_partner_ratio_1_to_2: number | null
  /** BJ 商代比 [2, 3) 的商家数 */
  merchant_partner_ratio_2_to_3: number | null
  /** BK 商代比 [3, 4) 的商家数 */
  merchant_partner_ratio_3_to_4: number | null
  /** BL 商代比 [4, 5) 的商家数 */
  merchant_partner_ratio_4_to_5: number | null
  /** BM 商代比 ≥ 5 的商家数 */
  merchant_partner_ratio_5_to_inf: number | null

  // ── BN-BV 商家原因异常单 ──────────────────────────────────────────────────
  /** BN 商家原因异常单总数 */
  abnormal_order_total: number | null
  /** BO 未接单异常单数 */
  abnormal_no_accept: number | null
  /** BP 拒单异常单数 */
  abnormal_reject: number | null
  /** BQ 取消未通知异常单数 */
  abnormal_cancel_no_notify: number | null
  /** BR 状态异常单数 */
  abnormal_status: number | null
  /** BS 延迟异常单数 */
  abnormal_delay: number | null
  /** BT 错餐异常单数 */
  abnormal_wrong_meal: number | null
  /** BU 投诉异常单数 */
  abnormal_complaint: number | null
  /** BV 差评异常单数 */
  abnormal_bad_review: number | null
}
