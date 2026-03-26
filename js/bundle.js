/**
 * StoryEngine Bundle Format Handler
 * Handles creation and parsing of .story bundle files
 */

const StoryBundle = {
  // Bundle format constants
  MAGIC_NUMBER: 0x53544f5259, // "STORY" in hex
  MAGIC_BYTES: [0x53, 0x54, 0x4F, 0x52, 0x59], // "STORY"
  VERSION: 0x01,
  COMPRESSION_GZIP: 0x01,
  COMPRESSION_NONE: 0x00,
  HEADER_SIZE: 16,

  /**
   * Create a story bundle from a story object and asset files
   * @param {Object} story - The story object
   * @param {Array<{assetId, file}>} assets - Asset files to include
   * @returns {Promise<Blob>} - The bundle as a Blob
   */
  async createBundle(story, assets = []) {
    try {
      // Validate story
      if (!story.id || !story.title) {
        throw new Error('Story must have id and title');
      }

      // Create manifest
      const manifest = {
        bundleVersion: 1,
        storyId: story.id,
        storyTitle: story.title,
        storyVersion: story.version,
        createdAt: new Date().toISOString(),
        assetHashes: {}
      };

      // Calculate asset hashes and prepare asset data
      const assetBlocks = [];
      const assetMap = {};

      for (const asset of assets) {
        if (!asset.file) continue;

        const data = await this._fileToArrayBuffer(asset.file);
        const hash = await this._calculateSHA256(data);
        const mimeType = asset.file.type || 'application/octet-stream';

        manifest.assetHashes[asset.assetId] = {
          hash,
          mimeType,
          size: data.byteLength
        };

        assetBlocks.push({
          assetId: asset.assetId,
          mimeType,
          data
        });

        assetMap[asset.assetId] = true;
      }

      console.log('[Bundle] Created assetMap with keys:', Object.keys(assetMap));
      console.log('[Bundle] Story wallpaper before normalization:', story.wallpaper);

      // Update story with assetId references (convert from assetPath if needed)
      const processedStory = this._normalizeStoryAssets(story, assetMap);

      console.log('[Bundle] Story wallpaper after normalization:', processedStory.wallpaper);

      // Normalize ending properties to ensure correct field names
      const normalizedStory = this._normalizeEndingProperties(processedStory);

      // Serialize story to JSON
      const storyJson = JSON.stringify(normalizedStory, null, 2);
      const storyBuffer = new TextEncoder().encode(storyJson);

      // Build bundle content
      const bundles = [];

      // Add header
      bundles.push(this._createHeader());

      // Add manifest
      const manifestJson = JSON.stringify(manifest, null, 2);
      bundles.push(new TextEncoder().encode(manifestJson));
      bundles.push(this._createSeparator('MANIFEST_END'));

      // Add story
      bundles.push(storyBuffer);
      bundles.push(this._createSeparator('STORY_END'));

      // Add assets
      for (const asset of assetBlocks) {
        bundles.push(this._createAssetBlock(asset.assetId, asset.mimeType, asset.data));
      }

      // Add footer with CRC
      const contentBlob = new Blob(bundles);
      const contentBuffer = await this._blobToArrayBuffer(contentBlob);
      const crc32 = this._calculateCRC32(contentBuffer);

      bundles.push(this._createFooter(crc32));

      // Return final bundle
      return new Blob(bundles, { type: 'application/x-story-bundle' });
    } catch (error) {
      console.error('Failed to create bundle:', error);
      throw error;
    }
  },

  /**
   * Parse a story bundle and extract story + assets
   * @param {Blob} bundleBlob - The .story bundle file
   * @returns {Promise<{story, assets}>} - Extracted story and asset map
   */
  async parseBundle(bundleBlob) {
    try {
      console.log('[Bundle] Starting bundle parsing...');
      console.log('[Bundle] Bundle size:', (bundleBlob.size / 1024).toFixed(2), 'KB');

      const buffer = await this._blobToArrayBuffer(bundleBlob);
      const view = new DataView(buffer);

      // Verify magic number
      console.log('[Bundle] Checking magic number...');
      if (!this._verifyMagic(view)) {
        throw new Error('Invalid bundle format: incorrect magic number');
      }
      console.log('[Bundle] ✓ Magic number valid (STORY)');

      // Check version
      const version = view.getUint8(5);
      console.log('[Bundle] Checking version: expected', this.VERSION, 'got', version);
      if (version !== this.VERSION) {
        throw new Error(`Bundle format version ${version} not supported (expected ${this.VERSION})`);
      }
      console.log('[Bundle] ✓ Version check passed');

      // Check compression flag
      const compressionFlag = view.getUint8(6);
      const compressionName = compressionFlag === this.COMPRESSION_GZIP ? 'GZIP' : (compressionFlag === this.COMPRESSION_NONE ? 'NONE' : 'UNKNOWN');
      console.log('[Bundle] Compression flag:', compressionName, '(' + compressionFlag + ')');
      if (compressionFlag !== this.COMPRESSION_NONE && compressionFlag !== this.COMPRESSION_GZIP) {
        throw new Error('Unknown compression format');
      }
      console.log('[Bundle] ✓ Compression check passed');

      // Parse sections
      let offset = this.HEADER_SIZE;
      const uint8Array = new Uint8Array(buffer);
      console.log('[Bundle] Header size:', this.HEADER_SIZE, 'bytes, starting content parsing at offset', offset);

      // Read manifest
      console.log('[Bundle] Searching for MANIFEST_END marker...');
      const manifestEnd = this._findSeparator(uint8Array, offset, 'MANIFEST_END');
      if (manifestEnd === -1) {
        throw new Error('Bundle corrupted: missing manifest end marker');
      }
      console.log('[Bundle] ✓ Found manifest at offset', offset, 'to', manifestEnd);

      const manifestJson = new TextDecoder().decode(uint8Array.slice(offset, manifestEnd));
      const manifest = JSON.parse(manifestJson);
      console.log('[Bundle] Manifest parsed:', {
        bundleVersion: manifest.bundleVersion,
        storyId: manifest.storyId,
        storyTitle: manifest.storyTitle,
        assetCount: Object.keys(manifest.assetHashes || {}).length
      });
      offset = manifestEnd + 13; // Length of "MANIFEST_END\x00"

      // Verify bundle integrity
      console.log('[Bundle] Verifying bundle integrity (CRC32)...');
      const expectedCrc = this._readCRCFromEnd(uint8Array);
      const contentCrc = this._calculateCRC32(uint8Array.slice(0, uint8Array.length - 4));
      console.log('[Bundle] CRC32 check: expected 0x' + expectedCrc.toString(16) + ', calculated 0x' + contentCrc.toString(16));
      if (expectedCrc !== contentCrc) {
        console.warn('[Bundle] ⚠ Bundle CRC32 mismatch (file may be corrupted). Expected: 0x' + expectedCrc.toString(16) + ', Got: 0x' + contentCrc.toString(16));
      } else {
        console.log('[Bundle] ✓ CRC32 verification passed');
      }

      // Read story
      console.log('[Bundle] Searching for STORY_END marker...');
      const storyEnd = this._findSeparator(uint8Array, offset, 'STORY_END');
      if (storyEnd === -1) {
        throw new Error('Bundle corrupted: missing story end marker');
      }
      console.log('[Bundle] ✓ Found story data from offset', offset, 'to', storyEnd);

      const storyJson = new TextDecoder().decode(uint8Array.slice(offset, storyEnd));
      let story = JSON.parse(storyJson);

      // Normalize login properties from flat structure to nested object
      story = this._normalizeLoginProperties(story);

      // Normalize ending properties from flat structure to nested object
      story = this._normalizeEndingProperties(story);

      console.log('[Bundle] Story parsed:', {
        id: story.id,
        title: story.title,
        author: story.author || '(not set)',
        artefactCount: story.artefacts?.length || 0,
        emailSenderCount: story.emailSenders?.length || 0,
        imParticipantCount: story.imParticipants?.length || 0
      });
      offset = storyEnd + 10; // Length of "STORY_END\x00"

      // Read assets
      console.log('[Bundle] Reading assets, current offset:', offset, 'buffer end:', uint8Array.length - 4);
      const assets = {};
      let assetCount = 0;
      while (offset < uint8Array.length - 4) { // -4 for CRC32
        const assetBlock = this._readAssetBlock(uint8Array, offset);
        if (!assetBlock) break;

        assets[assetBlock.assetId] = {
          mimeType: assetBlock.mimeType,
          data: assetBlock.data
        };

        console.log('[Bundle] Loaded asset: ' + assetBlock.assetId + ' (' + assetBlock.mimeType + ', ' + (assetBlock.data.byteLength / 1024).toFixed(2) + ' KB)');

        offset = assetBlock.nextOffset;
        assetCount++;
      }
      console.log('[Bundle] ✓ Loaded', assetCount, 'assets');

      // Verify asset hashes if manifest present
      if (manifest.assetHashes) {
        console.log('[Bundle] Verifying asset hashes (' + Object.keys(manifest.assetHashes).length + ' to verify)...');
        for (const [assetId, hashInfo] of Object.entries(manifest.assetHashes)) {
          if (assets[assetId]) {
            const calculatedHash = await this._calculateSHA256(assets[assetId].data);
            if (calculatedHash !== hashInfo.hash) {
              throw new Error(`Asset ${assetId} is corrupted (hash mismatch)`);
            }
            console.log('[Bundle] ✓ Asset ' + assetId + ' hash verified');
          } else {
            console.warn('[Bundle] ⚠ Manifest references asset ' + assetId + ' but it was not found in bundle');
          }
        }
        console.log('[Bundle] ✓ All asset hashes verified');
      }

      console.log('[Bundle] ✅ Bundle parsing complete');
      return {
        story,
        assets,
        metadata: manifest
      };
    } catch (error) {
      console.error('[Bundle] ❌ Failed to parse bundle:', error.message);
      console.error('[Bundle] Error details:', error);
      throw error;
    }
  },

  /**
   * Convert asset from file to data URL for storage/display
   * @param {Blob} file - The asset file
   * @returns {Promise<string>} - Data URL
   */
  async fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  },

  // Private helper methods

  _createHeader() {
    const header = new Uint8Array(this.HEADER_SIZE);
    // Magic number
    header[0] = 0x53; // S
    header[1] = 0x54; // T
    header[2] = 0x4F; // O
    header[3] = 0x52; // R
    header[4] = 0x59; // Y
    // Version
    header[5] = this.VERSION;
    // Compression flag (no compression)
    header[6] = this.COMPRESSION_NONE;
    // Reserved (padding)
    for (let i = 7; i < this.HEADER_SIZE; i++) {
      header[i] = 0x00;
    }
    return header;
  },

  _createSeparator(name) {
    const bytes = new TextEncoder().encode(name);
    const separator = new Uint8Array(bytes.length + 1);
    separator.set(bytes);
    separator[bytes.length] = 0x00; // Null terminator
    return separator;
  },

  _createAssetBlock(assetId, mimeType, data) {
    const idBytes = new TextEncoder().encode(assetId);
    const mimeBytes = new TextEncoder().encode(mimeType);

    // Asset block: [id_length][id\0][mime_length][mime\0][size][data]
    const block = new Uint8Array(
      1 + idBytes.length + 1 +
      1 + mimeBytes.length + 1 +
      4 +
      data.byteLength
    );

    let offset = 0;
    block[offset++] = idBytes.length;
    block.set(idBytes, offset);
    offset += idBytes.length;
    block[offset++] = 0x00;

    block[offset++] = mimeBytes.length;
    block.set(mimeBytes, offset);
    offset += mimeBytes.length;
    block[offset++] = 0x00;

    const sizeView = new DataView(block.buffer, offset, 4);
    sizeView.setUint32(0, data.byteLength, false);
    offset += 4;

    block.set(new Uint8Array(data), offset);

    return block;
  },

  _readAssetBlock(uint8Array, offset) {
    if (offset >= uint8Array.length - 4) return null;

    try {
      let pos = offset;

      // Read asset ID
      const idLength = uint8Array[pos++];
      const idBytes = uint8Array.slice(pos, pos + idLength);
      const assetId = new TextDecoder().decode(idBytes);
      pos += idLength + 1; // +1 for null terminator

      // Read MIME type
      const mimeLength = uint8Array[pos++];
      const mimeBytes = uint8Array.slice(pos, pos + mimeLength);
      const mimeType = new TextDecoder().decode(mimeBytes);
      pos += mimeLength + 1; // +1 for null terminator

      // Read data size
      const sizeView = new DataView(uint8Array.buffer, uint8Array.byteOffset + pos, 4);
      const dataSize = sizeView.getUint32(0, false);
      pos += 4;

      // Read data
      const data = uint8Array.slice(pos, pos + dataSize);
      pos += dataSize;

      return {
        assetId,
        mimeType,
        data: data.buffer.slice(data.byteOffset, data.byteOffset + data.length),
        nextOffset: pos
      };
    } catch (error) {
      console.error('Error reading asset block:', error);
      return null;
    }
  },

  _createFooter(crc32) {
    const footer = new Uint8Array(4);
    const view = new DataView(footer.buffer);
    view.setUint32(0, crc32, false); // Big-endian
    return footer;
  },

  _verifyMagic(view) {
    for (let i = 0; i < this.MAGIC_BYTES.length; i++) {
      if (view.getUint8(i) !== this.MAGIC_BYTES[i]) {
        return false;
      }
    }
    return true;
  },

  _findSeparator(uint8Array, startOffset, separatorName) {
    const separatorBytes = new TextEncoder().encode(separatorName);
    for (let i = startOffset; i < uint8Array.length - separatorBytes.length; i++) {
      let match = true;
      for (let j = 0; j < separatorBytes.length; j++) {
        if (uint8Array[i + j] !== separatorBytes[j]) {
          match = false;
          break;
        }
      }
      if (match && i + separatorBytes.length < uint8Array.length && uint8Array[i + separatorBytes.length] === 0x00) {
        return i;
      }
    }
    return -1;
  },

  _readCRCFromEnd(uint8Array) {
    const view = new DataView(uint8Array.buffer, uint8Array.byteOffset + uint8Array.length - 4, 4);
    return view.getUint32(0, false);
  },

  _normalizeStoryAssets(story, assetMap) {
    const normalized = JSON.parse(JSON.stringify(story)); // Deep clone

    normalized.artefacts = normalized.artefacts.map(artefact => {
      // Convert assetPath to assetId if asset exists
      if (artefact.assetPath && !artefact.assetId) {
        const filename = artefact.assetPath.split('/').pop();
        if (assetMap[filename]) {
          artefact.assetId = filename;
        }
      }
      delete artefact.assetPath; // Remove old field
      return artefact;
    });

    // Normalize wallpaper asset path to filename only
    if (normalized.wallpaper && typeof normalized.wallpaper === 'string') {
      const filename = normalized.wallpaper.split('/').pop();
      console.log('[Bundle] Normalizing wallpaper: input =', normalized.wallpaper, ', extracted filename =', filename, ', in assetMap =', !!assetMap[filename]);
      if (assetMap[filename]) {
        normalized.wallpaper = filename;
        console.log('[Bundle] ✓ Wallpaper normalized to:', normalized.wallpaper);
      } else {
        console.log('[Bundle] ⚠ Wallpaper NOT normalized - filename not found in assetMap. Available keys:', Object.keys(assetMap));
      }
    }

    return normalized;
  },

  _normalizeLoginProperties(story) {
    // Transform flat login properties from authoring tool into nested structure
    // that the player's validation expects
    if (!story) return story;

    // If story already has the nested login structure, return as-is
    if (story.login && typeof story.login === 'object') {
      return story;
    }

    // If flat login properties exist, transform them into nested structure
    if (story.loginUsername !== undefined || story.loginPassword !== undefined || story.loginRequired !== undefined) {
      story.login = {
        enabled: story.loginRequired || false,
        username: story.loginUsername || '',
        password: story.loginPassword || '',
        message: story.loginMessage || ''
      };
    } else {
      // Default login object if no login properties exist
      story.login = {
        enabled: false,
        username: '',
        password: '',
        message: ''
      };
    }

    return story;
  },

  _normalizeEndingProperties(story) {
    // Transform flat ending properties from authoring tool into nested structure
    // that the player's validation expects
    if (!story) return story;

    // If story already has the nested ending structure, convert field names if needed
    if (story.ending && typeof story.ending === 'object') {
      // Convert old 'value' field to 'minutes' for time rules in triggerConditions
      if (story.ending.triggerConditions && Array.isArray(story.ending.triggerConditions)) {
        story.ending.triggerConditions = story.ending.triggerConditions.map(rule => {
          if (rule.type === 'time' && rule.value !== undefined && rule.minutes === undefined) {
            const minutes = parseInt(rule.value, 10);
            return {
              ...rule,
              minutes: isNaN(minutes) ? 60 : minutes
            };
          }
          return rule;
        });
      }
      return story;
    }

    // If flat ending properties exist, transform them into nested structure
    if (story.endingTitle !== undefined || story.endingMessage !== undefined || story.endingCondition !== undefined || story.endingValue !== undefined) {
      const endingValue = parseInt(story.endingValue || '60', 10);
      story.ending = {
        title: story.endingTitle || 'The End',
        body: story.endingMessage || '',
        triggerConditions: [
          {
            type: story.endingCondition || 'time',
            minutes: isNaN(endingValue) ? 60 : endingValue
          }
        ],
        allowContinueAfter: false
      };
    } else {
      // Default ending object if no ending properties exist
      story.ending = {
        title: 'The End',
        body: '',
        triggerConditions: [
          { type: 'time', minutes: 60 }
        ],
        allowContinueAfter: false
      };
    }

    return story;
  },

  _fileToArrayBuffer(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(file);
    });
  },

  _blobToArrayBuffer(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(blob);
    });
  },

  // Simple CRC32 calculation
  _calculateCRC32(buffer) {
    let crc = 0xFFFFFFFF;
    const uint8Array = new Uint8Array(buffer);

    for (let i = 0; i < uint8Array.length; i++) {
      crc ^= uint8Array[i];
      for (let j = 0; j < 8; j++) {
        crc = (crc >>> 1) ^ ((crc & 1) ? 0xEDB88320 : 0);
      }
    }

    return (crc ^ 0xFFFFFFFF) >>> 0;
  },

  // SHA256 hash calculation for asset verification
  async _calculateSHA256(buffer) {
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
};
