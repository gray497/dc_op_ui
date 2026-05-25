import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'

export function DataDownload() {
  return (
    <>
      <Header />
      <Main>
        <h1 className='text-2xl font-bold tracking-tight'>
          报表数据下载（自助提数工具）
        </h1>
        <p className='text-muted-foreground'>正在建设中...</p>
      </Main>
    </>
  )
}
