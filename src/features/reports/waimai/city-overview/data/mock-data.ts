import type { CityOverviewRow } from './schema'

// ── 辅助函数 ──────────────────────────────────────────────────────────────────

/** 在 [min, max] 范围内生成随机整数 */
function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/** 在 [min, max] 范围内生成随机浮点数（保留 2 位小数） */
function randFloat(min: number, max: number): number {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100
}

/** 约 10% 概率返回 null，否则返回 value */
function maybeNull<T>(value: T, nullRate = 0.1): T | null {
  return Math.random() < nullRate ? null : value
}

// ── 枚举数据 ──────────────────────────────────────────────────────────────────

const CITIES: Array<{
  short: string
  name: string
  level: string
  region: string
  manager: string
}> = [
  { short: '北京', name: '北京市', level: 'S', region: '华北', manager: '张伟' },
  { short: '上海', name: '上海市', level: 'S', region: '华东', manager: '李娜' },
  { short: '广州', name: '广州市', level: 'S', region: '华南', manager: '王芳' },
  { short: '深圳', name: '深圳市', level: 'S', region: '华南', manager: '刘洋' },
  { short: '成都', name: '成都市', level: 'A', region: '西南', manager: '陈静' },
  { short: '杭州', name: '杭州市', level: 'A', region: '华东', manager: '赵磊' },
  { short: '武汉', name: '武汉市', level: 'A', region: '华中', manager: '孙丽' },
  { short: '南京', name: '南京市', level: 'A', region: '华东', manager: '周强' },
  { short: '西安', name: '西安市', level: 'B', region: '华北', manager: '吴敏' },
  { short: '重庆', name: '重庆市', level: 'A', region: '西南', manager: '郑华' },
]

const MERCHANT_TYPES = ['全国KA', '区域KA', '城市商家', '闪购', '医药商家']

const DATES = [
  '2025-01-01',
  '2025-01-02',
  '2025-01-03',
  '2025-01-04',
  '2025-01-05',
  '2025-01-06',
  '2025-01-07',
]

// ── 行生成函数 ────────────────────────────────────────────────────────────────

