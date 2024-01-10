import React, { useEffect, useState } from 'react'
import { withRouter } from 'react-router-dom'
import { Box, Flex, Text } from 'rebass'
import styled from 'styled-components'

import { AutoColumn } from '../components/Column'

import GlobalStats from '../components/GlobalStats'
import PairList from '../components/PairList'
import { AutoRow, RowBetween } from '../components/Row'
import Search from '../components/Search'
import TxnList from '../components/TxnList'

import { useMedia } from 'react-use'
import { TYPE, ThemedBackground } from '../Theme'
import { CustomLink } from '../components/Link'
import Panel from '../components/Panel'
import { useGlobalData, useGlobalTransactions } from '../contexts/GlobalData'
import { useAllPairData } from '../contexts/PairData'
import { useAllTokenData } from '../contexts/TokenData'
import { formattedNum, formattedPercent } from '../utils'

import { flattenDeep, sumBy } from 'lodash'
import { ContentWrapper, PageWrapper } from '../components'
import PegswapTokensList from '../components/PegswapTokensList'
import { calculatePercentageChange, useTVL } from '../hooks/useTVL'
import { useLiquidStaking } from '../hooks/useTVL/useLiquidStakingHistorical'
import { usePegswap } from '../hooks/useTVL/usePegswapHistorical'
import { useVevolt, useVoltStaking } from '../hooks/useTVL/useVoltStakingHistorical'
import { useVoltageExchange } from '../hooks/useTVL/useVoltageExchangeHistorical'
import { useFuseDollar } from '../hooks/useTVL/useFuseDollarHistorical'
import LiquidityChart from '../components/GlobalChart/Liquidity'
import VolumeChart from '../components/GlobalChart/Volume'
import { useV3Pairs } from '../hooks/useTVL/useV3Pairs'
import TopPairsList from '../components/TopPairsList'
import { FormattedPercent } from '../components/FormattedPercent'
import { useDailyPairs } from '../hooks/useTVL/usePairs'
const ListOptions = styled(AutoRow)`
  height: 40px;
  width: 100%;
  font-size: 1.25rem;
  font-weight: 600;

  @media screen and (max-width: 640px) {
    font-size: 1rem;
  }
`

const GridRow = styled.div`
  display: grid;
  width: 100%;
  grid-template-columns: 1fr 1fr;
  column-gap: 6px;
  align-items: start;
  justify-content: space-between;
`

