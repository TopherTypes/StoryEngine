/**
 * ID generation utilities
 */
export function generateId(prefix) {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 9);
    return `${prefix}_${timestamp}${random}`;
}
export function generateStoryId() {
    return generateId('story');
}
export function generateArtefactId(type) {
    return generateId(`art_${type}`);
}
export function generateAssetId(filename) {
    const ext = filename.split('.').pop() || '';
    return generateId(`asset_${ext}`);
}
export function generateEmailThreadId() {
    return generateId('thread');
}
export function generateIMConversationId() {
    return generateId('conv');
}
export function generateSenderId() {
    return generateId('sender');
}
export function generateParticipantId() {
    return generateId('participant');
}
export function generateFolderId() {
    return generateId('folder');
}
