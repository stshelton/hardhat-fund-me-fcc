//SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

//createing a library that we attach to uint256
//libarys cant have state values or transfer ether
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

//pretty sure this is a protocol
//theres a better way then copy and pasting interfaces
// We could import the file or we could import it directly from github
// interface AggregatorV3Interface {
//   function decimals() external view returns (uint8);

//   function description() external view returns (string memory);

//   function version() external view returns (uint256);

//   function getRoundData(uint80 _roundId)
//     external
//     view
//     returns (
//       uint80 roundId,
//       int256 answer,
//       uint256 startedAt,
//       uint256 updatedAt,
//       uint80 answeredInRound
//     );

//   function latestRoundData()
//     external
//     view
//     returns (
//       uint80 roundId,
//       int256 answer,
//       uint256 startedAt,
//       uint256 updatedAt,
//       uint80 answeredInRound
//     );
// }
