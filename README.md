# Candor

A transformative charitable gateway enabling seamless cross-token donations, verifiable social pledge attestations designed for socially fairer fund distributions.

## Motivation/Problem
<place_holder>

## Demo Link: <place_holder>

## System

![Copy of Eth Global](https://github.com/user-attachments/assets/c79085f3-5876-470d-a922-07587efd00b6)

### Smart contracts
Candor consists of three core contracts: (1) the main Candor contract, (2) CandorSPHook, and (3) Sign Protocol’s SP contract, all integrated within the ERC-4337 Account Abstraction framework provided by Biconomy.
The Candor contract manages two key functions: (1) donation cash flow and (2) social pledges via Sign Protocol attestations. To offer maximum flexibility and convenience for users, the contract integrates multi-token swaps using OneInchSwapHelper, enabling payment settlements in various currencies.

By integrating Sign Protocol, Candor leverages its social pledge schema and custom hook instance (CandorSPHook) to enhance attestation capabilities. This integration ensures pledges are verified and linked to specific users, while preserving privacy using methods like WorldID. Each user’s WorldID is assigned a social score, which increases with each successful pledge, reflecting the weight of their contributions. This score serves as an indicator of proactive social involvement and social capital, which is also factored into quadratic funding distributions.
Bounty prizes

### Backend
<place_holder>

#### External toolings
- SignProtocol - Sign protocol’s attestation has the perfect synergy with integrating with WorldID’s proof of personhood enabling us to verify a real person made a transaction. Coupled with the immutability, transparency and censorship resistance of public blockchains, Candor chose SignProtocol to be the default attestation platform for social pledge attestation, efficient data indexing and enabling merchants to leverage on these to issue points, cashback, or bonuses to real persons based on real transactions.
Sign Protocol’s instance also enables custom hook integration that enables the flexibility for advanced implementation on top of just a simple attestation feature. Here, Candor leverages Sign Protocol for social attestations to guarantee immutability and censorship resistance while gelling with WorldID’s humanhood verification to ensure the authenticity and fairness of its native loyalty program based on genuine proactiveness. And Candor also keeps track of a social score under the WorldID, making a loyalty system to encourage active and recurring participation in pledging.

- WorldID - By leveraging WorldID's incognito actions for private proof of personhood, we ensure that all purchases and social pledges are made by real verified users, not bots. WorldID's privacy-preserving proof allows linking multiple ETH addresses to 1 person, enabling accurate collection of loyalty points while preserving privacy. This integration enhances the integrity of our platform and provides greater flexibility for blockchain-based financial services. Additionally, WorldID’s proof of personhood can help combat concert ticket botters by ensuring that 1 worldID user can only make 1 social pledge.
World ID mini app kit also allows to create seamless native-like applications that leverage the WorldID ecosystem, enabling users to make donations, verify their identity, and participate in pledges directly within the wallet - all without redirections, creating a frictionless user experience while tapping into World ID's growing network for WLD/USDC monetization.

- Blockscout  - We verified our Candor and CandorSPHook smart contract on Blockscout for Base Sepolia. Making it much easier to debug and also trustworthy for anyone who wants to build on top of the smart contract.

- Dynamic - Dynamic is a core integration which provides a seamless end-to-end experience. Our users first log in with traditional methods like Gmail etc. We integrated Biconomy’s Account Abstraction SDK which allowed us to bundle multiple transactions together like our approve and pay transactions, allowing a one click checkout process. To take things further, we sponsored all our users’ transactions, removing the need for users to understand anything about gas. All of these combined allow for Web3 transactions with Web2 experiences, something that we think is important to onboard the next 1M users.

- The Graph - Thanks to The Graph Protocol, Candor has near-instantaneous access to blockchain data through a developer-friendly API. With real-time listening capability, Candor can track firstly all its cash flow activities (from its main contract), secondly the respective on-chain review attestations from Sign Protocol & thirdly its human hood verification tracking & attestation social score system in an efficient manner without the need for complex infrastructure set-up. With the help of abstracting complex data structures, this not only services for simplifying blockchain data analytics but also ensures that scalability requirements can be effectively met as the amount of data generated increases exponentially.

- Biconomy - With Biconomy's SDK, Candor transforms the user experience by integrating smart sessions and gasless transactions, making charitable giving seamless and accessible. Users can enjoy one-click donation flows with transaction bundling, removing complexities like gas management and ensuring smooth on-chain interactions.
Biconomy's advanced relayer infrastructure also enables efficient session management and secure self-custody, enhancing both convenience and control. By leveraging these features, Candor significantly lowers barriers for new users, creating a Web3 experience that feels as intuitive as Web2.
This integration highlights Biconomy’s potential to simplify blockchain interactions while driving real-world impact, aligning perfectly with Candor’s mission to make philanthropy effortless and transparent.

- NounsDAO - As a public good aligned with its mission to democratize access and uplift grassroots initiatives, Candor's focus on charitable endeavors seamlessly integrates with Nouns' ethos as a community-owned brand. The synergy is reflected in the UI/UX, where Nouns art, avatars, and animations create an engaging, giving-centric theme that perfectly complements Candor’s vision of a world of giving and fairness.

- Chainlink - Chainlink CCIP powers Candor by enabling secure, seamless cross-chain donations. With CCIP, users can contribute assets from any blockchain creating a borderless donation platform that expands accessibility and trust, abstracting any unnecessary cross-chain operations required.
This integration ensures real-time token transfers and messaging, simplifying fund distribution and breaking down liquidity barriers. By leveraging Chainlink's secure infrastructure, Candor highlights the transformative potential of blockchain to drive scalable, transparent solutions for global philanthropy.

- Nillion - Nillion's encrypted storage is used as a persistent and encrypted storage for sensitive Biconomy session data without worrying about database redundancy or maintaining across-globe peer connections. These services need to be reliable while maintaining user privacy as the stored credentials have the potential to execute any permissions granted by the user. By hacking with the schema of the key-value pair, we also managed to create a distributed locking mechanism that theoretically allows services to be executed concurrently.

- 1Inch - Candor utilises 1Inch Swap Aggregator V6 to enable multi-asset acceptance for donation, as non-base currency assets (not USDC) will be instantly swapped to the base currency within in the donate transaction.

- Base - Base's scalable and cost-effective L2 empowers Candor to enable transparent, verifiable cross-token donations and efficient pledge attestations. By leveraging Base’s low fees, Ethereum security, and an inituitive embedded UI, we make charitable giving accessible and trackable for everyday users. This integration enhances our loyalty systems and social scoring, fostering recurring engagement from verified users, while showcasing the real-world potential of decentralized applications.
Polygon - Candor leverages Polygon PoS to redefine social good through transparent, verifiable donations and efficient pledge attestations. By addressing real-world challenges, such as ensuring fair fund distribution and incentivizing recurring engagement, Candor uses Polygon’s scalability and low fees to maximize impact and accessibility.
For user onboarding, Candor integrates a seamless experience with features like social logins, gasless transactions, and one-click interactions. These innovations lower entry barriers for new users, making Web3 technology approachable while driving social and environmental impact. With Polygon, Candor combines ease of use with a mission for global good.

- Mantle - By leveraging Mantle Network, Candor enhances its social impact through innovative on-chain gamification. Mantle's scalable Layer 2 infrastructure powers Candor's loyalty system, incorporating features like social scoring, leaderboards, and engaging rewards to incentivize recurring participation in social pledges.
This integration aligns with Mantle’s vision for gaming and social projects by turning charitable giving into a more interactive and rewarding experience. By combining transparency with gamified mechanics, Candor demonstrates how Mantle’s advanced technology can drive both user engagement and meaningful real-world impact.

- Celo - Candor leverages Celo's mobile-first blockchain to provide a low-cost, accessible platform for charitable donations in emerging markets. By integrating Celo’s Ethereum Layer-2 solution, Candor enables seamless mobile donations with low fees and no complex crypto processes.
This integration simplifies global giving, allowing non-crypto native users to easily contribute and track pledges and driving social impact in underserved regions.
