// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

library PackedRef {
    function itemKey(bytes memory packedRef) internal pure returns (bytes32) {
        require(packedRef.length > 0, "PackedRef: empty");
        return keccak256(packedRef);
    }
}
