# Fund Me Notes


## Transactions

A transaction is a transfer of value on the blockchain. In very simple terms, a transaction is when one person gives a designated amount of cryptocurrency they own to another person.

All transactions are sent with data. The data withing a transacations consist of

1) `Nonce` - tx count for the account
2) `Gas Price` - price per unit of gas (in wei)
3) `Gas Limit` - 21000 (current block gas limit)
4) `To` - address that the tx is sent to
5) `Value` - amount of wei to send
6) `Data` - what to send to  the address used to call functions
7) `v,r,s` - components of tx signature

## Transaction Properties
`msg` - gives u access to some of the transaction data

`msg.data` (bytes calldata) - complete calldata

`msg.sender` (address) - sender of the message (current call)

`msg.sig` (bytes4) - first four bytes of the calldata (i.e. function identifier)

`msg.value` (uint) - number of wei sent with the message


## Function Modifiers 

`pure` - Disallows modification or access of state.

`view` - Disallows modification of state.

`payable` - Allows them to receive Ether together with a call.

`virtual` - Allows the function’s or modifier’s behaviour to be changed in derived contracts.

`override` - States that this function, modifier or public state variable changes the behaviour of a function or modifier in a base contract.

Fund is now a payable function allowing users to send money to the smart contract.

Smart Contracts are like wallets they can hold funds
```
 function fund() public payable {}
```

## Basic Error Handling

Solidity uses state-reverting exceptions to handle errors.

`Reverts` - undoes any action that happens before revert called and sends rest of gas back

In this example you need to send more then one 1 eth for fund to work. If not function will be reverted and gas fees will be sent back
```
function fund() public payable {
    require(msg.value > 1e18, "Didnt send enough!")
}
```

## Interfaces

An interface gives us that minimalistic ABI to interact with contracts outside of our project.

When u combined these compiled interfaces with an address, we can call the functions on that interface on that contract. 

You can add an interface by directly copying the interface code like so:

```
interface AggregatorV3Interface {
  function decimals() external view returns (uint8);

  function description() external view returns (string memory);

  function version() external view returns (uint256);

  function getRoundData(uint80 _roundId)
    external
    view
    returns (
      uint80 roundId,
      int256 answer,
      uint256 startedAt,
      uint256 updatedAt,
      uint80 answeredInRound
    );

  function latestRoundData()
    external
    view
    returns (
      uint80 roundId,
      int256 answer,
      uint256 startedAt,
      uint256 updatedAt,
      uint80 answeredInRound
    );
}

```

or by adding it as a npm/yarn package then importing at the top of the file like so:

```
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
```


## Library

Libraries are similar to contracts, but you can't declare any state variable and you can't send ether.

A library is embedded into the contract if all library functions are internal.

Otherwise the library must be deployed and then linked before the contract is deployed.

We can also use libraries to add more functionality to different values such as uint256 or string

```
library PriceConverter {

    //get eth convertion rate
    function getPrice(AggregatorV3Interface priceFeed)
        internal
        view
        returns (uint256)
    {
        //latest round data returns a tuple check interface below
        (
            ,
            int256 price, //uint80 answeredInRound
            ,
            ,

        ) = priceFeed.latestRoundData();
        //currently the msg.value is to the 18th decimal while price is to the 8th
        //so convert price to the same decimal and covert price to a uint by type casting
        return uint256(price * 1e10); // 1**10 == 10000000000
    }

    //Example
    //ethPrice = 3000_000000000000000000
    //ethAmount = 1_000000000000000000
    function getConversionRate(
        uint256 ethAmount,
        AggregatorV3Interface priceFeed
    ) internal view returns (uint256) {
        uint256 ethPrice = getPrice(priceFeed);
        //need to devide by 1e18 because without it decimal will be to the 36 place
        uint256 ethAmountInUsd = (ethPrice * ethAmount) / 1e18;
        return ethAmountInUsd;
    }
}
```
you can attach a library to a type like so:

```
//Type declarations
//how to attach a library to a type
using PriceConverter for uint256;
```

