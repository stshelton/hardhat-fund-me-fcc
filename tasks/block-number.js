const { task } = require("hardhat/config")

task("block-number", "Prints the current block number").setAction(
    //function without writing function using =>
    //hre: hardhat run time enviroment (hre has similar stuff as imporint it with const { ethers, run, network } = require("hardhat"))
    async (taskArgs, hre) => {
        const blockNumber = await hre.ethers.provider.getBlockNumber()
        console.log(`Current block number: ${blockNumber}`)
    }
)
