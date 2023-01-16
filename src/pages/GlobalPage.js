import React, { useEffect, useMemo } from 'react'
import { withRouter } from 'react-router-dom'
import { Box } from 'rebass'
import styled from 'styled-components'
import { Chart } from 'react-google-charts'

import { RowBetween } from '../components/Row'
import { AutoColumn } from '../components/Column'
import GlobalChart, { CHART_VIEW } from '../components/GlobalChart'
import Search from '../components/Search'
import GlobalStats from '../components/GlobalStats'

import { useGlobalData } from '../contexts/GlobalData'
import { useMedia } from 'react-use'
import Panel from '../components/Panel'
import { formattedNum, formattedPercent } from '../utils'
import { TYPE, ThemedBackground } from '../Theme'

import { PageWrapper, ContentWrapper } from '../components'
import { useAllPairData } from '../contexts/PairData'
import { useTreasuryHoldings } from '../hooks/useAccountPositionValue'
import { TREASURY1, TREASURY2, TREASURY3 } from '../constants'

const GridRow = styled.div`
  display: grid;
  width: 100%;
  grid-template-columns: 1fr 1fr;
  column-gap: 6px;
  align-items: start;
  justify-content: space-between;
`

function GlobalPage() {
  // Add a volt price next fuse
  // Start liquidity from 6 months
  // Single volume line for everything

  const treasury1Holdings = useTreasuryHoldings(TREASURY1)
  const treasury2Holdings = useTreasuryHoldings(TREASURY2)
  const treasury3Holdings = useTreasuryHoldings(TREASURY3)
  const fiatTotalTreasuries = useMemo(() => {
    if (!treasury1Holdings.fiatTotal || !treasury2Holdings.fiatTotal || !treasury3Holdings.fiatTotal) return 0
    return treasury1Holdings.fiatTotal + treasury2Holdings.fiatTotal + treasury3Holdings.fiatTotal
  }, [treasury1Holdings.fiatTotal, treasury2Holdings.fiatTotal, treasury3Holdings.fiatTotal])

  const {
    totalLiquidityUSD,
    oneDayVolumeUSD,
    volumeChangeUSD,
    liquidityChangeUSD,
    stableswapLiquidityUSD,
    fusdLiquidityUSD,
  } = useGlobalData()
  const allPairs = useAllPairData()

  const data = [
    ['Product', 'TVL in $USD'],
    ['DEX', totalLiquidityUSD],
    ['Stableswap', stableswapLiquidityUSD],
    ['FUSD V2', fusdLiquidityUSD],
    ['xVOLT', 72000],
  ]
  const pairsData = [
    ['Product', 'TVL in $USD'],
    ...(Object.values(allPairs)
      ?.sort((a, b) => b.volumeUSD - a.volumeUSD)
      .slice(0, 10)
      .map((pair) => [`${pair.token0.symbol}/${pair.token1.symbol}`, parseFloat(pair.volumeUSD)]) || []),
    // ...(topLps?.slice(0, 5).map((lp) => [lp.pairName, lp.volumeUSD]) || []),
  ]

  const treasuryData = [
    ['Product', `TVL in $USD`],
    [
      'VOLT & xVOLT',
      [treasury1Holdings.volt ?? 0, treasury2Holdings.volt ?? 0, treasury3Holdings.volt ?? 0].reduce((a, b) => a + b),
    ],
    [
      'Stables & fUSD',
      [treasury1Holdings.stables ?? 0, treasury2Holdings.stables ?? 0, treasury3Holdings.stables ?? 0].reduce(
        (a, b) => a + b
      ),
    ],
    [
      'LPs',
      [treasury1Holdings.lps ?? 0, treasury2Holdings.lps ?? 0, treasury3Holdings.lps ?? 0].reduce((a, b) => a + b),
    ],
    [
      'FUSE',
      [treasury1Holdings.fuse ?? 0, treasury2Holdings.fuse ?? 0, treasury3Holdings.fuse ?? 0].reduce((a, b) => a + b),
    ],
    [
      'Other',
      Math.max(
        [treasury1Holdings.other ?? 0, treasury2Holdings.other ?? 0, treasury3Holdings.other ?? 0].reduce(
          (a, b) => a + b
        ),
        0
      ),
    ],
  ]

  const pairsOptions = {
    title: 'Top 10 Traded Pairs',
    pieHole: 0.4,
    is3D: false,
    backgroundColor: '#DDD',
    color: 'white',
  }
  const options = {
    title: 'TVL $USD',
    pieHole: 0.4,
    is3D: false,
    backgroundColor: '#DDD',
    color: 'white',
  }
  const treasuryOptions = {
    title: `Voltage Treasury Funds $USD ${formattedNum(fiatTotalTreasuries, true)}`,
    pieHole: 0.3,
    is3D: true,
    backgroundColor: '#DDD',
    color: 'white',
  }

  // breakpoints
  const below800 = useMedia('(max-width: 800px)')

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
                          {formattedNum(totalLiquidityUSD, true)}
                        </TYPE.main>
                        <TYPE.main fontSize={12}>{formattedPercent(liquidityChangeUSD)}</TYPE.main>
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
                <GlobalChart view={CHART_VIEW.LIQUIDITY} />
              </Panel>
              <Panel style={{ height: '100%' }}>
                <GlobalChart view={CHART_VIEW.VOLUME} />
              </Panel>
            </GridRow>
          )}
          {below800 && (
            <AutoColumn style={{ marginTop: '6px' }} gap="24px">
              <Panel style={{ height: '100%', minHeight: '300px' }}>
                <GlobalChart view={CHART_VIEW.LIQUIDITY} />
              </Panel>
            </AutoColumn>
          )}
          <GridRow>
            <Panel style={{ height: '100%', minHeight: '300px' }}>
              <Chart
                chartType="PieChart"
                width="100%"
                height="400px"
                data={data}
                options={options}
                style={{ color: '#FFF' }}
              />
            </Panel>
            <Panel style={{ height: '100%' }}>
              <GlobalChart view={CHART_VIEW.BAR} />
            </Panel>
          </GridRow>
          <AutoColumn>
            <Panel style={{ height: '100%', width: '100%' }}>
              <Chart
                chartType="PieChart"
                width="100%"
                height="400px"
                data={treasuryData}
                options={treasuryOptions}
                style={{ color: '#FFF' }}
              />
            </Panel>
          </AutoColumn>
          <AutoColumn>
            <Panel style={{ height: '100%', width: '100%' }}>
              <Chart
                chartType="PieChart"
                width="100%"
                height="400px"
                data={pairsData}
                options={pairsOptions}
                style={{ color: '#FFF' }}
              />
            </Panel>
          </AutoColumn>
        </div>
      </ContentWrapper>
    </PageWrapper>
  )
}

export default withRouter(GlobalPage)
