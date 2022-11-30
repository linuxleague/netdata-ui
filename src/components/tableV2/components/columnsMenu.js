import React from "react"
import Drop from "src/components/drops/drop/index.js"
import Flex from "src/components/templates/flex"
import { Text } from "src/components/typography"
import ColumnsMenuItem from "src/components/tableV2/components/columnsMenuItem"

const ColumnsMenu = ({ parentRef, isOpen, columns, onClose, pinnedColumns }) => {
  if (parentRef.current && isOpen)
    return (
      <Drop
        background="dropdown"
        height={{ max: "100vh" }}
        onClickOutside={onClose}
        overflow={{ vertical: "auto" }}
        round={1}
        target={parentRef.current}
        width={50}
      >
        <Flex
          border={{
            size: "1px",
            type: "solid",
            side: "bottom",
            color: "borderSecondary",
          }}
          padding={[3, 3, 1]}
        >
          <Text color="textLite">Edit columns</Text>
        </Flex>

        <Flex column padding={[1, 3]}>
          {pinnedColumns.length ? (
            <Flex
              border={{
                size: "1px",
                type: "solid",
                side: "bottom",
                color: "borderSecondary",
              }}
              column
            >
              {pinnedColumns.map(pinnedColumn => (
                <ColumnsMenuItem column={pinnedColumn} disabled key={pinnedColumn.id} />
              ))}
            </Flex>
          ) : null}
          {columns.map(column => (
            <ColumnsMenuItem column={column} key={column.id} />
          ))}
        </Flex>
      </Drop>
    )

  return null
}

export default ColumnsMenu