function generateRow(
  city: (typeof CITIES)[number],
  merchantType: string,
  date: string
): CityOverviewRow {
  // 基础业务数值（规模因城市等级调整）
  const scaleFactor = city.level === 'S' ? 3 : city.level === 'A' ? 1.5 : 1

  const revenueTotal = maybeNull(
    Math.round(randInt(100000, 5000000) * scaleFactor)
  )
  const costTotal = maybeNull(
    revenueTotal != null
      ? Math.round(revenueTotal * randFloat(0.7, 0.95))
      : randInt(80000, 4000000)
  )
  const grossProfit = maybeNull(
    revenueTotal != null && costTotal != null
      ? revenueTotal - costTotal
      : randInt(-200000, 1000000)
  )
  const grossProfitRate = maybeNull(
    grossProfit != null && revenueTotal != null && revenueTotal > 0
      ? randFloat(-15, 30)
      : null
  )

  const orderCountConsume = maybeNull(randInt(1000, 50000))
  const orderCountBill = maybeNull(
    orderCountConsume != null
      ? Math.round(orderCountConsume * randFloat(0.85, 1.0))
      : randInt(800, 45000)
  )
  const orderCountTn = maybeNull(
    orderCountBill != null
      ? Math.round(orderCountBill * randFloat(0.05, 0.25))
      : randInt(50, 5000)
  )
  const orderCountTnPlus = maybeNull(
    orderCountBill != null
      ? Math.round(orderCountBill * randFloat(0.01, 0.1))
      : randInt(10, 2000)
  )
  const orderCountTnRatio = maybeNull(randFloat(5, 25))
  const orderCountTnPlusRatio = maybeNull(randFloat(1, 10))

  const merchantCountTotal = maybeNull(randInt(50, 2000))
  const merchantCountFeeGt0 = maybeNull(
    merchantCountTotal != null
      ? Math.round(merchantCountTotal * randFloat(0.6, 0.95))
      : randInt(30, 1800)
  )
  const merchantCountProfitGte0 = maybeNull(
    merchantCountTotal != null
      ? Math.round(merchantCountTotal * randFloat(0.4, 0.8))
      : randInt(20, 1500)
  )
  const merchantCountProfitLt0 = maybeNull(
    merchantCountTotal != null && merchantCountProfitGte0 != null
      ? merchantCountTotal - merchantCountProfitGte0
      : randInt(10, 500)
  )
  const merchantRatioFeeGt0 = maybeNull(randFloat(60, 95))
  const merchantRatioProfitGte0 = maybeNull(randFloat(40, 80))
  const merchantRatioProfitLt0 = maybeNull(
    merchantRatioProfitGte0 != null
      ? Math.round((100 - merchantRatioProfitGte0) * 100) / 100
      : randFloat(20, 60)
  )
  const merchantCountGtv0Fee0 = maybeNull(
    merchantCountTotal != null
      ? Math.round(merchantCountTotal * randFloat(0.05, 0.2))
      : randInt(5, 200)
  )
  const merchantRatioGtv0Fee0 = maybeNull(randFloat(5, 20))
  const merchantCountGtv0FeeGt0 = maybeNull(
    merchantCountTotal != null
      ? Math.round(merchantCountTotal * randFloat(0.5, 0.85))
      : randInt(25, 1500)
  )
  const merchantCountGtvGt0Fee0 = maybeNull(
    merchantCountTotal != null
      ? Math.round(merchantCountTotal * randFloat(0.05, 0.2))
      : randInt(5, 200)
  )

  // 亏损毛利明细（通常为负数）
  const lossProfitTotal = maybeNull(-randInt(10000, 500000))
  const lossProfitProxy = maybeNull(
    lossProfitTotal != null
      ? Math.round(lossProfitTotal * randFloat(0.3, 0.5))
      : -randInt(5000, 200000)
  )
  const lossProfitRunner = maybeNull(
    lossProfitTotal != null
      ? Math.round(lossProfitTotal * randFloat(0.2, 0.4))
      : -randInt(3000, 150000)
  )
  const lossProfitMerchantDelivery = maybeNull(
    lossProfitTotal != null
      ? Math.round(lossProfitTotal * randFloat(0.1, 0.2))
      : -randInt(1000, 80000)
  )
  const lossProfitOther = maybeNull(-randInt(1000, 50000))

  // 服务费率差额分段（商家数，各段之和约等于 merchantCountTotal）
  const feeBase = merchantCountTotal ?? randInt(50, 2000)
  const feeRateDiffNegInfToNeg10 = maybeNull(Math.round(feeBase * randFloat(0.02, 0.08)))
  const feeRateDiffNeg10ToNeg5 = maybeNull(Math.round(feeBase * randFloat(0.05, 0.12)))
  const feeRateDiffNeg5ToNeg1 = maybeNull(Math.round(feeBase * randFloat(0.08, 0.15)))
  const feeRateDiffNeg1To0 = maybeNull(Math.round(feeBase * randFloat(0.05, 0.1)))
  const feeRateDiff0To5 = maybeNull(Math.round(feeBase * randFloat(0.15, 0.25)))
  const feeRateDiff5To10 = maybeNull(Math.round(feeBase * randFloat(0.1, 0.2)))
  const feeRateDiff10ToInf = maybeNull(Math.round(feeBase * randFloat(0.05, 0.15)))
  const feeRateDiffLt0Total = maybeNull(
    feeRateDiffNegInfToNeg10 != null &&
      feeRateDiffNeg10ToNeg5 != null &&
      feeRateDiffNeg5ToNeg1 != null &&
      feeRateDiffNeg1To0 != null
      ? feeRateDiffNegInfToNeg10 +
          feeRateDiffNeg10ToNeg5 +
          feeRateDiffNeg5ToNeg1 +
          feeRateDiffNeg1To0
      : Math.round(feeBase * randFloat(0.2, 0.45))
  )

  // 拼好饭保底收入分段
  const phfBase = merchantCountTotal ?? randInt(50, 2000)
  const phfDiffLt0Count = maybeNull(Math.round(phfBase * randFloat(0.05, 0.2)))
  const phfIncome0To3p5 = maybeNull(Math.round(phfBase * randFloat(0.1, 0.2)))
  const phfIncome3p5To4p0 = maybeNull(Math.round(phfBase * randFloat(0.1, 0.18)))
  const phfIncome4p0To4p5 = maybeNull(Math.round(phfBase * randFloat(0.12, 0.2)))
  const phfIncome4p5To5p0 = maybeNull(Math.round(phfBase * randFloat(0.1, 0.18)))
  const phfIncome5p0To6p0 = maybeNull(Math.round(phfBase * randFloat(0.08, 0.15)))
  const phfIncome6p0ToInf = maybeNull(Math.round(phfBase * randFloat(0.05, 0.12)))

  // 配送费差额
  const deliveryFeeDiffLt0Count = maybeNull(Math.round(feeBase * randFloat(0.1, 0.3)))

  // 合作商补贴分析
  const gtvB = maybeNull(randInt(50000, 2000000))
  const subsidyB = maybeNull(
    gtvB != null ? Math.round(gtvB * randFloat(0.03, 0.12)) : randInt(2000, 150000)
  )
  const subsidyRateB = maybeNull(randFloat(3, 12))
  const gtvC = maybeNull(randInt(30000, 1500000))
  const subsidyC = maybeNull(
    gtvC != null ? Math.round(gtvC * randFloat(0.02, 0.1)) : randInt(1000, 100000)
  )
  const subsidyRateC = maybeNull(randFloat(2, 10))

  // 合作商补贴率分段
  const partnerBase = merchantCountTotal ?? randInt(50, 2000)
  const partnerSubsidyRate0To5 = maybeNull(Math.round(partnerBase * randFloat(0.2, 0.35)))
  const partnerSubsidyRate5To7 = maybeNull(Math.round(partnerBase * randFloat(0.15, 0.25)))
  const partnerSubsidyRate7To10 = maybeNull(Math.round(partnerBase * randFloat(0.1, 0.2)))
  const partnerSubsidyRate10ToInf = maybeNull(Math.round(partnerBase * randFloat(0.05, 0.15)))

  // 商代比分段
  const ratioBase = merchantCountTotal ?? randInt(50, 2000)
  const merchantPartnerRatio0To1 = maybeNull(Math.round(ratioBase * randFloat(0.1, 0.2)))
  const merchantPartnerRatio1To2 = maybeNull(Math.round(ratioBase * randFloat(0.15, 0.25)))
  const merchantPartnerRatio2To3 = maybeNull(Math.round(ratioBase * randFloat(0.15, 0.25)))
  const merchantPartnerRatio3To4 = maybeNull(Math.round(ratioBase * randFloat(0.1, 0.2)))
  const merchantPartnerRatio4To5 = maybeNull(Math.round(ratioBase * randFloat(0.08, 0.15)))
  const merchantPartnerRatio5ToInf = maybeNull(Math.round(ratioBase * randFloat(0.05, 0.12)))

  // 商家原因异常单
  const abnormalTotal = maybeNull(randInt(10, 500))
  const abnormalNoAccept = maybeNull(
    abnormalTotal != null ? Math.round(abnormalTotal * randFloat(0.1, 0.25)) : randInt(1, 80)
  )
  const abnormalReject = maybeNull(
    abnormalTotal != null ? Math.round(abnormalTotal * randFloat(0.05, 0.15)) : randInt(1, 50)
  )
  const abnormalCancelNoNotify = maybeNull(
    abnormalTotal != null ? Math.round(abnormalTotal * randFloat(0.05, 0.15)) : randInt(1, 50)
  )
  const abnormalStatus = maybeNull(
    abnormalTotal != null ? Math.round(abnormalTotal * randFloat(0.05, 0.12)) : randInt(1, 40)
  )
  const abnormalDelay = maybeNull(
    abnormalTotal != null ? Math.round(abnormalTotal * randFloat(0.1, 0.2)) : randInt(1, 60)
  )
  const abnormalWrongMeal = maybeNull(
    abnormalTotal != null ? Math.round(abnormalTotal * randFloat(0.05, 0.12)) : randInt(1, 40)
  )
  const abnormalComplaint = maybeNull(
    abnormalTotal != null ? Math.round(abnormalTotal * randFloat(0.08, 0.18)) : randInt(1, 60)
  )
  const abnormalBadReview = maybeNull(
    abnormalTotal != null ? Math.round(abnormalTotal * randFloat(0.1, 0.2)) : randInt(1, 70)
  )

  return {
    // A-G 基础维度
    report_date: date,
    city_short_name: city.short,
    city_name: city.name,
    city_level: maybeNull(city.level),
    region: maybeNull(city.region, 0.05),
    manager: maybeNull(city.manager, 0.05),
    merchant_type_group: merchantType,

    // H-K 线上盈亏
    revenue_total: revenueTotal,
    cost_total: costTotal,
    gross_profit: grossProfit,
    gross_profit_rate: grossProfitRate,

    // L-Q 订单量与跨期分析
    order_count_consume: orderCountConsume,
    order_count_bill: orderCountBill,
    order_count_tn: orderCountTn,
    order_count_tn_plus: orderCountTnPlus,
    order_count_tn_ratio: orderCountTnRatio,
    order_count_tn_plus_ratio: orderCountTnPlusRatio,

    // R-AB 交易商家健康度
    merchant_count_total: merchantCountTotal,
    merchant_count_fee_gt0: merchantCountFeeGt0,
    merchant_count_profit_gte0: merchantCountProfitGte0,
    merchant_count_profit_lt0: merchantCountProfitLt0,
    merchant_ratio_fee_gt0: merchantRatioFeeGt0,
    merchant_ratio_profit_gte0: merchantRatioProfitGte0,
    merchant_ratio_profit_lt0: merchantRatioProfitLt0,
    merchant_count_gtv0_fee0: merchantCountGtv0Fee0,
    merchant_ratio_gtv0_fee0: merchantRatioGtv0Fee0,
    merchant_count_gtv0_fee_gt0: merchantCountGtv0FeeGt0,
    merchant_count_gtv_gt0_fee0: merchantCountGtvGt0Fee0,

    // AC-AG 亏损毛利明细
    loss_profit_total: lossProfitTotal,
    loss_profit_proxy: lossProfitProxy,
    loss_profit_runner: lossProfitRunner,
    loss_profit_merchant_delivery: lossProfitMerchantDelivery,
    loss_profit_other: lossProfitOther,

    // AH-AO 服务费率差额分段
    fee_rate_diff_neg_inf_to_neg10: feeRateDiffNegInfToNeg10,
    fee_rate_diff_neg10_to_neg5: feeRateDiffNeg10ToNeg5,
    fee_rate_diff_neg5_to_neg1: feeRateDiffNeg5ToNeg1,
    fee_rate_diff_neg1_to_0: feeRateDiffNeg1To0,
    fee_rate_diff_0_to_5: feeRateDiff0To5,
    fee_rate_diff_5_to_10: feeRateDiff5To10,
    fee_rate_diff_10_to_inf: feeRateDiff10ToInf,
    fee_rate_diff_lt0_total: feeRateDiffLt0Total,

    // AP-AV 拼好饭保底收入分段
    phf_diff_lt0_count: phfDiffLt0Count,
    phf_income_0_to_3p5: phfIncome0To3p5,
    phf_income_3p5_to_4p0: phfIncome3p5To4p0,
    phf_income_4p0_to_4p5: phfIncome4p0To4p5,
    phf_income_4p5_to_5p0: phfIncome4p5To5p0,
    phf_income_5p0_to_6p0: phfIncome5p0To6p0,
    phf_income_6p0_to_inf: phfIncome6p0ToInf,

    // AW 配送费差额
    delivery_fee_diff_lt0_count: deliveryFeeDiffLt0Count,

    // AX-BC 合作商补贴分析
    gtv_b: gtvB,
    subsidy_b: subsidyB,
    subsidy_rate_b: subsidyRateB,
    gtv_c: gtvC,
    subsidy_c: subsidyC,
    subsidy_rate_c: subsidyRateC,

    // BD-BG 合作商补贴率分段
    partner_subsidy_rate_0_to_5: partnerSubsidyRate0To5,
    partner_subsidy_rate_5_to_7: partnerSubsidyRate5To7,
    partner_subsidy_rate_7_to_10: partnerSubsidyRate7To10,
    partner_subsidy_rate_10_to_inf: partnerSubsidyRate10ToInf,

    // BH-BM 商代比分段
    merchant_partner_ratio_0_to_1: merchantPartnerRatio0To1,
    merchant_partner_ratio_1_to_2: merchantPartnerRatio1To2,
    merchant_partner_ratio_2_to_3: merchantPartnerRatio2To3,
    merchant_partner_ratio_3_to_4: merchantPartnerRatio3To4,
    merchant_partner_ratio_4_to_5: merchantPartnerRatio4To5,
    merchant_partner_ratio_5_to_inf: merchantPartnerRatio5ToInf,

    // BN-BV 商家原因异常单
    abnormal_order_total: abnormalTotal,
    abnormal_no_accept: abnormalNoAccept,
    abnormal_reject: abnormalReject,
    abnormal_cancel_no_notify: abnormalCancelNoNotify,
    abnormal_status: abnormalStatus,
    abnormal_delay: abnormalDelay,
    abnormal_wrong_meal: abnormalWrongMeal,
    abnormal_complaint: abnormalComplaint,
    abnormal_bad_review: abnormalBadReview,
  }
}

