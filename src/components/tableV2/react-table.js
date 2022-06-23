//This is the original adapter of @tanstack/react-table because we were getting error during instalion
//we paste the code directly here.

import * as React from "react"
export * from "@tanstack/table-core"

import { createTableInstance, createTableFactory } from "@tanstack/table-core"

function isExoticComponent(component) {
  return (
    typeof component === "object" &&
    typeof component.$$typeof === "symbol" &&
    ["react.memo", "react.forward_ref"].includes(component.$$typeof.description)
  )
}

function isClassComponent(component) {
  return (
    typeof component === "function" &&
    (() => {
      const proto = Object.getPrototypeOf(component)
      return proto.prototype && proto.prototype.isReactComponent
    })()
  )
}

function isReactComponent(component) {
  return (
    isClassComponent(component) || typeof component === "function" || isExoticComponent(component)
  )
}

export const render = (Comp, props) =>
  !Comp ? null : isReactComponent(Comp) ? <Comp {...props} /> : Comp

export const createTable = createTableFactory({ render })

export function useTableInstance(table, options) {
  const resolvedOptions = {
    ...table.options,
    state: {}, // Dummy state
    onStateChange: () => {}, // noop
    render,
    renderFallbackValue: null,
    ...options,
  }

  // Create a new table instance and store it in state
  const [instanceRef] = React.useState(() => ({
    current: createTableInstance(resolvedOptions),
  }))

  // By default, manage table state here using the instance's initial state
  const [state, setState] = React.useState(() => instanceRef.current.initialState)

  // Compose the default state above with any user state. This will allow the user
  // to only control a subset of the state if desired.
  instanceRef.current.setOptions(prev => ({
    ...prev,
    ...options,
    state: {
      ...state,
      ...options.state,
    },
    // Similarly, we'll maintain both our internal state and any user-provided
    // state.
    onStateChange: updater => {
      setState(updater)
      options.onStateChange?.(updater)
    },
  }))

  return instanceRef.current
}
