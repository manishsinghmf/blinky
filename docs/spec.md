# Blink POC Spec

## Summary
This project is a proof of concept to understand the best flow for creating and using Solana blinks. The first supported action is `Send SOL`. The app lets a user enter a recipient wallet address and an amount, generates a blink for that transfer, and explains how the blink is actually consumed by a wallet or blink-aware client.

This POC is intended for:
- learning the end-to-end blink flow
- demonstrating the concept
- creating a reusable blueprint for later integration into the production app

This POC is not intended to model the full production system for pool management, token management, or all future action types yet.

## Goals
- Build a minimal app that generates a valid Send SOL blink
- Keep the blink generation flow simple and understandable
- Show both the raw Solana Action URL and the shareable blink URL
- Use an implementation structure that can later be reused in the production app
- Make it easy to extend the same pattern for future actions like pool management and token management

## Non-Goals
- No database or persistence in the MVP
- No short-link storage
- No wallet connection required to generate the blink URL
- No multi-action orchestration in v1
- No direct integration into the existing production app yet

## Product Flow
1. User opens the POC app homepage
2. User enters:
   - recipient wallet address
   - amount in SOL
3. User clicks `Generate Blink`
4. App validates the inputs locally
5. App generates:
   - raw action URL
   - `dial.to` blink URL
6. App shows short explanation text about how to use the blink
7. User can copy or open the generated blink URL for demo/testing

## Blink Usage Model
The generated raw URL is the Solana Action endpoint.

The generated shareable blink URL wraps that action endpoint in a blink-aware client flow through `dial.to`.

Important behavior:
- opening the raw API URL in a normal browser usually shows JSON metadata, not a wallet popup
- a blink needs a blink-aware client or wallet flow to render the action UI, request signature, and submit the transaction
- for this POC, `dial.to` is the primary way to test and demo the blink
- posting on X is valid for sharing, but inline execution on X is not guaranteed until the action is trusted/registered and opened in a supporting client surface

## Architecture
The POC uses a single Next.js application.

### Frontend
- Next.js App Router UI
- single page form for generating the Send SOL blink
- result view with copy/open actions and usage instructions

### API Layer
Public Solana Action endpoints live in Next.js route handlers:
- `GET /api/actions/send-sol`
- `POST /api/actions/send-sol`
- `OPTIONS /api/actions/send-sol`
- `GET /actions.json`
- `OPTIONS /actions.json`

### Server Modules
Route handlers remain thin. Core logic is extracted into reusable server modules:
- request validation
- Solana connection creation
- transaction building
- action payload construction
- shared response headers and error formatting

This keeps the POC clean and makes later migration into a dedicated backend service straightforward.

## API Design
### `GET /api/actions/send-sol`
Purpose:
- return action metadata for a fixed Send SOL transaction

Query params:
- `to`: recipient wallet address
- `amount`: SOL amount

Behavior:
- validate inputs
- return title, icon, description, label, and action button metadata
- return CORS headers required by Solana Actions clients

### `POST /api/actions/send-sol`
Purpose:
- return a signable transaction for the wallet user

Inputs:
- query params:
  - `to`
  - `amount`
- JSON body:
  - `account` as sender wallet public key

Behavior:
- validate sender account
- validate recipient account
- validate amount
- create `SystemProgram.transfer` transaction
- set fee payer to sender
- fetch recent blockhash from configured cluster
- return `createPostResponse(...)` payload
- return structured JSON errors on invalid input

### `GET /actions.json`
Purpose:
- map relevant routes to the action API for blink discovery

Behavior:
- return valid rules payload
- include required CORS headers
- support `OPTIONS`

## Network
Default network for the POC:
- `devnet`

The implementation keeps network configuration centralized so switching to mainnet later is easy.

## Extensibility Direction
The Send SOL action is the first template.

Later actions should reuse the same architecture:
- action-specific validator
- action-specific transaction builder
- action-specific GET metadata builder
- shared route conventions and shared Solana utilities

Likely future families:
- send SOL
- token management
- pool management

## Quality Requirements
- route handlers must be thin and deterministic
- validation must happen on both query params and request body
- all action endpoints must return required CORS headers
- all endpoints must support `OPTIONS`
- errors should be structured and user-readable
- no inline secrets or hardcoded environment-specific config

## Testing
Manual checks:
- generate valid blink with valid recipient and amount
- reject invalid recipient
- reject invalid amount
- open generated `dial.to` link and inspect action rendering
- confirm transaction preview shows expected recipient and exact amount

API checks:
- GET returns valid action payload
- POST returns a valid serialized transaction payload
- OPTIONS returns valid CORS headers
- `actions.json` correctly maps discovery

## Locked Decisions
- architecture: single Next.js app
- persistence: none
- link model: stateless
- output: raw action URL plus `dial.to` URL
- amount mode: fixed amount
- default network: devnet
- primary demo/testing surface: `dial.to`
- X inline execution is a later trusted/registered stage, not the main proof path

