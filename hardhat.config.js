require("@nomicfoundation/hardhat-toolbox")
//how to access .env file
require("dotenv").config()
//how to access etherscan to verify contract progromatically
require("@nomiclabs/hardhat-etherscan")
//custom task built in tasks folder
require("./tasks/block-number")
require("./tasks/accounts")
//hard hat gas reporter plugib
require("hardhat-gas-reporter")
//plugin that helps identify if there are tests made for all functions in contract
require("solidity-coverage")
//better way to deploy contract instead of creating deploy script. better testing
require("hardhat-deploy")

const RINKEBY_RPC_URL = process.env.RINKEBY_RPC_URL
const PRIVATE_KEY = process.env.PRIVATE_KEY
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY
const COINMARKCAP_API_KEY = process.env.COINMARKETCAP_API_KEY

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    //how to compile mutliple differnet solidity versions
    solidity: {
        compilers: [{ version: "0.8.9" }, { version: "0.8.0", settings: {} }]
    },

    // hard hat network defaulty resetarts node on every call
    //if youd like to start a node that stays alive call yard hardhat node
    defaultNetwork: "hardhat",
    networks: {
        rinkeby: {
            url: RINKEBY_RPC_URL,
            accounts: [PRIVATE_KEY],
            chainId: 4,
            //if we want to wait for certain amount of blocks add
            blockConfirmations: 6
        },
        //techniqually when creating your own node its not running off the hardhat default deploy
        //yet it does still have the same chain id
        localHost: {
            url: "http://127.0.0.1:8545/",
            //why no accounts you may be asking well hardhat does it for us
            chainId: 31337
        }
    },
    solidity: "0.8.9",
    etherscan: {
        apiKey: ETHERSCAN_API_KEY
    },
    //harhat gas reporter
    //to just have it print in console just add enabled
    //if youd like to output it to a file add outputFile
    // if you want it to be in usd we need to get a coinmarketcap api key
    gasReporter: {
        enabled: true,
        outputFile: "gas-report.txt",
        noColors: true,
        currency: "USD",
        coinmarketcap: COINMARKCAP_API_KEY,
        //change block chain to see gas prices
        token: "ETH"
    },
    //this is how u create like "names/variables" for accounts
    namedAccounts: {
        deployer: {
            default: 0,
            1: 0
        },
        user: {
            default: 1
        }
    }
}
