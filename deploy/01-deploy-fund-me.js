//traditionally we do
//import
//main function
//calling of main function

const { network } = require("hardhat")

const { networkConfig, devChains } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")

require("dotenv").config()

//with hardhat deploy you dont need to create main function or call main function

//hre hard hat run time enviroment
// async function deployFunc(hre){
//     console.log("Hi!")
// }

// module.exports.default = deployFunc

//another way to write ^
// module.exports = async (hre) => {
//     const {getNamedAccounts, deployments} = hre
//hre.getNamedAccounts
//hre.deployments
module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    //get named accounts
    const { deployer } = await getNamedAccounts()
    const chainID = network.config.chainId

    //how to get feed address of chainID
    let ethUsdPriceFeedAddress
    if (devChains.includes(network.name)) {
        //if contact doesnt exist , we deploy a minimal verison of it for our local testing
        const ethUsdAggregator = await deployments.get("MockV3Aggregator")
        ethUsdPriceFeedAddress = ethUsdAggregator.address
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainID]["ethUsdPriceFeed"]
    }

    const args = [ethUsdPriceFeedAddress]

    //well what happens when we want to chanin chains?
    //when going for localhost or hardhat network we want to use a mock
    const fundMe = await deploy("FundMe", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1
    })

    if (!devChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        await verify(fundMe.address, args)
    }
    log("---------------------Fund Me-----------------------")
}

module.exports.tags = ["all", "fundme"]
