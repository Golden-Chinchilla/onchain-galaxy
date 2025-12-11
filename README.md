# Onchain Galaxy

An experimental app that turns Ethereum block data into a 3D planet, built with React and @react-three/fiber plus viem.

## Features

- Query the latest block or a specific height and show block basics.
- Map block attributes to planet size, colors, rings, satellites, volcanoes, and particles.
- User-friendly errors: invalid height / above latest / block not found.

## Environment & Config

- Node 18+
- `.env`: `ETH_MAINNET_RPC_URL=<your mainnet RPC>` (keep it out of VCS)

## Development & Build

- Dev: `yarn dev` (port 5173, HMR)
- Build: `yarn build` (outputs to `dist/`)
- Install deps: `yarn install`

## Tech Stack

- React 19
- @react-three/fiber, @react-three/drei, three.js
- viem (fetching block data)
- Webpack 5 + Babel + TypeScript + Tailwind CSS v4 (postcss)

## Directory

- `src/features/block-visualizer/`
  - `services/blockDataService.ts`: fetch and map block data
  - `lib/planetMapping.ts`: block attributes �� planet config
  - `components/`: Three scene and UI components
