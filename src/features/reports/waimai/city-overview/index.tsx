import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'

export function CityOverview() {
  return (
    <>
      <Header />
      <Main>
        <h1 className='text-2xl font-bold tracking-tight'>
          城市维度-外卖整体分析
        </h1>
        <p className='text-muted-foreground'>正在建设中...</p>
      </Main>
    </>
  )
}
