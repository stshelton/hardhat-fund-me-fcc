const { assert, expect } = require("chai")
const { deployments, ethers, getNamedAccounts } = require("hardhat")
const { devChains } = require("../../helper-hardhat-config")

!devChains.includes(network.name)
    ? describe.skip
    : describe("FundMe", async function() {
          let fundMe
          let deployer
          let mockV3Aggreagtor
          //const sendValue = "1000000000000000000" // 1 ETH
          const sendValue = ethers.utils.parseEther("1") //easier way to create 1eth which really is ^
          beforeEach(async function() {
              deployer = (await getNamedAccounts()).deployer
              //deploy our fund me contract
              //using hardhat deploy
              await deployments.fixture(["all"])
              //getting most recent fundme contract
              fundMe = await ethers.getContract("FundMe", deployer)
              mockV3Aggreagtor = await ethers.getContract(
                  "MockV3Aggregator",
                  deployer
              )
          })

          //test to just test constructor of fundme
          describe("constructor", async function() {
              it("sets the aggregator address correctly", async function() {
                  const response = await fundMe.getPriceFeed()
                  //checking to see if price feed is the same as mockV3Aggreagtor when testing locally
                  assert.equal(response, mockV3Aggreagtor.address)
              })
          })

          //test for fund function
          describe("fund", async function() {
              it("Failes if u dont send enough ETH", async function() {
                  //use expect with reveretd or reverted with when u expect the contract to fail
                  await expect(fundMe.fund()).to.be.revertedWith(
                      "Didnt send enough"
                  )
              })
              it("Update the amount funded data structure", async function() {
                  await fundMe.fund({ value: sendValue })
                  const response = await fundMe.getAddressToAmountFunded(
                      deployer
                  )

                  assert.equal(response.toString(), sendValue.toString())
              })
              it("adds getFunder to array of getFunder", async function() {
                  await fundMe.fund({ value: sendValue })
                  const funder = await fundMe.getFunder(0)

                  assert.equal(funder, deployer)
              })
          })

          //test for withdraw function
          describe("withDraw", async function() {
              //we need to fund contract to be able to with draw so do this in before each
              beforeEach(async function() {
                  await fundMe.fund({ value: sendValue })
              })

              it("withdraw ETH from a single founder", async function() {
                  //arrange
                  const startingFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  )
                  const startingDeployerBalance = await fundMe.provider.getBalance(
                      deployer
                  )
                  //act
                  const transactionResponse = await fundMe.withdraw()
                  const transactionReceipt = await transactionResponse.wait(1)

                  //within tranascation receipt contains gas price info
                  ///gas price is gotten from the effectiveGasPrice * gas used
                  const { gasUsed, effectiveGasPrice } = transactionReceipt
                  const totalGasCost = gasUsed.mul(effectiveGasPrice)

                  const endingFundMeBalacne = await fundMe.provider.getBalance(
                      fundMe.address
                  )
                  const endingDeployerBalance = await fundMe.provider.getBalance(
                      deployer
                  )
                  //assert
                  assert.equal(endingFundMeBalacne, 0)
                  //since balance is a BIGNumber object then we must use .add to add balance together
                  //also remember we need to calculate the gas price added on to
                  assert.equal(
                      startingFundMeBalance
                          .add(startingDeployerBalance)
                          .toString(),
                      endingDeployerBalance.add(totalGasCost).toString()
                  )
              })

              it("withdraw ETH from a single founder cheaper solution", async function() {
                  //arrange
                  const startingFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  )
                  const startingDeployerBalance = await fundMe.provider.getBalance(
                      deployer
                  )
                  //act
                  const transactionResponse = await fundMe.cheaperWithdraw()
                  const transactionReceipt = await transactionResponse.wait(1)

                  //within tranascation receipt contains gas price info
                  ///gas price is gotten from the effectiveGasPrice * gas used
                  const { gasUsed, effectiveGasPrice } = transactionReceipt
                  const totalGasCost = gasUsed.mul(effectiveGasPrice)

                  const endingFundMeBalacne = await fundMe.provider.getBalance(
                      fundMe.address
                  )
                  const endingDeployerBalance = await fundMe.provider.getBalance(
                      deployer
                  )
                  //assert
                  assert.equal(endingFundMeBalacne, 0)
                  //since balance is a BIGNumber object then we must use .add to add balance together
                  //also remember we need to calculate the gas price added on to
                  assert.equal(
                      startingFundMeBalance
                          .add(startingDeployerBalance)
                          .toString(),
                      endingDeployerBalance.add(totalGasCost).toString()
                  )
              })

              it("allows us to withdraw with multiple getFunder", async function() {
                  //arrange
                  const accounts = await ethers.getSigners()
                  //starting at 1 cz 0 is the deployer
                  for (var i = 1; i < accounts.size; i++) {
                      //need to call connect function to connect these accounts to contract
                      const fundMeConnectedContract = await fundMe.connect(
                          accounts[i]
                      )

                      await fundMeConnectedContract.fund({ value: sendValue })
                  }

                  const startingFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  )
                  const startingDeployerBalance = await fundMe.provider.getBalance(
                      deployer
                  )

                  //Act
                  const transactionResponse = await fundMe.withdraw()
                  const transactionReceipt = await transactionResponse.wait(1)

                  const { gasUsed, effectiveGasPrice } = transactionReceipt
                  const totalGasCost = gasUsed.mul(effectiveGasPrice)

                  const endingFundMeBalacne = await fundMe.provider.getBalance(
                      fundMe.address
                  )
                  const endingDeployerBalance = await fundMe.provider.getBalance(
                      deployer
                  )

                  //assert
                  assert.equal(endingFundMeBalacne, 0)
                  //since balance is a BIGNumber object then we must use .add to add balance together
                  //also remember we need to calculate the gas price added on to
                  assert.equal(
                      startingFundMeBalance
                          .add(startingDeployerBalance)
                          .toString(),
                      endingDeployerBalance.add(totalGasCost).toString()
                  )

                  //make sure that the getFunder are reset properly
                  await expect(fundMe.getFunder(0)).to.be.reverted

                  for (var i = 1; i < accounts.size; i++) {
                      assert.equal(
                          await fundMe.getAddressToAmountFunded(
                              accounts[i].address
                          ),
                          0
                      )
                  }
              })

              it("other accounts none owner accounts cannot withdraw", async function() {
                  //arrange
                  const accounts = await ethers.getSigners()
                  const testNoneOwnerAccount = await fundMe.connect(accounts[1])

                  //just basic reverted response, techniqaully this could be reverted for other reasons
                  //await expect(testNoneOwnerAccount.withdraw()).to.be.reverted
                  await expect(
                      testNoneOwnerAccount.withdraw()
                  ).to.be.revertedWithCustomError(fundMe, "FundMe__NotOwner")
              })

              it("cheaper Withdraw testing....", async function() {
                  //arrange
                  const accounts = await ethers.getSigners()
                  //starting at 1 cz 0 is the deployer
                  for (var i = 1; i < accounts.size; i++) {
                      //need to call connect function to connect these accounts to contract
                      const fundMeConnectedContract = await fundMe.connect(
                          accounts[i]
                      )

                      await fundMeConnectedContract.fund({ value: sendValue })
                  }

                  const startingFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  )
                  const startingDeployerBalance = await fundMe.provider.getBalance(
                      deployer
                  )

                  //Act
                  const transactionResponse = await fundMe.cheaperWithdraw()
                  const transactionReceipt = await transactionResponse.wait(1)

                  const { gasUsed, effectiveGasPrice } = transactionReceipt
                  const totalGasCost = gasUsed.mul(effectiveGasPrice)

                  const endingFundMeBalacne = await fundMe.provider.getBalance(
                      fundMe.address
                  )
                  const endingDeployerBalance = await fundMe.provider.getBalance(
                      deployer
                  )

                  //assert
                  assert.equal(endingFundMeBalacne, 0)
                  //since balance is a BIGNumber object then we must use .add to add balance together
                  //also remember we need to calculate the gas price added on to
                  assert.equal(
                      startingFundMeBalance
                          .add(startingDeployerBalance)
                          .toString(),
                      endingDeployerBalance.add(totalGasCost).toString()
                  )

                  //make sure that the s_getFunder are reset properly
                  await expect(fundMe.getFunder(0)).to.be.reverted

                  for (var i = 1; i < accounts.size; i++) {
                      assert.equal(
                          await fundMe.getAddressToAmountFunded(
                              accounts[i].address
                          ),
                          0
                      )
                  }
              })
          })

          // describe("receive function", async function() {
          //     it("didnt add data and failed because no eth was sent", async function() {
          //         fundMe.sendValue
          //         //use expect with reveretd or reverted with when u expect the contract to fail
          //         await expect(fundMe).to.be.revertedWith("Didnt send enough")
          //     })
          // })
      })