const FlexContainer = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`

function GlobalPage() {
  // get data for lists and totals
  const allPairs = useAllPairData()
  const allTokens = useAllTokenData()
  const transactions = useGlobalTransactions()
  const { totalLiquidityUSD, oneDayVolumeUSD, volumeChangeUSD, liquidityChangeUSD } = useGlobalData()
  // breakpoints
  const below800 = useMedia('(max-width: 800px)')

  const pegswap = usePegswap(1)
  const fusd = useFuseDollar(1)
  const veVOLT = useVevolt(1)
  const liquidStaking = useLiquidStaking(1)
  const voltage = useVoltageExchange(1)
  const v3Pairs = useV3Pairs(1)
  const pairs = useDailyPairs()
  // console.log(v3Pairs, 'v3Pairs')
  // console.log(allPairs, 'allPairs')

  const weekly = useTVL(7)
  // const volt = useVoltStaking(1)
  // scrolling refs
  useEffect(() => {
    document.querySelector('body').scrollTo({
      behavior: 'smooth',
      top: 0,
    })
  }, [])

  return (
    <PageWrapper>
      <ThemedBackground />
      <ContentWrapper>
        <div>
          <AutoColumn gap="24px" style={{ paddingBottom: below800 ? '0' : '24px' }}>
            <TYPE.largeHeader>{below800 ? 'Protocol Analytics' : 'Voltage Analytics'}</TYPE.largeHeader>
            <Search />
          </AutoColumn>

          {!below800 && (
            <GridRow>
              <Panel style={{ height: '100%', minHeight: '300px' }}>
                <LiquidityChart />
              </Panel>

              <Panel style={{ height: '100%' }}>
                <VolumeChart />
              </Panel>
            </GridRow>
          )}
          {below800 && (
            <AutoColumn style={{ marginTop: '6px' }} gap="24px">
              <Panel style={{ height: '100%', minHeight: '300px' }}>
                <LiquidityChart />
              </Panel>
              <Panel style={{ height: '100%', minHeight: '300px' }}>
                <VolumeChart />
              </Panel>
            </AutoColumn>
          )}
          <Flex sx={{ gap: 3 }} flexDirection={['column', 'row']} color="white" pt={3} pb={4}>
            <Flex alignItems={'flex-end'} fontSize={16} sx={{ gap: 2 }}>
              <Text>Volume 24H: {formattedNum(weekly[weekly.length - 1]?.volumeUSD, true) || 0}</Text>
              <FormattedPercent
                percent={calculatePercentageChange(
                  weekly[weekly.length - 2]?.volumeUSD,
                  weekly[weekly.length - 1]?.volumeUSD
                )}
              />
            </Flex>

            <Flex alignItems={'flex-end'} fontSize={16} sx={{ gap: 2 }}>
              <Text>TVL 24H: {formattedNum(weekly[weekly.length - 1]?.totalLiquidityUSD, true) || 0}</Text>
              <Text>
                <FormattedPercent
                  percent={calculatePercentageChange(
                    weekly[weekly.length - 2]?.totalLiquidityUSD,
                    weekly[weekly.length - 1]?.totalLiquidityUSD
                  )}
                />
              </Text>
            </Flex>
            <Flex alignItems={'flex-end'} fontSize={16} sx={{ gap: 2 }}>
              <Text>Fees 24H: {formattedNum(weekly[weekly.length - 1]?.volumeUSD * 0.003, true)}</Text>
            </Flex>
          </Flex>
          <ListOptions gap="10px" style={{ marginBottom: '.5rem' }}>
            <RowBetween>
              <TYPE.main fontSize={'1.125rem'}>Top Pegswap Tokens</TYPE.main>
              <FlexContainer>
                <TYPE.main>
                  Total: {formattedNum(sumBy(flattenDeep(pegswap), 'totalLiquidityUSD'), true) || 0}
                </TYPE.main>
              </FlexContainer>
            </RowBetween>
          </ListOptions>
          <Panel style={{ marginTop: '6px', padding: '1.125rem 0 ' }}>
            <PegswapTokensList tokens={flattenDeep(pegswap)} />
          </Panel>

          <ListOptions gap="10px" style={{ marginTop: '2rem', marginBottom: '.5rem' }}>
            <RowBetween>
              <TYPE.main fontSize={'1.125rem'}>Top Staking Tokens </TYPE.main>
              <FlexContainer>
                <TYPE.main>
                  Total: {formattedNum(sumBy([...veVOLT, ...liquidStaking], 'totalLiquidityUSD'), true) || 0}
                </TYPE.main>
              </FlexContainer>
            </RowBetween>
          </ListOptions>
          <Panel style={{ marginTop: '6px', padding: '1.125rem 0 ' }}>
            <PegswapTokensList tokens={[...veVOLT, ...liquidStaking]} />
          </Panel>

          <ListOptions gap="10px" style={{ marginTop: '2rem', marginBottom: '.5rem' }}>
            <RowBetween>
              <TYPE.main fontSize={'1.125rem'}>Top Fuse Dollar Tokens </TYPE.main>
              <FlexContainer>
                <TYPE.main>Total: {formattedNum(sumBy(fusd, 'totalLiquidityUSD'), true) || 0}</TYPE.main>
              </FlexContainer>
            </RowBetween>
          </ListOptions>
          <Panel style={{ marginTop: '6px', padding: '1.125rem 0 ' }}>
            <PegswapTokensList tokens={fusd} />
          </Panel>
          <ListOptions gap="10px" style={{ marginTop: '2rem', marginBottom: '.5rem' }}>
            <RowBetween>
              <TYPE.main fontSize={'1.125rem'}>Top Exchange Tokens </TYPE.main>
              <FlexContainer>
                <TYPE.main>
                  Total: {formattedNum(sumBy(flattenDeep(voltage), 'totalLiquidityUSD'), true) || 0}
                </TYPE.main>
              </FlexContainer>
            </RowBetween>
          </ListOptions>
          <Panel style={{ marginTop: '6px', padding: '1.125rem 0 ' }}>
            <PegswapTokensList tokens={flattenDeep(voltage)} />
          </Panel>

          <ListOptions gap="10px" style={{ marginTop: '2rem', marginBottom: '.5rem' }}>
            <RowBetween>
              <TYPE.main fontSize={'1.125rem'}>Top V3 Pairs </TYPE.main>
              <FlexContainer>
                <TYPE.main>Total: {formattedNum(sumBy(v3Pairs, 'totalLiquidityUSD'), true) || 0}</TYPE.main>
              </FlexContainer>
            </RowBetween>
          </ListOptions>
          <Panel style={{ marginTop: '6px', padding: '1.125rem 0 ' }}>
            <TopPairsList tokens={v3Pairs} />
          </Panel>

          <ListOptions gap="10px" style={{ marginTop: '2rem', marginBottom: '.5rem' }}>
            <RowBetween>
              <TYPE.main fontSize={'1rem'}>Top Pairs</TYPE.main>

              <FlexContainer>
                {/* <TYPE.main> {Object.keys(pairs).map((key) => pairs[key])?.length || 0} Pairs</TYPE.main> */}
                <CustomLink to={'/pairs'}>See All</CustomLink>
              </FlexContainer>
            </RowBetween>
          </ListOptions>
          <Panel style={{ marginTop: '6px', padding: '1.125rem 0 ' }}>
            <TopPairsList tokens={pairs} />
          </Panel>

          <span>
            <TYPE.main fontSize={'1.125rem'} style={{ marginTop: '2rem' }}>
              Transactions
            </TYPE.main>
          </span>
          <Panel style={{ margin: '1rem 0' }}>
            <TxnList transactions={transactions} />
          </Panel>
        </div>
      </ContentWrapper>
    </PageWrapper>
  )
}

export default withRouter(GlobalPage)
