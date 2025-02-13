import React, { forwardRef } from "react"
import MasterCardPill from "./mastercardPill"
import { getMasterCardBackground } from "./mixins/background"
import { MasterCardContainer } from "./styled"

const minWidths = {
  default: "22px",
  large: "37px",
}

const MasterCard = forwardRef(
  (
    {
      children,
      "data-testid": testId = "mastercard",
      height,
      normal,
      onClick,
      pillLeft = {},
      pillRight = {},
      pillEnd,
      round,
      size,
      zIndex,
      ...rest
    },
    ref
  ) => {
    const commonProps = { height, round, size }
    const pillProps = { normal, ...commonProps, ...rest }

    const pillRightBackground = getMasterCardBackground(
      pillRight.background,
      pillRight.flavour || "disabledWarning"
    )
    const pillEndBackground =
      pillEnd && getMasterCardBackground(pillEnd.background, pillEnd.flavour || "disabledClear")

    const pillLeftProps = {
      background: getMasterCardBackground(pillLeft.background, pillLeft.flavour || "disabledError"),
      padding: [0, 3],
      position: "relative",
      width: { min: minWidths[rest.size] || minWidths.default },
      ...pillProps,
      ...pillLeft,
      round: "12px",
      zIndex: 3,
    }
    const pillRightProps = {
      background: pillRightBackground,
      margin: [0, 0, 0, -1.5],
      padding: [0, 2],
      width: { min: minWidths[rest.size] || minWidths.default },
      ...pillProps,
      ...pillRight,
      round: "0 12px 12px 0",
      zIndex: 2,
    }
    const pillEndProps = pillEnd && {
      background: pillEndBackground,
      margin: [0, 0, 0, -1.5],
      padding: [0, 2],
      width: { min: minWidths[rest.size] || minWidths.default },
      ...pillProps,
      ...pillEnd,
      round: "0 12px 12px 0",
      zIndex: 1,
    }

    return (
      <MasterCardContainer data-testid={testId} onClick={onClick} ref={ref} {...commonProps}>
        {children || (
          <>
            <MasterCardPill data-testid={`${testId}-left-pill`} {...pillLeftProps} />
            <MasterCardPill data-testid={`${testId}-right-pill`} {...pillRightProps} />
            {pillEndProps && (
              <MasterCardPill data-testid={`${testId}-end-pill`} {...pillEndProps} />
            )}
          </>
        )}
      </MasterCardContainer>
    )
  }
)

export default MasterCard
