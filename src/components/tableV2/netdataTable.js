//TODO ADD CONFIRMATION DIALOG COMPONENT
import React, { useMemo, useState, useEffect } from "react"

import Table, { Pagination } from "./base-table"

import {
  createTable,
  useTableInstance,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
} from "./react-table.js"

import { Icon } from "src/components/icon"
import Box from "src/components/templates/box"
import Flex from "src/components/templates/flex"

import SearchInput from "src/components/search"
import { Checkbox } from "src/components/checkbox"

const supportedActions = {
  delete: { icon: "trashcan", confirmation: false },
  info: { icon: "information", confirmation: false },
}

const table = createTable()

const NetdataTable = ({
  dataColumns,
  data,
  onRowSelected,
  onGlobalSearchChange,
  enableSelection,
  globalFilterFn,
  tableRef,
  enableSorting,
  actions = {},
  enablePagination,
  setPagination,
  pagination,
}) => {
  const [sorting, setSorting] = useState([])
  const [rowSelection, setRowSelection] = useState({})
  const [globalFilter, setGlobalFilter] = useState("")

  const availableActions = Object.keys(actions).reduce((acc, currentActionKey) => {
    const isActionSupported = supportedActions[currentActionKey]
    if (!isActionSupported) return []
    const { icon, confirmation } = supportedActions[currentActionKey]
    const currentAction = actions[currentActionKey]
    acc.push({ confirmation, icon, id: currentActionKey, ...currentAction })
    return acc
  }, [])

  const makeDataColumns = useMemo(() => {
    if (!dataColumns || dataColumns.length < 1) return []
    return dataColumns.map(
      (
        {
          header,
          id,
          cell,
          enableFilter = false,
          isPlaceholder,
          filterFn,
          enableGlobalFilter = true,
        },
        index
      ) => {
        if (!id) throw new Error(`Please provide id  at ${index}`)

        return table.createDataColumn(id, {
          ...(cell && { cell: typeof cell === "function" ? props => cell(props) : cell }),
          ...(header && { header: typeof header === "function" ? () => header() : header }),
          ...(filterFn ? { filterFn } : {}),
          footer: props => props.column.id,
          enableColumnFilter: enableFilter,
          enableGlobalFilter,
          isPlaceholder,
        })
      }
    )
  }, [dataColumns])

  const makeSelectionColumn = enableSelection ? [renderCheckBox()] : []
  const makeActionsColumn =
    availableActions.length > 0 ? [renderActions({ actions: availableActions })] : []

  const handleGlobalSearch = value => {
    onGlobalSearchChange?.(value)
    setGlobalFilter(String(value))
  }

  const instance = useTableInstance(table, {
    columns: [...makeSelectionColumn, ...makeDataColumns, ...makeActionsColumn],
    data: data,
    state: {
      rowSelection,
      globalFilter,
      sorting,
      pagination,
    },
    ...(globalFilterFn ? { globalFilterFn } : {}),
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: handleGlobalSearch,
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
  })

  useEffect(() => {
    const { rows } = instance.getSelectedRowModel()
    if (rows) {
      const selectedRows = rows.reduce((acc, { original }) => {
        acc.push(original)
        return acc
      }, [])
      onRowSelected?.(selectedRows)
    }
  }, [rowSelection, instance])

  const headers = instance.getFlatHeaders()

  return (
    <Table
      Pagination={enablePagination && renderPagination({ instance })}
      handleSearch={onGlobalSearchChange ? handleGlobalSearch : null}
      ref={tableRef}
    >
      <Table.Head>
        <Table.HeadRow>{renderHeadCell({ headers, enableSorting })}</Table.HeadRow>
      </Table.Head>
      <Table.Body>
        {instance.getRowModel().rows.map(row => (
          <Table.Row key={row.id}>
            {row.getVisibleCells().map(cell => (
              <Table.Cell key={cell.id}>{cell.renderCell()}</Table.Cell>
            ))}
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  )
}

const renderHeadCell = ({ headers, enableSorting }) => {
  const HeadCell = headers.map(({ id, colSpan, renderHeader, isPlaceholder, column }) => (
    <Table.HeadCell colSpan={colSpan} key={id}>
      {isPlaceholder ? null : renderHeader()}
      {column.getCanFilter() ? (
        <div>
          <Filter column={column} />
        </div>
      ) : null}
    </Table.HeadCell>
  ))

  const SortingHeadCell = headers.map(({ id, colSpan, renderHeader, isPlaceholder, column }) => (
    <Table.SortingHeadCell
      sortDirection={column.getIsSorted()}
      onSortClicked={column.getToggleSortingHandler()}
      colSpan={colSpan}
      key={id}
    >
      {isPlaceholder ? null : renderHeader()}
      {column.getCanFilter() ? (
        <div>
          <Filter column={column} />
        </div>
      ) : null}
    </Table.SortingHeadCell>
  ))

  return enableSorting ? SortingHeadCell : HeadCell
}

const renderPagination = ({ instance }) => {
  const { nextPage, previousPage, getCanPreviousPage, getCanNextPage, getPageCount } = instance
  const pageSize = instance.getState().pagination.pageSize
  const pageIndex = instance.getState().pagination.pageIndex

  return (
    <Pagination
      pageCount={getPageCount()}
      hasNext={getCanNextPage()}
      hasPrevious={getCanPreviousPage()}
      onNextPage={nextPage}
      onPreviousPage={previousPage}
      pageSize={pageSize}
      pageIndex={pageIndex}
    />
  )
}

const renderActions = ({ actions }) => {
  return table.createDataColumn("actions", {
    header: () => {
      return "Actions"
    },
    cell: ({ row }) => {
      return (
        <Flex data-testId="action-cell" height="100%" gap={2}>
          {actions.map(({ id, icon, handleAction }) => (
            <Flex
              alignItems="center"
              justifyContent="center"
              height={"100%"}
              _hover={{ background: "borderSecondary" }}
              cursor="pointer"
              key={id}
              width={10}
              onClick={() => handleAction(row.original)}
            >
              <Box as={Icon} name={icon} />
            </Flex>
          ))}
        </Flex>
      )
    },
    enableColumnFilter: false,
  })
}

const renderCheckBox = () => {
  return table.createDataColumn("checkbox", {
    header: ({ instance }) => {
      return (
        <ColumnCheckbox
          checked={instance.getIsAllRowsSelected()}
          indeterminate={instance.getIsSomeRowsSelected()}
          onChange={instance.getToggleAllRowsSelectedHandler()}
        />
      )
    },
    cell: ({ row }) => {
      return (
        <ColumnCheckbox
          checked={row.getIsSelected()}
          indeterminate={row.getIsSomeSelected()}
          onChange={row.getToggleSelectedHandler()}
        />
      )
    },
    enableColumnFilter: false,
  })
}

const Filter = ({ column }) => {
  const columnFilterValue = column.getFilterValue()
  return (
    <Box
      as={SearchInput}
      width={{ max: 50 }}
      value={columnFilterValue ?? ""}
      placeholder={"...Search"}
      iconRight={<Icon name="magnify" />}
      onChange={e => column.setFilterValue(e.target.value)}
    ></Box>
  )
}

const ColumnCheckbox = ({ checked, indeterminate, onChange }) => {
  return <Checkbox checked={checked} indeterminate={indeterminate} onChange={onChange} />
}

export default NetdataTable
