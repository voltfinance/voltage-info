import React, { useEffect } from 'react'
import { withRouter } from 'react-router-dom'
import { Box } from 'rebass'
import styled from 'styled-components'
import { Chart } from 'react-google-charts'

import { RowBetween } from '../components/Row'
import { AutoColumn } from '../components/Column'
import GlobalChart, { CHART_VIEW } from '../components/GlobalChart'
import Search from '../components/Search'
import GlobalStats from '../components/GlobalStats'

import { useAllPairsInUniswap, useGlobalData, useTopLps } from '../contexts/GlobalData'
import { useMedia } from 'react-use'
import Panel from '../components/Panel'
import { formattedNum, formattedPercent } from '../utils'
import { TYPE, ThemedBackground } from '../Theme'

import { PageWrapper, ContentWrapper } from '../components'
import { useAllPairData } from '../contexts/PairData'

// const ListOptions = styled(AutoRow)`
//   height: 40px;
//   width: 100%;
//   font-size: 1.25rem;
//   font-weight: 600;

//   @media screen and (max-width: 640px) {
//     font-size: 1rem;
//   }
// `

const GridRow = styled.div`
  display: grid;
  width: 100%;
  grid-template-columns: 1fr 1fr;
  column-gap: 6px;
  align-items: start;
  justify-content: space-between;
`

function GlobalPage() {
  const {
    totalLiquidityUSD,
    oneDayVolumeUSD,
    volumeChangeUSD,
    liquidityChangeUSD,
    totalProtocolLiquidityUSD,
  } = useGlobalData()
  const allPairs = useAllPairData()

  const data = [
    ['Product', 'TVL in $USD'],
    ['DEX', 1140000],
    ['Stableswap', 250000],
    ['FUSD V2', 70000],
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

  console.log(totalProtocolLiquidityUSD)

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
              <GlobalChart view={CHART_VIEW.TREASURY} />
            </Panel>
          </AutoColumn>
          <AutoColumn>
            <Panel style={{ height: '100%', width: '100%' }}>
              <GlobalChart view={CHART_VIEW.REVENUE} />
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

          {/* <ListOptions gap="10px" style={{ marginTop: '2rem', marginBottom: '.5rem' }}>
            <RowBetween>
              <TYPE.main fontSize={'1.125rem'}>Top Tokens</TYPE.main>
              <CustomLink to={'/tokens'}>See All</CustomLink>
            </RowBetween>
          </ListOptions>
          <Panel style={{ marginTop: '6px', padding: '1.125rem 0 ' }}>
            <TopTokenList tokens={allTokens} />
          </Panel>
          <ListOptions gap="10px" style={{ marginTop: '2rem', marginBottom: '.5rem' }}>
            <RowBetween>
              <TYPE.main fontSize={'1rem'}>Top Pairs</TYPE.main>
              <CustomLink to={'/pairs'}>See All</CustomLink>
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
          </Panel> */}
        </div>
      </ContentWrapper>
    </PageWrapper>
  )
}

export default withRouter(GlobalPage)
