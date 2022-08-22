const { getNamedAccounts, ethers, network } = require("hardhat")
const { devChains } = require("../../helper-hardhat-config")
const { assert, expect } = require("chai")

//tests on a testnet
//Only run this if we not on dev chain
devChains.includes(network.name)
    ? describe.skip
    : describe("FundMe", async function() {
          let fundMe
          let deployer
          const sendValue = ethers.utils.parseEther("1")
          beforeEach(async function() {
              deployer = (await getNamedAccounts()).deployer
              fundMe = await ethers.getContract("FundMe", deployer)
              //do need to deploy cz we assuiming its already deployed to test net
          })

          it("allows people to fund and withdraw", async function() {
              await fundMe.fund({ value: sendValue })
              await fundMe.withDraw()
              const endingBalance = await fundMe.provider.getBalance(
                  fundMe.address
              )

              assert.equal(endingBalance.toString(), "0")
          })
      })
