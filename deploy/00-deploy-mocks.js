const { network } = require("hardhat")
const {
    devChains,
    DECIMALS,
    INITIAL_ANSWER
} = require("../helper-hardhat-config")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    //get named accounts
    const { deployer } = await getNamedAccounts()
    const chainID = network.config.chainId

    //only deploy mock contract in local enivorment
    if (devChains.includes(network.name)) {
        log("Local network detected! deploying mocks....")
        await deploy("MockV3Aggregator", {
            constract: "MockV3Aggregator",
            from: deployer,
            log: true,
            args: [DECIMALS, INITIAL_ANSWER]
        })

        log("Mocks deployed!")
        log("----------------------------------------------------------")
    }
}

//how to run only deploy mock script
//yarn hardhat deploy --tags mocks
module.exports.tags = ["all", "mocks"]
