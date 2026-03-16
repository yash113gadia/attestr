// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title MediaRegistry — Decentralized Media Authenticator
/// @notice Stores cryptographic hashes of media files on-chain for tamper-proof verification
/// @dev Team Ctrl+Alt+Diablo — CSBC114 — Innovate Bharat Hackathon 2026

contract MediaRegistry {
    struct MediaRecord {
        bytes32 sha256Hash;
        bytes8 dHash;
        string filename;
        uint256 fileSize;
        string mimeType;
        address registeredBy;
        uint256 timestamp;
        uint256 blockNumber;
    }

    /// @notice Map SHA-256 hash to its record
    mapping(bytes32 => MediaRecord) public records;

    /// @notice Array of all registered hashes for enumeration
    bytes32[] public allHashes;

    /// @notice Emitted when new media is registered
    event MediaRegistered(
        bytes32 indexed sha256Hash,
        bytes8 dHash,
        string filename,
        address indexed registeredBy,
        uint256 timestamp
    );

    /// @notice Register a new media hash on-chain
    /// @param _sha256Hash SHA-256 hash of the media file
    /// @param _dHash Perceptual hash (dHash) of the media
    /// @param _filename Original filename
    /// @param _fileSize File size in bytes
    /// @param _mimeType MIME type of the file
    function register(
        bytes32 _sha256Hash,
        bytes8 _dHash,
        string calldata _filename,
        uint256 _fileSize,
        string calldata _mimeType
    ) external {
        require(records[_sha256Hash].timestamp == 0, "Media already registered");

        records[_sha256Hash] = MediaRecord({
            sha256Hash: _sha256Hash,
            dHash: _dHash,
            filename: _filename,
            fileSize: _fileSize,
            mimeType: _mimeType,
            registeredBy: msg.sender,
            timestamp: block.timestamp,
            blockNumber: block.number
        });

        allHashes.push(_sha256Hash);

        emit MediaRegistered(_sha256Hash, _dHash, _filename, msg.sender, block.timestamp);
    }

    /// @notice Verify if a media hash exists on-chain
    /// @param _sha256Hash SHA-256 hash to look up
    /// @return exists Whether the hash is registered
    /// @return record The full record if it exists
    function verify(bytes32 _sha256Hash)
        external
        view
        returns (bool exists, MediaRecord memory record)
    {
        record = records[_sha256Hash];
        exists = record.timestamp != 0;
    }

    /// @notice Get total number of registered media
    function totalRegistered() external view returns (uint256) {
        return allHashes.length;
    }

    /// @notice Get a hash by index (for enumeration)
    function getHashAtIndex(uint256 index) external view returns (bytes32) {
        require(index < allHashes.length, "Index out of bounds");
        return allHashes[index];
    }
}
