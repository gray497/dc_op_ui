import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'

export function MerchantFee() {
  return (
    <>
      <Header />
      <Main>
        <h1 className='text-2xl font-bold tracking-tight'>
          商家维度-外卖商家费率&PHF&配送费
        </h1>
        <p className='text-muted-foreground'>正在建设中...</p>
      </Main>
    </>
  )
}
