import React, { useState } from "react"
import { Button, IconButton, ButtonGroup } from "."
import { iconsList } from "src/components/icon"

const icons = Object.keys(iconsList)

export const Basic = args => <Button {...args} />

export const BaseIconButton = () => (
  <IconButton cursor="pointer" icon="chevron_left" iconSize="small" tooltip="Previous" />
)

export const BaseButtonGroup = () => (
  <ButtonGroup>
    <Button label="One" />
    <Button label="Two" />
    <Button label="Three" />
  </ButtonGroup>
)

const radioButtonItems = [
  { label: "One", value: 1 },
  { label: "Two", value: 2 },
  { label: "Three", value: 3 },
]

export const RadioButtonGroup = {
  component: () => () => {
    const [checked, setChecked] = useState(1)
    const onChange = value => setChecked(value)

    return <ButtonGroup items={radioButtonItems} checked={checked} onChange={onChange} />
  },
}

export default {
  component: Button,
  args: {
    onClick: () => alert("clicked"),
    flavour: "default",
    id: "some-id",
    className: "some-classname",
    label: "My button",
    loadingLabel: "Loading button",
    icon: icons[0],
    isLoading: false,
    disabled: false,
    danger: false,
    warning: false,
    small: false,
  },
  argTypes: {
    flavour: {
      options: ["default", "hollow", "borderless"],
      control: { type: "radio" },
    },
    id: { control: "text" },
    className: { control: "text" },
    label: { control: "text" },
    loadingLabel: { control: "text" },
    icon: { options: icons, type: "select" },
    isLoading: { control: "boolean" },
    disabled: { control: "boolean" },
    danger: { control: "boolean" },
    warning: { control: "boolean" },
    small: { control: "boolean" },
  },
}
