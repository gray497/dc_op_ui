import { DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu'
import { MixerHorizontalIcon } from '@radix-ui/react-icons'
import { type Column, type Table } from '@tanstack/react-table'
import * as React from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'

// ── 工具：从 columnDef.header 提取可读标签 ────────────────────────────────────

/**
 * 尝试从列定义的 header 字段提取纯文本标签。
 * - 字符串 header → 直接返回
 * - 函数 header → 调用后读取返回的 React element 的 props.title
 * - 兜底 → 返回 column.id
 */
function getColumnLabel<TData>(column: Column<TData>): string {
  const headerDef = column.columnDef.header

  if (typeof headerDef === 'string') {
    return headerDef
  }

  if (typeof headerDef === 'function') {
    try {
      // 传入最小化的假 context，只需要 column 引用
      const result = headerDef({ column } as Parameters<typeof headerDef>[0])
      if (React.isValidElement(result)) {
        // DataTableColumnHeader / HeaderWithTooltip 都有 title prop
        const props = result.props as Record<string, unknown>
        if (typeof props.title === 'string') return props.title
        // 如果是纯文本子节点
        if (typeof props.children === 'string') return props.children
      }
    } catch {
      // 忽略渲染错误，兜底用 id
    }
  }

  return column.id
}

// ── 类型 ──────────────────────────────────────────────────────────────────────

type DataTableViewOptionsProps<TData> = {
  table: Table<TData>
}

// ── 组件 ──────────────────────────────────────────────────────────────────────

export function DataTableViewOptions<TData>({
  table,
}: DataTableViewOptionsProps<TData>) {
  // 收集所有可隐藏的叶子列
  const hideableLeafColumns = table
    .getAllLeafColumns()
    .filter((col) => col.getCanHide())

  // 按父分组聚合：{ groupLabel, groupColumn | null, leafColumns[] }
  type Group = {
    label: string
    groupColumn: Column<TData> | null
    leaves: Column<TData>[]
  }

  const groups: Group[] = []
  const groupMap = new Map<string, Group>()

  for (const col of hideableLeafColumns) {
    const parent = col.parent as Column<TData> | undefined

    if (parent) {
      let group = groupMap.get(parent.id)
      if (!group) {
        const label =
          typeof parent.columnDef.header === 'string'
            ? parent.columnDef.header
            : parent.id
        group = { label, groupColumn: parent, leaves: [] }
        groupMap.set(parent.id, group)
        groups.push(group)
      }
      group.leaves.push(col)
    } else {
      // 无父分组的列单独成组
      groups.push({ label: getColumnLabel(col), groupColumn: null, leaves: [col] })
    }
  }

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant='outline'
          size='sm'
          className='ms-auto hidden h-8 lg:flex'
        >
          <MixerHorizontalIcon className='size-4' />
          视图
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align='end'
        className='max-h-[70vh] w-52 overflow-y-auto'
      >
        <DropdownMenuLabel>切换列</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {groups.map((group, gi) => {
          // 分组有多个叶子列时，渲染分组标题行（带全选/全不选）
          const isMultiLeaf = group.leaves.length > 1
          const allVisible = group.leaves.every((c) => c.getIsVisible())
          const someVisible = group.leaves.some((c) => c.getIsVisible())

          return (
            <React.Fragment key={group.groupColumn?.id ?? `solo-${gi}`}>
              {gi > 0 && <DropdownMenuSeparator />}

              {isMultiLeaf && (
                <DropdownMenuCheckboxItem
                  className='font-medium text-muted-foreground'
                  checked={allVisible ? true : someVisible ? 'indeterminate' : false}
                  onCheckedChange={(value) => {
                    group.leaves.forEach((c) => c.toggleVisibility(!!value))
                  }}
                >
                  {group.label}
                </DropdownMenuCheckboxItem>
              )}

              {group.leaves.map((col) => (
                <DropdownMenuCheckboxItem
                  key={col.id}
                  className={isMultiLeaf ? 'pl-6' : ''}
                  checked={col.getIsVisible()}
                  onCheckedChange={(value) => col.toggleVisibility(!!value)}
                >
                  {getColumnLabel(col)}
                </DropdownMenuCheckboxItem>
              ))}
            </React.Fragment>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
