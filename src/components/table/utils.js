import { pipe, sort, concat, map, path } from "ramda"

export const defaultGroupByFn = (rows, columnId) => {
  const result = rows.reduce((prev, row) => {
    const resKey = `${row.values[columnId]}`
    prev[resKey] = Array.isArray(prev[resKey]) ? prev[resKey] : []
    prev[resKey].push(row)
    return prev
  }, {})
  return result
}

const lowestPriority = 999999

const sortByPriority = (a, b) => a.priority - b.priority

const getPriority = (groupsOrderSettings, groupByID, groupValue) =>
  path(["groupsOrder", groupByID, groupValue], groupsOrderSettings) ||
  path(["prioritySettings", "unprioritizedGroupsPlacement"], groupsOrderSettings) ||
  lowestPriority

export const sortGroupsByPriority = (groups, groupsOrderSettings) =>
  pipe(
    rows => rows.filter(row => row.subRows.length),
    map(group => ({
      ...group,
      priority:
        group.priority || getPriority(groupsOrderSettings, group.groupByID, group.groupByVal),
    })),
    sort(sortByPriority)
  )(groups)

export const unwrapGroupedRows = groups =>
  groups.reduce((acc, current) => {
    const { subRows, ...restRowProps } = current
    if (subRows.length > 0) {
      acc.push({ subRows: [], isVirtualGroupHeader: true, ...restRowProps })
      return concat(acc, subRows)
    }
    acc.push(current)
    return acc
  }, [])

export const generateRowStyle = ({ index, style, rows, verticalGutter }) => {
  const prevRow = index !== 0 ? rows[index - 1] : {}
  const currentRow = rows[index]

  const noGutter = currentRow.isVirtualGroupHeader || prevRow.isVirtualGroupHeader

  const top = noGutter ? style.top : style.top + verticalGutter
  const height = noGutter ? style.height : style.height - verticalGutter

  return {
    ...style,
    top,
    height,
  }
}

export const getValidRows = ({ selectedFlatRows, isGrouped, itemIsDisabled }) =>
  selectedFlatRows.reduce((acc, row) => {
    if (isGrouped && row.isGrouped) return acc
    if (itemIsDisabled(row.original)) return acc
    acc.push(row.original)
    return acc
  }, [])

export const getGroupedCells = cells => cells.reduce((accumulator, cell) => {
  if (cell.column.InnerRow) {
    return {
      ...accumulator,
      [cell.column.id]: {
        ...(Object.prototype.hasOwnProperty.call(accumulator, cell.column.id) && accumulator[cell.column.id]),
        parentRow: cell
      }
    }
  }

  if (cell.column.parentRow) {
    return {
      ...accumulator,
      [cell.column.parentRow]: {
        ...(Object.prototype.hasOwnProperty.call(accumulator, cell.column.parentRow) && accumulator[cell.column.parentRow]),
        children: Object.prototype.hasOwnProperty.call(accumulator[cell.column.parentRow], "children")
          ? [...accumulator[cell.column.parentRow].children, cell]
          : [cell]
      }
    }
  }

  return accumulator
}, {})
