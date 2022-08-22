//SPDX-License-Identifier: MIT
//Pragma
pragma solidity ^0.8.9;

//Imports
import "./PriceConverter.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
//if youd like to use console in solidity import hardhat/console.sol
import "hardhat/console.sol";

//Erros
error FundMe__NotOwner();

//another way to save gas fees is update requires to reverts
//requires are more expensive cz we storing the message string on chain

//intercafes, libries, contracts

//Get funds from user
//Withdraw funds
//Set a minimum funding value
// gas price = 832731

//when adding these comments we can use solc to auto generate docs
/** @title A contract for crowd funcing
 *  @author Spencer Shelton
 *  @notice this contact is to demo a sample funding contract
 *  @dev This implements price feeds as our library
 */
contract FundMe {
    //Type declarations
    //how to attach a library to a type
    using PriceConverter for uint256;

    //State Variables
    //gas price before constant = 832731
    //how do we lower gas prices
    //constant, immutable
    //since this is assigned during compile time
    //gas price after constant =  812591
    uint256 public constant MINIMUM_USD = 50 * 1e18; // 1 * 10^18

    //prefix immutable variables with i_
    //variables that arent init in same line but only set once we can set immutable to save gas prices
    //21508 gas - immutable
    //23641 gas - without immutable
    //another way to save gas prices is making variables private
    address private immutable i_owner;

    //prefix stored variables with s to indicate that they are stored (Stored variables take up hella gas)
    //when people send money we wanna keep track of who sent money
    address[] private s_funders;
    //make a mapping address to find out how much money each person sent
    mapping(address => uint256) private s_addressToAmountFunded;

    AggregatorV3Interface private s_priceFeed;

    //Modifers
    modifier onlyOwner() {
        //require(msg.sender == i_owner,  "Sneder is not the owner!");
        // _; tell function to run code if passes require
        //if u want to save more gas prices. u can create custom errors like so
        if (msg.sender != i_owner) {
            revert FundMe__NotOwner();
        }
        _;
    }

    //using constructor to set up contract when contract is created
    //pass in block chaing address for chainlink data feeds for price of current block chain
    constructor(address priceFeedAddress) {
        s_priceFeed = AggregatorV3Interface(priceFeedAddress);
        //in this case the sender is the person who deployed the contract
        i_owner = msg.sender;
    }

    //what happens if someone sends this contract ETH without calling the fund function

    // receive()
    // fallback()

    //now if someone sends eth without specify data (Aka using functions) this function will be called which calls are fund() function
    // receive() external payable {
    //     fund();
    // }

    // fallback() external payable {
    //     fund();
    // }

    //add payable if you want to be able to send money to contract
    /**
     *  @notice this function funds this contract
     *  @dev This implements price feeds as our library
     */
    function fund() public payable {
        //want to be able to set a minimum fund amount
        //1. how do we send ETH to this contract
        //msg is how u get access to the data sent with transaction(value being sent, public key ect.)
        //msg.value is the value in native blockchain that was sent with transaction (for eth it be wei)
        //msg.sender is the address of user that sent transaction

        //if statement if user didnt send 1 eth then exit function and REVERT (undoes action and sends gas back)
        //require(msg.value > 1e18, "Didnt send enough"); // 1e18 == 1 * 10 ** 18 == 1000000000000000000

        //problem value is eth how do we convert it to USD, Chainlink and blockchain oracle is how you do it
        //Problem blockchain can not access the outside world for data, if blockchain did many nodes could receive different values which would then mess up the Consensus
        //blockchain oracle is anything that communicates with outside world, although we cant use a centralized node to get this data
        //chainlink is the solution, a decentrialized oracle network that brings data from outside world to contracts
        //require(getConversionRate(msg.value) >= MINIMUM_USD, "Didnt Send enough!");
        //why arent we passing msg.value into parameter of getConversionRate(). Because the first parameter will be the msg.value
        console.log(msg.value.getConversionRate(s_priceFeed));
        console.log(MINIMUM_USD);
        require(
            msg.value.getConversionRate(s_priceFeed) >= MINIMUM_USD,
            "Didnt send enough"
        );
        s_funders.push(msg.sender);
        s_addressToAmountFunded[msg.sender] = msg.value;
    }

    //we want to be able to withdraw
    //right now everyone can withdraw
    //how do we set this up so only the owner of the contract can call the withdraw function
    function withdraw() public onlyOwner {
        //this is how we check to see if sender is owner of contract so only owner can call contract
        //require(msg.sender == owner, "Sender is not owner");
        //lets say we need this require everywhere this is where modifier comes in

        //starting index , ending index , step amount
        // if u notice the saved value of funders is read alot which requires alot of gas fee to read
        for (
            uint256 funderIndex = 0;
            funderIndex < s_funders.length;
            funderIndex++
        ) {
            //code
            address funder = s_funders[funderIndex];
            s_addressToAmountFunded[funder] = 0;
        }
        //reset array parathesis how many to start array with
        s_funders = new address[](0);
        //withdraw funds 3 different ways: transfer, send, cell

        // //transfer- capped at 2300 gas, if hit reverts contract
        // //msg.sender is an address to be able to send to addres we need to typecast to payable type
        // //address(this) gets current address of contract
        // payable(msg.sender).transfer(address(this).balance);

        // //send - capped at 2300 gas, if hit returns a boolean
        // bool sendSuccess = payable(msg.sender).send(address(this).balance);
        // //use require to check success boolean from send
        // require(sendSuccess, "Send Failed");

        //call - lower level command, can be used to call virtually any function in all of eth. without abi
        //doenst have a cap for gas
        //using call is the recommonded way to send native blockcahin tokens
        (bool callSuccess, ) = payable(msg.sender).call{
            value: address(this).balance
        }("");
        require(callSuccess, "Call failed");
    }

    function cheaperWithdraw() public payable onlyOwner {
        //SOOO how do we make this a cheaper function
        //right now s_funders is saved in storage (aka expensive as hell to use)
        //to fix this issue is read from storage only once and store what was read within memory
        //like so
        address[] memory m_funders = s_funders;
        //Note: mappings can not be saved in memmory yet Sorry!

        // if u notice the saved value of funders is read alot which requires alot of gas fee to read
        for (
            uint256 funderIndex = 0;
            funderIndex < m_funders.length;
            funderIndex++
        ) {
            address funder = m_funders[funderIndex];
            s_addressToAmountFunded[funder] = 0;
        }

        s_funders = new address[](0);
        (bool callSuccess, ) = payable(msg.sender).call{
            value: address(this).balance
        }("");
        require(callSuccess, "Call failed");
    }

    //since we moved owner variable to private create getter functions so it can still be accessed
    //doing this to also help development so developers dont have to refer to everything as s_ or i_
    function getOwner() public view returns (address) {
        return i_owner;
    }

    function getFunder(uint256 index) public view returns (address) {
        return s_funders[index];
    }

    function getAddressToAmountFunded(address funder)
        public
        view
        returns (uint256)
    {
        return s_addressToAmountFunded[funder];
    }

    function getPriceFeed() public view returns (AggregatorV3Interface) {
        return s_priceFeed;
    }
}
