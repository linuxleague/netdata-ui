import React, { useState } from "react"
import { storiesOf } from "@storybook/react"
import { text, boolean } from "@storybook/addon-knobs"
import { Toggle } from "."
import { readmeCleanup } from "utils/readme"
import readme from "./README.md"

const toggleStory = storiesOf("COMPONENTS|Controls/Toggle", module)

const subData = {
  readme: {
    sidebar: readmeCleanup(readme),
  },
  jest: ["toggle.test.tsx"],
}

toggleStory.add(
  "Toggle",
  () => {
    const [checked, setChecked] = useState(false)
    const handleChange = e => {
      setChecked(e.currentTarget.checked)
    }
    return (
      <Toggle
        labelRight={text("Label right", "Do you like greek salad?")}
        disabled={boolean("Disabled", false)}
        onChange={handleChange}
        checked={checked}
        colored={boolean("Colored", true)}
      />
    )
  },
  subData
)

toggleStory.add(
  "Toggle Disabled",
  () => {
    const [checked, setChecked] = useState(false)
    const handleChange = e => {
      setChecked(e.currentTarget.checked)
    }
    return (
      <Toggle
        labelRight={text("Label right", "Do you like greek salad?")}
        disabled={boolean("Disabled", true)}
        onChange={handleChange}
        checked={checked}
        colored={boolean("Colored", true)}
      />
    )
  },
  subData
)

toggleStory.add(
  "Two options Toggle",
  () => {
    const [checked, setChecked] = useState(false)
    const handleChange = e => {
      setChecked(e.currentTarget.checked)
    }
    return (
      <Toggle
        labelRight={text("Label right", "Light theme")}
        labelLeft={text("Label left", "Dark theme")}
        onChange={handleChange}
        checked={checked}
        disabled={boolean("Disabled", false)}
        colored={boolean("Colored", false)}
      />
    )
  },
  subData
)
