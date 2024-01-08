import React, { useState } from 'react'
import { useMedia } from 'react-use'
import { Flex, Text } from 'rebass'
import styled from 'styled-components'
import { useEthPrice, useGlobalData } from '../../contexts/GlobalData'
import { formattedNum, localNumber } from '../../utils'
import FusePrice from '../UniPrice'

const Header = styled.div`
  width: 100%;
  position: sticky;
  top: 0;
`

const Medium = styled.span`
  font-weight: 500;
`

export default function GlobalStats() {
  const below1295 = useMedia('(max-width: 1295px)')
  const below1180 = useMedia('(max-width: 1180px)')
  const below1024 = useMedia('(max-width: 1024px)')
  const below400 = useMedia('(max-width: 400px)')
  const below816 = useMedia('(max-width: 816px)')

  const [showPriceCard, setShowPriceCard] = useState(false)

  const { oneDayVolumeUSD, oneDayTxns, pairCount } = useGlobalData()
  const [ethPrice] = useEthPrice()
  const formattedEthPrice = ethPrice ? formattedNum(ethPrice, true) : '-'
  const oneDayFees = oneDayVolumeUSD ? formattedNum(oneDayVolumeUSD * 0.003, true) : ''

  return (
    <Flex color="white" style={{ padding: below816 ? '0.5rem' : '.5rem' }}>
      {!below400 && (
        <Text
          mr={'1rem'}
          onMouseEnter={() => {
            setShowPriceCard(true)
          }}
          onMouseLeave={() => {
            setShowPriceCard(false)
          }}
          style={{ position: 'relative' }}
        >
          FUSE Price: <Medium>{formattedEthPrice}</Medium>
          {showPriceCard && <FusePrice />}
        </Text>
      )}

      {!below1180 && (
        <Text mr={'1rem'}>
          Transactions (24H): <Medium>{localNumber(oneDayTxns)}</Medium>
        </Text>
      )}
      {!below1024 && (
        <Text mr={'1rem'}>
          Pairs: <Medium>{localNumber(pairCount)}</Medium>
        </Text>
      )}
      {!below1295 && (
        <Text mr={'1rem'}>
          Fees (24H): <Medium>{oneDayFees}</Medium>&nbsp;
        </Text>
      )}
    </Flex>
  )
}
