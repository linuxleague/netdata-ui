import React, { useMemo, useState, useEffect } from "react"

import Table from "./base-table"

import {
  createTable,
  useTableInstance,
  getCoreRowModel,
  getFilteredRowModel,
} from "./react-table.js"

import { Icon } from "src/components/icon"
import Box from "src/components/templates/box"

import SearchInput from "src/components/search"
import { Checkbox } from "src/components/checkbox"

const table = createTable()

const NetdataTable = ({
  dataColumns,
  data,
  onRowSelected,
  handleGlobalSearch,
  globalFilter,
  tableRef,
}) => {
  const [rowSelection, setRowSelection] = useState({})

  const makeDataColumns = useMemo(() => {
    if (!dataColumns || dataColumns.length < 1) return []
    return dataColumns.map(({ header, id, cell, enableFilter = false, isPlaceholder }, index) => {
      if (!id) throw new Error(`Please provide id  at ${index}`)
      const isCheckbox = id === "checkbox"

      if (isCheckbox) {
        return renderCheckBox()
      }

      return table.createDataColumn(id, {
        ...(cell && { cell: typeof cell === "function" ? props => cell(props) : cell }),
        ...(header && { header: typeof header === "function" ? () => header() : header }),
        footer: props => props.column.id,
        enableColumnFilter: enableFilter,
        enableGlobalFilter: true,
        isPlaceholder,
      })
    })
  }, [dataColumns])

  const instance = useTableInstance(table, {
    columns: makeDataColumns,
    data: data,
    state: {
      rowSelection,
      globalFilter,
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: handleGlobalSearch,
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
    <Table handleSearch={handleGlobalSearch} ref={tableRef}>
      <Table.Head>
        <Table.HeadRow>
          {headers.map(({ id, colSpan, renderHeader, isPlaceholder, column }) => (
            <Table.HeadCell colSpan={colSpan} key={id}>
              {isPlaceholder ? null : renderHeader()}
              {column.getCanFilter() ? (
                <div>
                  <Filter column={column} />
                </div>
              ) : null}
            </Table.HeadCell>
          ))}
        </Table.HeadRow>
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
