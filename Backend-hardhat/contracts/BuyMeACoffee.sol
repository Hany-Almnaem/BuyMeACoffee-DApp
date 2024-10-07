// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;
//contract on Etherscan: https://sepolia.etherscan.io/address/0xE0F79B20FeFf300C7Ad5170CE3fEFE535E016835#code
//BuyMeACoffee deployed to: 0xE0F79B20FeFf300C7Ad5170CE3fEFE535E016835.
contract BuyMeACoffee {
    // Event emitted when a new memory is created
    event NewMemory(
        address indexed from,
        uint256 timestamp,
        string name,
        string message,
        uint256 tipAmount
    );

    // Memory structure to store tip details
    struct Memory {
        address from;
        uint256 timestamp;
        string name;
        string message;
        uint256 tipAmount;
    }

    // Array of all memos received
    Memory[] private memos;

    // Address of the contract owner
    address payable public owner;

    // Constructor that sets the initial contract owner
    constructor() {
        owner = payable(msg.sender);
    }

    // Function to allow users to buy a coffee by sending Ether
    function buyCoffee(string memory _name, string memory _message) public payable {
        require(msg.value > 0, "You must send some ether");

        // Create a new memory and store it in the array
        memos.push(Memory({
            from: msg.sender,
            timestamp: block.timestamp,
            name: _name,
            message: _message,
            tipAmount: msg.value
        }));

        // Emit the NewMemory event
        emit NewMemory(msg.sender, block.timestamp, _name, _message, msg.value);
    }

    // New function to buy a larger coffee with a fixed tip amount
    function buyLargeCoffee(string memory _name, string memory _message) public payable {
        require(msg.value >= 0.003 ether, "You must send at least 0.003 ether for a large coffee");

        // Create a new memory and store it in the array
        memos.push(Memory({
            from: msg.sender,
            timestamp: block.timestamp,
            name: _name,
            message: _message,
            tipAmount: msg.value
        }));

        // Emit the NewMemory event
        emit NewMemory(msg.sender, block.timestamp, _name, _message, msg.value);
    }

    // Allows the owner to withdraw all funds
    function withdrawFunds() public {
        require(msg.sender == owner, "Only the owner can withdraw funds");
        require(owner.send(address(this).balance), "Withdrawal failed");
    }

    // Allows the owner to update the withdrawal address
    function updateWithdrawalAddress(address payable _newOwner) public {
        require(msg.sender == owner, "Only the owner can update the withdrawal address");
        owner = _newOwner;
    }

    // Get the count of all memos stored on-chain
    function getMemoCount() public view returns (uint256) {
        return memos.length;
    }

    // Get a single memo by its index
    function getMemoByIndex(uint256 index) public view returns (address from, uint256 timestamp, string memory name, string memory message, uint256 tipAmount) {
        require(index < memos.length, "Index out of bounds");
        Memory storage memo = memos[index];

        return (memo.from, memo.timestamp, memo.name, memo.message, memo.tipAmount);
    }

    // Get a paginated list of memos, specifying the start and end indices
    function getMemosPaginated(uint256 startIndex, uint256 endIndex) public view returns (Memory[] memory) {
        require(startIndex >= 0 && endIndex >= startIndex, "Invalid index range");
        require(endIndex < memos.length, "Index out of bounds");

        // Create a temporary array to store the paginated memos
        Memory[] memory paginatedMemos = new Memory[](endIndex - startIndex + 1);

        for (uint256 i = startIndex; i <= endIndex; i++) {
            paginatedMemos[i - startIndex] = memos[i];
        }

        return paginatedMemos;
    }

    // Retrieve all memos at once (not recommended for large datasets)
    function getAllMemos() public view returns (Memory[] memory) {
        return memos;
    }
}
//0x5FbDB2315678afecb367f032d93F642f64180aa3
