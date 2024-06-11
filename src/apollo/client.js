import { ApolloClient } from 'apollo-client'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { HttpLink } from 'apollo-link-http'

export const client = new ApolloClient({
  link: new HttpLink({
    uri: 'https://gateway-arbitrum.network.thegraph.com/api/cb1ae4c45919243221a3442d95556884/subgraphs/id/4buFyoUT8Lay3T1DK9ctdMdcpkZMdi5EpCBWZCBTKvQd',
  }),
  cache: new InMemoryCache(),
  shouldBatch: true,
})
export const pegswapClient = new ApolloClient({
  link: new HttpLink({
    uri: 'https://gateway-arbitrum.network.thegraph.com/api/cb1ae4c45919243221a3442d95556884/subgraphs/id/2awYxnhBXXQwUQG15pZY6K53oPGUSUEVLdB9UJF55cyy',
  }),
  cache: new InMemoryCache(),
})

export const healthClient = new ApolloClient({
  link: new HttpLink({
    uri: 'https://api.thegraph.com/index-node/graphql',
  }),
  cache: new InMemoryCache(),
  shouldBatch: true,
})

export const v1Client = new ApolloClient({
  link: new HttpLink({
    uri: 'https://api.thegraph.com/subgraphs/name/ianlapham/uniswap',
  }),
  cache: new InMemoryCache(),
  shouldBatch: true,
})

export const stakingClient = new ApolloClient({
  link: new HttpLink({
    uri: 'https://api.thegraph.com/subgraphs/name/way2rach/talisman',
  }),
  cache: new InMemoryCache(),
  shouldBatch: true,
})

export const blockClient = new ApolloClient({
  link: new HttpLink({
    uri: 'https://gateway-arbitrum.network.thegraph.com/api/cb1ae4c45919243221a3442d95556884/subgraphs/id/4NdGNtBYVAuWriUfcb58vLmiaendp7v8EQ9tGe3i1RPo',
  }),
  cache: new InMemoryCache(),
})

export const v3Client = new ApolloClient({
  link: new HttpLink({
    uri: 'https://gateway-arbitrum.network.thegraph.com/api/cb1ae4c45919243221a3442d95556884/subgraphs/id/HzpnoLiTRga8yWaPBPBJjLp1FseiJkiynKDNXXFDKEQc',
  }),
  cache: new InMemoryCache(),
  shouldBatch: true,
})

export const voltStakingClient = new ApolloClient({
  link: new HttpLink({
    uri: 'https://gateway-arbitrum.network.thegraph.com/api/cb1ae4c45919243221a3442d95556884/subgraphs/id/AH6ViHt7LJJEiBJPBY1u7RQF737CRs4uk6a9uvMcSTZJ',
  }),
  cache: new InMemoryCache(),
})

export const vevoltStakingClient = new ApolloClient({
  link: new HttpLink({
    uri: 'https://gateway-arbitrum.network.thegraph.com/api/cb1ae4c45919243221a3442d95556884/subgraphs/id/5D1zpRupU7paCuSARLpbkmmi5ywpb6tbhdZWZpMFs7pD',
  }),
  cache: new InMemoryCache(),
  shouldBatch: true,
})

export const fusdV2Client = new ApolloClient({
  link: new HttpLink({
    uri: 'https://gateway-arbitrum.network.thegraph.com/api/cb1ae4c45919243221a3442d95556884/subgraphs/id/5UhPGFCBafFdX2GJt5NbKDy5ognQgETFHN6nUonyqki2',
  }),
  cache: new InMemoryCache(),
  shouldBatch: true,
})

export const fusdV3Client = new ApolloClient({
  link: new HttpLink({
    uri: 'https://gateway-arbitrum.network.thegraph.com/api/cb1ae4c45919243221a3442d95556884/subgraphs/id/6CtoTUig1ej3i24WGmJ5o9N6CL9JWB3FUjsF5C1SRjFy',
  }),
  cache: new InMemoryCache(),
  shouldBatch: true,
})

export const liquidStakingClient = new ApolloClient({
  link: new HttpLink({
    uri: 'https://gateway-arbitrum.network.thegraph.com/api/cb1ae4c45919243221a3442d95556884/subgraphs/id/7FQVAoYfsrYPAVzaHnky1rHGYjXj2hcw3yokeLQmpntp',
  }),
  cache: new InMemoryCache(),
  shouldBatch: true,
})

export const stableSwapClient = new ApolloClient({
  link: new HttpLink({
    uri: 'https://gateway-arbitrum.network.thegraph.com/api/cb1ae4c45919243221a3442d95556884/subgraphs/id/HTFuhfjdwFoc3wXGQ5UMrevui5mjx2N6pJnratYrCzSa',
  }),
  cache: new InMemoryCache(),
  shouldBatch: true,
})
