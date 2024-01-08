import React from 'react'
import { Text } from 'rebass'
export const FormattedPercent = ({ fontSize = 15, percent = 0 }) => {
  if (isNaN(percent))
    return (
      <Text color={'white'} fontSize={fontSize}>
        (0%)
      </Text>
    )
  if (percent > 0) {
    return (
      <Text color={'green'} fontSize={fontSize}>
        (↑{parseFloat(percent).toFixed(0)}%)
      </Text>
    )
  }
  if (percent < 0) {
    return (
      <Text color={'red'} fontSize={fontSize}>
        (↓{parseFloat(Math.abs(percent)).toFixed(0)}%)
      </Text>
    )
  }
  return (
    <Text color={'white'} fontSize={fontSize}>
      ({parseFloat(percent).toFixed(0)}%)
    </Text>
  )
}
