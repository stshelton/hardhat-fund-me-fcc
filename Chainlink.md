# Chainlink

## The Oracle Problem

Smart contracts are unable to connect with external systems, data feeds, APIs, existing payment systems ro any other of chain resources on there own

Block chains are detmininistic by design. This is so all nodes can reach a consensus. If you start adding variable data or random data, or values that returned from an api call different nodes could get different results, and they would never be able to reach a consensus. This is know as the `Smart contract connectivity Problem` or `Oracle Problem`

`Centralized oracles` - wont work cz we are back getting data from a centralized source

## The Solution

`Chainlink` - chainlink is a decentralized oracle network for bringing data and exteranl computation into our smart contracts.

`Hybrid smart contracts` - contract that combines on chain and off chain to make incredibly feature rich powerful applications. (Using chainlink)

## Chainlink Data Feeds

Chain link Data feeds allows a smart contract to access to the pricing of different crytpo currencies

Works through a network of chain link nodes getting data from different exchanges and data providers and brings that data through a network of decentralized chain link nodes, the chain link nodes use a median to figure out what hte actual price of the asset is and the deliver that in a single transcation to whats called a reference contract, a price feed contract or data contract on chain that other smart contracts can use.

[View example](data.chain.link)

## Chainlink VRF

Chainlink verifiable randomness function is a way to get provably a random number into our smart contract to guarantee fairness and gauarentee randomness of applications

## Chainlink Keepers

Decentralized event driven execution.

Normally to kick off a transcaiton somebody needs to spend the gas and somebody needs to sit down and hit the go button or hit the transact button or hit the send button. But this is obviously a centralized vector. If you have a decentralized application that needs to run at specific times, or after specific events are triggered. ChainLink keepers are the solution to this.

Chainlink keepers are chain link nodes that listen to a registration contract for diffrent events that you specifiy to fire. Maybe you say every 10 minutes, you want to do something or once a week do something or if the price of asset hits some number, or maybe a liquidity pool is at a certain level. What ever event you want to code you absolutely can the chain link nodes constantly listen for these triggers. Once a trigger returns true, the chainlink nodes will perform what ever action u told the chain link keepers to do.
