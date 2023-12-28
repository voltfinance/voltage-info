import React, { useEffect } from 'react'
import { withRouter } from 'react-router-dom'
import { Box } from 'rebass'
import styled from 'styled-components'

import { AutoColumn } from '../components/Column'
import GlobalChart from '../components/GlobalChart'
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
import { useTVL } from '../hooks/useTVL'
import { useLiquidStaking } from '../hooks/useTVL/useLiquidStakingHistorical'
import { usePegswap } from '../hooks/useTVL/usePegswapHistorical'
import { useVevolt, useVoltStaking } from '../hooks/useTVL/useVoltStakingHistorical'
import { useVoltageExchange } from '../hooks/useTVL/useVoltageExchangeHistorical'
import { useFuseDollar } from '../hooks/useTVL/useFuseDollarHistorical'
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
  const historical = useTVL()
  const { totalLiquidityUSD, oneDayVolumeUSD, volumeChangeUSD, liquidityChangeUSD } = useGlobalData()
  // breakpoints
  const below800 = useMedia('(max-width: 800px)')

  const pegswap = usePegswap(1)
  const fusd = useFuseDollar(1)
  const veVOLT = useVevolt(1)
  const liquidStaking = useLiquidStaking(1)
  const voltage = useVoltageExchange(1)
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
            <GlobalStats />
          </AutoColumn>
          {below800 && ( // mobile card
            <Box mb={20}>
              <Panel>
                <Box>
                  <AutoColumn gap="36px">
                    <AutoColumn gap="20px">
                      <RowBetween>
                        <TYPE.main>Volume (24hrs)</TYPE.main>
                        <div />
                      </RowBetween>
                      <RowBetween align="flex-end">
                        <TYPE.main fontSize={'1.5rem'} lineHeight={1} fontWeight={600}>
                          {formattedNum(oneDayVolumeUSD, true)}
                        </TYPE.main>
                        <TYPE.main fontSize={12}>{formattedPercent(volumeChangeUSD)}</TYPE.main>
                      </RowBetween>
                    </AutoColumn>
                    <AutoColumn gap="20px">
                      <RowBetween>
                        <TYPE.main>Total Liquidity</TYPE.main>
                        <div />
                      </RowBetween>
                      <RowBetween align="flex-end">
                        <TYPE.main fontSize={'1.5rem'} lineHeight={1} fontWeight={600}>
                          {formattedNum(historical[historical?.length - 1]?.liquidity, true)}
                        </TYPE.main>
                        <TYPE.main fontSize={12}>
                          {formattedPercent(historical[historical?.length - 1]?.percentageChange)}
                        </TYPE.main>
                      </RowBetween>
                    </AutoColumn>
                  </AutoColumn>
                </Box>
              </Panel>
            </Box>
          )}
          {!below800 && (
            <GridRow>
              <Panel style={{ height: '100%', minHeight: '300px' }}>
                <GlobalChart data={historical} display="liquidity" />
              </Panel>

              <Panel style={{ height: '100%' }}>
                <GlobalChart data={historical} display="volume" />
              </Panel>
            </GridRow>
          )}
          {below800 && (
            <AutoColumn style={{ marginTop: '6px' }} gap="24px">
              <Panel style={{ height: '100%', minHeight: '300px' }}>
                <GlobalChart data={historical} display="liquidity" />
              </Panel>
            </AutoColumn>
          )}
          <ListOptions gap="10px" style={{ marginTop: '2rem', marginBottom: '.5rem' }}>
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
              <TYPE.main fontSize={'1rem'}>Top Pairs</TYPE.main>

              <FlexContainer>
                <TYPE.main> {Object.keys(allPairs).map((key) => allPairs[key])?.length || 0} Pairs</TYPE.main>
                <CustomLink to={'/pairs'}>See All</CustomLink>
              </FlexContainer>
            </RowBetween>
          </ListOptions>
          <Panel style={{ marginTop: '6px', padding: '1.125rem 0 ' }}>
            <PairList pairs={allPairs} />
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
