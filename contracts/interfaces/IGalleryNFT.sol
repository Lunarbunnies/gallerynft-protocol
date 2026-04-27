// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IGalleryNFT {
    struct GalleryFields {
        string title;
        string description;
        uint64 createdAt;
        uint64 updatedAt;
    }

    struct ItemData {
        bytes packedRef;
        uint64 addedAt;
        uint64 removedAt;
        uint32 displayOrder;
        string label;
        string note;
    }

    event GalleryCreated(uint256 indexed galleryId, address indexed owner);
    event GalleryFieldsUpdated(uint256 indexed galleryId, string title, string description);
    event ItemAdded(uint256 indexed galleryId, bytes32 indexed itemKey, bytes packedRef);
    event ItemFieldsUpdated(
        uint256 indexed galleryId,
        bytes32 indexed itemKey,
        uint32 displayOrder,
        string label,
        string note
    );
    event ItemRemoved(uint256 indexed galleryId, bytes32 indexed itemKey);

    function createGallery(string calldata title, string calldata description) external returns (uint256 galleryId);

    function setGalleryFields(uint256 galleryId, string calldata title, string calldata description) external;

    function addItem(
        uint256 galleryId,
        bytes calldata packedRef,
        uint32 displayOrder,
        string calldata label,
        string calldata note
    ) external returns (bytes32 itemKey);

    function updateItemFields(
        uint256 galleryId,
        bytes32 itemKey,
        uint32 displayOrder,
        string calldata label,
        string calldata note
    ) external;

    function removeItem(uint256 galleryId, bytes32 itemKey) external;

    function getGallery(uint256 galleryId)
        external
        view
        returns (
            string memory title,
            string memory description,
            uint64 createdAt,
            uint64 updatedAt,
            address owner
        );

    function getGalleryFields(uint256 galleryId) external view returns (GalleryFields memory);

    function getGalleryItems(uint256 galleryId) external view returns (bytes32[] memory itemKeys);

    function getItem(uint256 galleryId, bytes32 itemKey) external view returns (ItemData memory item);

    function getItemFields(uint256 galleryId, bytes32 itemKey)
        external
        view
        returns (uint32 displayOrder, string memory label, string memory note);

    function getItemPackedRef(uint256 galleryId, bytes32 itemKey) external view returns (bytes memory packedRef);

    function getItemStatus(uint256 galleryId, bytes32 itemKey)
        external
        view
        returns (uint64 addedAt, uint64 removedAt, bool isActive);

    function getItems(uint256 galleryId, bytes32[] calldata itemKeys) external view returns (ItemData[] memory items);

    function getItemFieldsBatch(uint256 galleryId, bytes32[] calldata itemKeys)
        external
        view
        returns (uint32[] memory displayOrders, string[] memory labels, string[] memory notes);
}
