import React from 'react'
import { Flex, Text, Box } from 'rebass'
import { formattedNum } from '../../../utils'

const PercentFormatted = ({ percent }) => {
  if (percent > 0) {
    return (
      <Text color={'green'} fontSize={16} fontWeight={600}>
        +{parseFloat(percent).toFixed(0)}%
      </Text>
    )
  }
  if (percent < 0) {
    return (
      <Text color={'red'} fontSize={16} fontWeight={600}>
        -{parseFloat(Math.abs(percent)).toFixed(0)}%
      </Text>
    )
  }
  return (
    <Text color={'white'} fontSize={16} fontWeight={600}>
      {parseFloat(percent).toFixed(0)}%
    </Text>
  )
}

const Filter = ({ title = '', amount = 0, percent = 0, setNumberOfDays, numberOfDays = 360 }) => {
  return (
    <Flex justifyContent="space-between">
      <Flex mb={3} sx={{ gap: 2 }} flexDirection="column">
        <Text color={'white'} fontSize={16} fontWeight={500}>
          {title}
        </Text>
        <Flex alignItems="flex-end" sx={{ gap: 2 }}>
          <Text color="white" fontSize={24} fontWeight={600}>
            {formattedNum(amount, true)}
          </Text>

          <PercentFormatted percent={percent} />
        </Flex>
      </Flex>
      <Flex pb={3} sx={{ gap: 3 }}>
        <Box
          onClick={() => {
            setNumberOfDays(7)
          }}
          sx={{ cursor: 'pointer', opacity: numberOfDays === 7 ? 1 : 0.5 }}
          color="white"
        >
          Week
        </Box>
        <Box
          onClick={() => {
            setNumberOfDays(30)
          }}
          sx={{ cursor: 'pointer', opacity: numberOfDays === 30 ? 1 : 0.5 }}
          color="white"
        >
          Month
        </Box>
        <Box
          onClick={() => {
            setNumberOfDays(360)
          }}
          sx={{ cursor: 'pointer', opacity: numberOfDays === 360 ? 1 : 0.5 }}
          color="white"
        >
          Year
        </Box>
      </Flex>
    </Flex>
  )
}

export default Filter
