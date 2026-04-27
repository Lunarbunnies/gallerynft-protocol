// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {PackedRef} from "./libraries/PackedRef.sol";
import {IGalleryNFT} from "./interfaces/IGalleryNFT.sol";

contract GalleryNFT is ERC721, IGalleryNFT {
    using PackedRef for bytes;

    uint256 public nextGalleryId = 1;

    mapping(uint256 => bool) private _galleryExists;
    mapping(uint256 => GalleryFields) private _galleries;
    mapping(uint256 => mapping(bytes32 => ItemData)) private _items;
    mapping(uint256 => mapping(bytes32 => bool)) private _hasItem;
    mapping(uint256 => bytes32[]) private _galleryItemKeys;

    error NotGalleryController();
    error GalleryNotFound();
    error ItemNotFound();
    error ItemAlreadyActive();
    error ItemAlreadyRemoved();

    constructor(string memory name_, string memory symbol_) ERC721(name_, symbol_) {}

    modifier onlyGalleryController(uint256 galleryId) {
        if (!_galleryExists[galleryId]) revert GalleryNotFound();
        if (!_isGalleryController(_msgSender(), galleryId)) revert NotGalleryController();
        _;
    }

    function createGallery(
        string calldata title,
        string calldata description
    ) external returns (uint256 galleryId) {
        galleryId = nextGalleryId;
        nextGalleryId = galleryId + 1;

        _safeMint(_msgSender(), galleryId);
        _galleryExists[galleryId] = true;

        uint64 nowTs = uint64(block.timestamp);
        _galleries[galleryId] = GalleryFields({
            title: title,
            description: description,
            createdAt: nowTs,
            updatedAt: nowTs
        });

        emit GalleryCreated(galleryId, _msgSender());
        emit GalleryFieldsUpdated(galleryId, title, description);
    }

    function setGalleryFields(
        uint256 galleryId,
        string calldata title,
        string calldata description
    ) external onlyGalleryController(galleryId) {
        GalleryFields storage g = _galleries[galleryId];
        g.title = title;
        g.description = description;
        g.updatedAt = uint64(block.timestamp);

        emit GalleryFieldsUpdated(galleryId, title, description);
    }

    function addItem(
        uint256 galleryId,
        bytes calldata packedRef,
        uint32 displayOrder,
        string calldata label,
        string calldata note
    ) external onlyGalleryController(galleryId) returns (bytes32 itemKey) {
        itemKey = packedRef.itemKey();
        ItemData storage item = _items[galleryId][itemKey];

        if (_hasItem[galleryId][itemKey]) {
            if (item.removedAt == 0) revert ItemAlreadyActive();
            item.removedAt = 0;
            item.displayOrder = displayOrder;
            item.label = label;
            item.note = note;
        } else {
            _hasItem[galleryId][itemKey] = true;
            _galleryItemKeys[galleryId].push(itemKey);

            item.packedRef = packedRef;
            item.addedAt = uint64(block.timestamp);
            item.removedAt = 0;
            item.displayOrder = displayOrder;
            item.label = label;
            item.note = note;
        }

        _galleries[galleryId].updatedAt = uint64(block.timestamp);

        emit ItemAdded(galleryId, itemKey, packedRef);
        emit ItemFieldsUpdated(galleryId, itemKey, displayOrder, label, note);
    }

    function updateItemFields(
        uint256 galleryId,
        bytes32 itemKey,
        uint32 displayOrder,
        string calldata label,
        string calldata note
    ) external onlyGalleryController(galleryId) {
        if (!_hasItem[galleryId][itemKey]) revert ItemNotFound();

        ItemData storage item = _items[galleryId][itemKey];
        if (item.removedAt != 0) revert ItemAlreadyRemoved();

        item.displayOrder = displayOrder;
        item.label = label;
        item.note = note;

        _galleries[galleryId].updatedAt = uint64(block.timestamp);

        emit ItemFieldsUpdated(galleryId, itemKey, displayOrder, label, note);
    }

    function removeItem(uint256 galleryId, bytes32 itemKey) external onlyGalleryController(galleryId) {
        if (!_hasItem[galleryId][itemKey]) revert ItemNotFound();

        ItemData storage item = _items[galleryId][itemKey];
        if (item.removedAt != 0) revert ItemAlreadyRemoved();

        item.removedAt = uint64(block.timestamp);
        _galleries[galleryId].updatedAt = uint64(block.timestamp);

        emit ItemRemoved(galleryId, itemKey);
    }

    function getGallery(
        uint256 galleryId
    ) external view returns (string memory, string memory, uint64, uint64, address) {
        if (!_galleryExists[galleryId]) revert GalleryNotFound();
        GalleryFields memory g = _galleries[galleryId];
        return (g.title, g.description, g.createdAt, g.updatedAt, ownerOf(galleryId));
    }

    function getGalleryFields(uint256 galleryId) external view returns (GalleryFields memory) {
        if (!_galleryExists[galleryId]) revert GalleryNotFound();
        return _galleries[galleryId];
    }

    function getGalleryItems(uint256 galleryId) external view returns (bytes32[] memory itemKeys) {
        if (!_galleryExists[galleryId]) revert GalleryNotFound();

        bytes32[] memory all = _galleryItemKeys[galleryId];
        uint256 activeCount = 0;

        for (uint256 i = 0; i < all.length; i++) {
            if (_items[galleryId][all[i]].removedAt == 0) activeCount++;
        }

        itemKeys = new bytes32[](activeCount);

        uint256 ptr = 0;
        for (uint256 i = 0; i < all.length; i++) {
            if (_items[galleryId][all[i]].removedAt == 0) {
                itemKeys[ptr] = all[i];
                ptr++;
            }
        }

        // Stable insertion-sort by effective order:
        // displayOrder > 0 ? displayOrder : addedAt
        for (uint256 i = 1; i < itemKeys.length; i++) {
            bytes32 key = itemKeys[i];
            uint256 j = i;
            while (j > 0 && _effectiveOrder(galleryId, key) < _effectiveOrder(galleryId, itemKeys[j - 1])) {
                itemKeys[j] = itemKeys[j - 1];
                j--;
            }
            itemKeys[j] = key;
        }
    }

    function getItem(uint256 galleryId, bytes32 itemKey) external view returns (ItemData memory item) {
        if (!_galleryExists[galleryId]) revert GalleryNotFound();
        if (!_hasItem[galleryId][itemKey]) revert ItemNotFound();
        return _items[galleryId][itemKey];
    }

    function getItemFields(
        uint256 galleryId,
        bytes32 itemKey
    ) external view returns (uint32 displayOrder, string memory label, string memory note) {
        if (!_galleryExists[galleryId]) revert GalleryNotFound();
        if (!_hasItem[galleryId][itemKey]) revert ItemNotFound();

        ItemData storage item = _items[galleryId][itemKey];
        return (item.displayOrder, item.label, item.note);
    }

    function getItemPackedRef(uint256 galleryId, bytes32 itemKey) external view returns (bytes memory packedRef) {
        if (!_galleryExists[galleryId]) revert GalleryNotFound();
        if (!_hasItem[galleryId][itemKey]) revert ItemNotFound();
        return _items[galleryId][itemKey].packedRef;
    }

    function getItemStatus(
        uint256 galleryId,
        bytes32 itemKey
    ) external view returns (uint64 addedAt, uint64 removedAt, bool isActive) {
        if (!_galleryExists[galleryId]) revert GalleryNotFound();
        if (!_hasItem[galleryId][itemKey]) revert ItemNotFound();

        ItemData storage item = _items[galleryId][itemKey];
        return (item.addedAt, item.removedAt, item.removedAt == 0);
    }

    function getItems(
        uint256 galleryId,
        bytes32[] calldata itemKeys
    ) external view returns (ItemData[] memory itemsOut) {
        if (!_galleryExists[galleryId]) revert GalleryNotFound();

        itemsOut = new ItemData[](itemKeys.length);
        for (uint256 i = 0; i < itemKeys.length; i++) {
            bytes32 itemKey = itemKeys[i];
            if (!_hasItem[galleryId][itemKey]) revert ItemNotFound();
            itemsOut[i] = _items[galleryId][itemKey];
        }
    }

    function getItemFieldsBatch(
        uint256 galleryId,
        bytes32[] calldata itemKeys
    ) external view returns (uint32[] memory displayOrders, string[] memory labels, string[] memory notes) {
        if (!_galleryExists[galleryId]) revert GalleryNotFound();

        displayOrders = new uint32[](itemKeys.length);
        labels = new string[](itemKeys.length);
        notes = new string[](itemKeys.length);

        for (uint256 i = 0; i < itemKeys.length; i++) {
            bytes32 itemKey = itemKeys[i];
            if (!_hasItem[galleryId][itemKey]) revert ItemNotFound();

            ItemData storage item = _items[galleryId][itemKey];
            displayOrders[i] = item.displayOrder;
            labels[i] = item.label;
            notes[i] = item.note;
        }
    }

    function _effectiveOrder(uint256 galleryId, bytes32 itemKey) internal view returns (uint256) {
        ItemData storage item = _items[galleryId][itemKey];
        return item.displayOrder > 0 ? uint256(item.displayOrder) : uint256(item.addedAt);
    }

    function _isGalleryController(address account, uint256 galleryId) internal view returns (bool) {
        address owner = ownerOf(galleryId);
        return account == owner || getApproved(galleryId) == account || isApprovedForAll(owner, account);
    }
}