When using a library the first parameter is always the object that it was called on. And u dont have to pass it gets passed implicitly.

```
msg.value.getConversionRate(s_priceFeed)
```
With the above example value gets passed as first parameter and s_priceFeed as second parameter


## Withdraw funds from contract

There are three wahys to withdraw funds

1) `transfer` - (capped 2300 gas, throws error) If more gas is used it errors and reverts

to transfer to address we need to type cast address to a payable address. because msg.sender is an address type
```
payable(msg.sender).transfer(address(this).balance);
```

2) `send` - (capped at 2300 gas, returns bool) if more gas is used it just returns a boolean

```
bool sendSuccess = payable(msg.sender).send(address(this).balance)
//since it just returns a boolean u have to revert call
require(sendSuccess, "Send failed")
```

3) `call` - (forward all gas or set gas, returns bool)

the ("") at the end of call is used to send data to a function. then the function returns a tuple with a boolean to see if it succeed and bytes which could be data the function returns

call in combination with re-entrancy guard is the recommended method to use after December 2019.

```
(bool callSuccess, bytes memory dataReturned) = payable(msg.sender).call{value: address(this).balance}("")
require(callSuccess, "Send failed")
```

## Add security to allow only the owner to interact with a function

1)  you could set owner in the constructor to msg.sender. Then use require to check if sender is owner.
```
constructor(){
    owner = msg.sender
}

function withdraw() public  {
    require(msg.sender == owner, "Sender is not owner")
}
```

2) Lets say alot of functions need this require. Instead of coppying and pasting it everywhere u can create a modifier. Which can be added to the function declartion to modify the function with that functionality.


```
modifier onlyOwner() {
    //require(msg.sender == i_owner,  "Sneder is not the owner!");
    // _; tell function to run code if passes require
    //if u want to save more gas prices. u can create custom errors like so
    if (msg.sender != i_owner) {
        revert FundMe__NotOwner();
    }
        _;
    }

function withdraw() public onlyOwner  {}

```

## Some basics on how to save gas

Using constant and immutable keywords to variables can help save gas!!

`Constant` - is a variable that connot be mofified after the contract has been constructed. And has to be assigned where the variable is declared

`Naming Convention` - AllCaps with "_" for spaces `MINIMUM_USD`

Current gas fee without specifying that this variable is a constant
`832731 wei`
```
uint256 public minimumUsd = 50 * 1e18;
```
Gas fee with constant key word `812591 wei`
```
uint256 public constant MINIMUM_USD = 50 * 1e18;
```

`Immutable` - Variables declared as immutable are a bit less restricted than those declared as constant: Immutable variables can be assigned an arbitrary value in the constructor of the contract or at the point of their declaration. They can be assigned only once and can, from that point on, be read even during construction time.

`Naming Convention` - prefix variable with i_

Current gas fee without immutable `23641 gas`
```
address private owner;
```
Gas fee while using immutable `21508 gas`
```
address private immutable i_owner;
constructor() {
    i_owner = msg.sender;
}
```

Another way of saving gas is to change error handling from using strings to creating custom errors

Previously for your error handling you could use a require and return a string when condition is not met.

But this string increase gas cz its more expensive then a custom error

```
require(msg.sender == i_owner, "sender is not the owner!")
```
instead of storing that entire string you know store the custom error as a 0x001231
```
//Erros
error FundMe__NotOwner();
 if (msg.sender != i_owner) {
    revert FundMe__NotOwner();
}
```

## Receive and fallback

Sometimes people will interact with contract but without calling functions within contract. So what happens then?

Use receive and fallback functions to catch these interactions.

`receive` - The receive function is executed on a call to the contract with empty calldata.

So now we can catch if someone sends to the contract without call data and save there info
```
receive() external payable {
     fund();
}
```

`fallback` - The fallback function is executed on a call to the contract if none of the other functions match the given function signature. There sending call data but doesnt match a function within contract
```
fallback() external payable {
     fund();
}
```