// ── 生成 Mock 数据 ────────────────────────────────────────────────────────────
// 策略：10 城市 × 5 商家类型 × 部分日期 = 100+ 行，取前 70 行确保 ≥ 50 条

const _allRows: CityOverviewRow[] = []

// 每个城市 × 每种商家类型，各取 1 个日期（共 50 行）
CITIES.forEach((city, cityIdx) => {
  MERCHANT_TYPES.forEach((merchantType, typeIdx) => {
    // 轮流分配日期，保证日期分布均匀
    const date = DATES[(cityIdx * MERCHANT_TYPES.length + typeIdx) % DATES.length]
    _allRows.push(generateRow(city, merchantType, date))
  })
})

// 再补充 20 行：S 级城市（北京、上海、广州、深圳）多日期数据，增加数据密度
const sCities = CITIES.filter((c) => c.level === 'S')
sCities.forEach((city) => {
  // 每个 S 级城市额外补充 5 行（不同日期 + 不同商家类型）
  DATES.slice(0, 5).forEach((date, i) => {
    const merchantType = MERCHANT_TYPES[i % MERCHANT_TYPES.length]
    _allRows.push(generateRow(city, merchantType, date))
  })
})

/**
 * 城市维度-外卖整体分析 Mock 数据
 *
 * - 共 70 条记录（50 基础 + 20 S 级城市补充）
 * - 覆盖 10 个城市、5 种商家类型、2025-01-01 至 2025-01-07 日期范围
 * - 约 10% 的数值字段为 null，模拟真实数据缺失场景
 */
export const mockCityOverviewData: CityOverviewRow[] = _allRows
