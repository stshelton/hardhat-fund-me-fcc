const { getNamedAccounts, ethers } = require("hardhat")

//use to fund withing local enviroment
//create node
// then run script on --network local
async function main() {
    const { deployer } = await getNamedAccounts()
    const fundMe = await ethers.getContract("FundMe", deployer)
    console.log("withDrawing....")
    const transactionResponse = await fundMe.withdraw()

    await transactionResponse.wait(1)
    console.log("Got it back!!!!")
}

main().catch(error => {
    console.error(error)
    process.exitCode = 1
})
