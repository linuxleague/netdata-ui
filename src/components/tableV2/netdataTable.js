//TODO refactor bulk action and row action to single function to decrease repeatability
import React, { useEffect, useState, useCallback, useRef } from "react"
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import Flex from "src/components/templates/flex"
import { comparison, select, includesString } from "./helpers/filterFns"
import useColumns from "./features/useColumns"
import makePagination from "./features/pagination"
import useBulkActions from "./features/useBulkActions"
import ColumnPinning from "./features/columnPinning"
import GlobalControls from "./features/globalControls"

import MainTable from "./features/mainTable"

const noop = () => {}

const filterFns = {
  comparison,
  select,
}

const NetdataTable = ({
  bulkActions,
  columnPinning: defaultColumnPinning,
  columnVisibility: defaultColumnVisibility,
  data,
  dataColumns,
  dataGa,
  disableClickRow,
  enableColumnPinning = false,
  enableColumnVisibility = false,
  enablePagination,
  enableResize = false,
  enableSelection,
  enableSorting,
  globalFilter: initialGlobalFilter = "",
  globalFilterFn = includesString,
  onClickRow,
  onColumnVisibilityChange = noop,
  onGlobalSearchChange,
  onHoverRow,
  onRowSelected,
  onSortingChange = noop,
  paginationOptions = {
    pageIndex: 0,
    pageSize: 100,
  },
  rowActions = {},
  sortBy,
  tableRef,
  testPrefix = "",
  testPrefixCallback,
  virtualizeOptions = {},
  ...rest
}) => {
  const [columnVisibility, setColumnVisibility] = useState(defaultColumnVisibility)

  useEffect(() => {
    if (columnVisibility === defaultColumnVisibility) return

    setColumnVisibility(defaultColumnVisibility)
  }, [defaultColumnVisibility])

  const [columnPinning, setColumnPinning] = useState(() => defaultColumnPinning || {})

  useEffect(() => {
    if (!defaultColumnPinning || columnVisibility === defaultColumnPinning) return

    setColumnPinning(defaultColumnPinning)
  }, [defaultColumnPinning])

  const [rowSelection, setRowSelection] = useState({})

  const [sorting, setSorting] = useState(() => sortBy || [])

  useEffect(() => {
    if (!sortBy || sorting === sortBy) return

    setSorting(sortBy)
  }, [sortBy])

  const onShorting = useCallback(getSorting => {
    onSortingChange(getSorting)
    setSorting(getSorting)
  }, [])

  const [pagination, setPagination] = useState(() => ({
    pageIndex: paginationOptions.pageIndex,
    pageSize: paginationOptions.pageSize,
  }))

  const handleColumnVisibilityChange = useCallback(getVisibility => {
    onColumnVisibilityChange(getVisibility)
    setColumnVisibility(getVisibility)
  }, [])

  const [globalFilter, setGlobalFilter] = useState(initialGlobalFilter)

  useEffect(() => {
    if (!initialGlobalFilter || globalFilter === initialGlobalFilter) return

    setGlobalFilter(initialGlobalFilter)
  }, [sortBy])

  const onGlobalFilterChange = useCallback(value => {
    onGlobalSearchChange?.(value)
    setGlobalFilter(String(value))
  }, [])

  const columns = useColumns(dataColumns, { testPrefix, enableSelection, rowActions })

  const table = useReactTable({
    columns,
    data,
    manualPagination: !enablePagination,
    columnResizeMode: enableResize ? "onEnd" : "",
    filterFns,
    state: {
      columnVisibility,
      rowSelection,
      globalFilter,
      sorting,
      pagination,
      columnPinning,
    },
    ...(globalFilterFn ? { globalFilterFn } : {}),
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange,
    onSortingChange: onShorting,
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    onColumnVisibilityChange: handleColumnVisibilityChange,
    onColumnPinningChange: setColumnPinning,
  })

  const [selectedRows, setActualSelectedRows] = useState([])

  useEffect(() => {
    const { rows } = table.getSelectedRowModel()
    if (rows) {
      const selectedRows = rows.reduce((acc, { original }) => {
        if (original?.disabled) return acc

        acc.push(original)
        return acc
      }, [])
      setActualSelectedRows(selectedRows)
      onRowSelected?.(selectedRows)
    }
  }, [rowSelection, table])

  const hasBulkActions = enableColumnPinning || enableColumnVisibility || !!bulkActions
  const scrollParentRef = useRef()

  const actions = useBulkActions({
    bulkActions,
    columnPinning,
    enableColumnVisibility,
    enableColumnPinning,
    selectedRows,
    table,
    testPrefix,
  })

  return (
    <Flex height="100%" overflow="hidden" width="100%" column>
      {onGlobalSearchChange || hasBulkActions ? (
        <GlobalControls
          bulkActions={actions}
          dataGa={dataGa}
          handleSearch={onGlobalSearchChange ? onGlobalFilterChange : null}
          searchValue={globalFilter}
        />
      ) : null}
      <Flex ref={scrollParentRef} overflow="auto" width="100%" height="100%">
        {enableColumnPinning && (
          <ColumnPinning
            enableResize={enableResize}
            disableClickRow={disableClickRow}
            onClickRow={onClickRow}
            testPrefixCallback={testPrefixCallback}
            enableSorting={enableSorting}
            table={table}
            headers={table.getLeftFlatHeaders()}
            testPrefix={testPrefix}
            dataGa={dataGa}
            onHoverRow={onHoverRow}
            scrollParentRef={scrollParentRef}
            virtualizeOptions={virtualizeOptions}
          />
        )}
        <MainTable
          scrollParentRef={scrollParentRef}
          enableResize={enableResize}
          disableClickRow={disableClickRow}
          onClickRow={onClickRow}
          testPrefixCallback={testPrefixCallback}
          enableSorting={enableSorting}
          enableColumnPinning={enableColumnPinning}
          table={table}
          dataGa={dataGa}
          tableRef={tableRef}
          testPrefix={testPrefix}
          onHoverRow={onHoverRow}
          virtualizeOptions={virtualizeOptions}
          {...rest}
        />
      </Flex>
      {enablePagination && makePagination({ table })}
    </Flex>
  )
}

export default NetdataTable
