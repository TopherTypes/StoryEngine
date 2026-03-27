/**
 * StoryEngine Conversation Markdown Editor
 * Two-column editor: markdown input on left, live preview on right
 */

class ConversationMarkdownEditor {
  constructor(options = {}) {
    this.type = options.type || 'message'; // 'email' or 'message'
    this.initialMarkdown = options.initialMarkdown || '';
    this.story = options.story || {};
    this.onSave = options.onSave || (() => {});
    this.onCancel = options.onCancel || (() => {});

    this.container = null;
    this.editorTextarea = null;
    this.previewPanel = null;
    this.validationPanel = null;
  }

  /**
   * Render the editor in a given container
   */
  render(container) {
    this.container = container;
    this.container.innerHTML = '';
    this.container.className = 'conversation-editor';

    // Create main layout
    const mainLayout = document.createElement('div');
    mainLayout.className = 'editor-main-layout';

    // Create left column (editor)
    const leftColumn = document.createElement('div');
    leftColumn.className = 'editor-left-column';
    leftColumn.innerHTML = `
      <div class="editor-header">
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
          <div>
            <h3>${this.type === 'email' ? 'Email Conversation' : 'IM Conversation'}</h3>
            <p class="editor-hint">
              ${this.type === 'email'
                ? 'Format: [SENDER (email) => DATE/TIME | STATUS] Message or [<= TIME | STATUS] Reply'
                : 'Format: [SENDER => DATE/TIME | STATUS] Message or [<= TIME | STATUS] Reply'
              }
            </p>
          </div>
          <button class="btn-help-toggle" title="Show formatting guide">?</button>
        </div>
      </div>
      <div class="editor-help-panel" style="display: none;">
        ${this._getHelpPanelHtml()}
      </div>
      <textarea class="editor-textarea"
                 placeholder="${this._getPlaceholder()}"
                 spellcheck="true"></textarea>
      <div class="editor-footer">
        <button class="btn btn-save">Save Conversation</button>
        <button class="btn btn-cancel">Cancel</button>
      </div>
    `;

    // Create right column (preview)
    const rightColumn = document.createElement('div');
    rightColumn.className = 'editor-right-column';
    rightColumn.innerHTML = `
      <div class="preview-header">
        <h3>Preview</h3>
      </div>
      <div class="preview-validation" style="display: none;"></div>
      <div class="preview-messages"></div>
    `;

    mainLayout.appendChild(leftColumn);
    mainLayout.appendChild(rightColumn);
    this.container.appendChild(mainLayout);

    // Get references
    this.editorTextarea = leftColumn.querySelector('.editor-textarea');
    this.previewPanel = rightColumn.querySelector('.preview-messages');
    this.validationPanel = rightColumn.querySelector('.preview-validation');

    // Set initial content
    this.editorTextarea.value = this.initialMarkdown;

    // Bind events
    this.editorTextarea.addEventListener('input', () => this._updatePreview());
    leftColumn.querySelector('.btn-save').addEventListener('click', () => this._handleSave());
    leftColumn.querySelector('.btn-cancel').addEventListener('click', () => this.onCancel());
    leftColumn.querySelector('.btn-help-toggle').addEventListener('click', () => this._toggleHelpPanel(leftColumn));

    // Initial preview
    this._updatePreview();

    // Add styles
    this._injectStyles();
  }

  /**
   * Update the preview panel based on current editor content
   * @private
   */
  _updatePreview() {
    const markdown = this.editorTextarea.value;

    // Validate markdown
    const issues = ConversationMarkdown.validateMarkdown(markdown, this.type);

    // Show validation issues if any
    if (issues.length > 0) {
      this.validationPanel.style.display = 'block';
      this.validationPanel.innerHTML = issues
        .map(issue => `
          <div class="validation-${issue.type}">
            <strong>Line ${issue.line}:</strong> ${issue.message}
          </div>
        `)
        .join('');
    } else {
      this.validationPanel.style.display = 'none';
    }

    // Parse and render preview
    const playerProfile = this.story.globalSettings?.playerProfile || {};
    this.lastMessages = ConversationMarkdown.parseMarkdown(markdown, this.type, playerProfile);

    // Render messages
    this.previewPanel.innerHTML = '';

    if (this.lastMessages.length === 0) {
      this.previewPanel.innerHTML = '<div class="preview-empty">No messages yet</div>';
      return;
    }

    this.lastMessages.forEach((msg, index) => {
      const messageEl = this._createMessagePreview(msg, index);
      this.previewPanel.appendChild(messageEl);
    });
  }

  /**
   * Create a preview element for a message
   * @private
   */
  _createMessagePreview(msg, index) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `preview-message ${msg.isFromPlayer ? 'from-player' : 'from-other'}`;

    // Build sender/header line
    let headerHtml = '';
    if (msg.isFromPlayer) {
      headerHtml = `<span class="msg-sender">You</span>`;
    } else {
      if (msg.senderEmail) {
        headerHtml = `<span class="msg-sender">${msg.senderName} &lt;${msg.senderEmail}&gt;</span>`;
      } else {
        headerHtml = `<span class="msg-sender">${msg.senderName}</span>`;
      }
    }

    // Build subject if email
    let subjectHtml = '';
    if (msg.subject && (index === 0 || msg.subject !== this.lastMessages[index - 1]?.subject)) {
      subjectHtml = `<div class="msg-subject">Subject: ${this._escapeHtml(msg.subject)}</div>`;
    }

    // Build time and status
    const statusClass = msg.status || 'unread';
    const timeHtml = `<span class="msg-time">${this._escapeHtml(msg.timestamp)}</span>
                      <span class="msg-status ${statusClass}">${msg.status}</span>`;

    // Build message content
    const contentHtml = `<div class="msg-content">${this._escapeHtml(msg.content)}</div>`;

    messageDiv.innerHTML = `
      ${subjectHtml}
      <div class="msg-header">
        ${headerHtml}
        ${timeHtml}
      </div>
      ${contentHtml}
    `;

    return messageDiv;
  }

  /**
   * Handle save action
   * @private
   */
  _handleSave() {
    const markdown = this.editorTextarea.value;

    // Validate
    const issues = ConversationMarkdown.validateMarkdown(markdown, this.type);
    const errors = issues.filter(i => i.type === 'error');

    if (errors.length > 0) {
      alert(`Cannot save: ${errors.length} error(s) found. Fix the issues and try again.`);
      return;
    }

    // Call the save callback
    this.onSave(markdown);
  }

  /**
   * Get placeholder text based on type
   * @private
   */
  _getPlaceholder() {
    if (this.type === 'email') {
      return `[ALICE (alice@company.com) => 12/03/2026 10:15 | unread]
Subject: Let's discuss the project
I had some thoughts about our approach.

[<= 10:32 | read]
Subject: RE: Let's discuss the project
Great, I'm listening.

[ALICE => 12/03/2026 14:45 | unread]
Subject: RE: Let's discuss the project
Found the issue! It's in the auth module.`;
    } else {
      return `[JAMES => 12/03/2026 12:22 | unread] Hey dude, are you coming to the party?

[<= 12:28 | read] Yeah, I'll be there for ten.

[JAMES => 12:32 | unread] Awesome! See you then.`;
    }
  }

  /**
   * Get help panel HTML based on conversation type
   * @private
   */
  _getHelpPanelHtml() {
    if (this.type === 'email') {
      return `
        <div class="help-content">
          <h4>Email Format Guide</h4>
          <div class="help-section">
            <h5>Sender Message:</h5>
            <code>[SENDER (email@address.com) => DATE TIME | STATUS]</code>
            <p class="help-example">Example: <code>[ALICE (alice@company.com) => 12/03/2026 10:15 | unread]</code></p>
          </div>
          <div class="help-section">
            <h5>Your Reply:</h5>
            <code>[<= TIME | STATUS]</code>
            <p class="help-example">Example: <code>[<= 10:32 | read]</code></p>
          </div>
          <div class="help-section">
            <h5>Subject Line (Optional):</h5>
            <code>Subject: Your subject text</code>
            <p class="help-example">Example: <code>Subject: RE: Project Discussion</code></p>
          </div>
          <div class="help-section">
            <h5>Status Values:</h5>
            <code>sent | delivered | read | unread</code>
          </div>
          <div class="help-section">
            <h5>Complete Email Example:</h5>
            <pre class="help-code">[ALICE (alice@company.com) => 12/03/2026 10:15 | unread]
Subject: Project Update
I have the latest numbers. Let me know if you need anything.

[<= 10:32 | read]
Subject: RE: Project Update
Thanks for sending that over! Very helpful.

[ALICE => 12/03/2026 14:45 | unread]
Subject: RE: Project Update
Great! Let's discuss tomorrow at 2 PM.</pre>
          </div>
        </div>
      `;
    } else {
      return `
        <div class="help-content">
          <h4>IM Format Guide</h4>
          <div class="help-section">
            <h5>Sender Message:</h5>
            <code>[SENDER => DATE TIME | STATUS] Message</code>
            <p class="help-example">Example: <code>[JAMES => 12/03/2026 12:22 | unread] Hey, are you there?</code></p>
          </div>
          <div class="help-section">
            <h5>Your Reply:</h5>
            <code>[<= TIME | STATUS] Message</code>
            <p class="help-example">Example: <code>[<= 12:28 | read] Yeah, just got here!</code></p>
          </div>
          <div class="help-section">
            <h5>Status Values:</h5>
            <code>sent | delivered | read | unread</code>
          </div>
          <div class="help-section">
            <h5>Complete IM Example:</h5>
            <pre class="help-code">[JAMES => 12/03/2026 12:22 | unread] Hey dude, are you coming to the party?

[<= 12:28 | read] Yeah, I'll be there for ten.

[JAMES => 12:32 | unread] Awesome! See you then.

[<= 12:35 | read] Definitely! Bring the snacks?

[JAMES => 12:40 | read] Already on it!</pre>
          </div>
        </div>
      `;
    }
  }

  /**
   * Toggle visibility of the help panel
   * @private
   */
  _toggleHelpPanel(leftColumn) {
    const helpPanel = leftColumn.querySelector('.editor-help-panel');
    const helpToggle = leftColumn.querySelector('.btn-help-toggle');

    if (helpPanel.style.display === 'none') {
      helpPanel.style.display = 'block';
      helpToggle.textContent = '✕';
      helpToggle.classList.add('active');
    } else {
      helpPanel.style.display = 'none';
      helpToggle.textContent = '?';
      helpToggle.classList.remove('active');
    }
  }

  /**
   * Escape HTML to prevent XSS
   * @private
   */
  _escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
  }

  /**
   * Inject CSS styles for the editor
   * @private
   */
  _injectStyles() {
    const styleId = 'conversation-editor-styles';
    if (document.getElementById(styleId)) {
      return; // Already injected
    }

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .conversation-editor {
        display: flex;
        flex-direction: column;
        height: 100%;
        background: #1e1e1e;
        color: #e0e0e0;
        font-family: 'Courier New', monospace;
      }

      .editor-main-layout {
        display: flex;
        flex: 1;
        gap: 20px;
        overflow: hidden;
      }

      .editor-left-column,
      .editor-right-column {
        flex: 1;
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }

      .editor-header,
      .preview-header {
        padding: 15px;
        border-bottom: 1px solid #333;
        background: #252525;
      }

      .editor-header h3,
      .preview-header h3 {
        margin: 0 0 8px 0;
        font-size: 16px;
        color: #fff;
      }

      .editor-hint {
        margin: 0;
        font-size: 12px;
        color: #888;
      }

      .editor-textarea {
        flex: 1;
        padding: 15px;
        background: #1e1e1e;
        color: #e0e0e0;
        border: none;
        font-family: 'Courier New', monospace;
        font-size: 13px;
        line-height: 1.5;
        resize: none;
        outline: none;
      }

      .editor-textarea:focus {
        background: #252525;
      }

      .editor-footer {
        padding: 15px;
        border-top: 1px solid #333;
        background: #252525;
        display: flex;
        gap: 10px;
      }

      .btn {
        padding: 8px 16px;
        border: 1px solid #444;
        background: #333;
        color: #e0e0e0;
        cursor: pointer;
        font-size: 12px;
        border-radius: 4px;
        transition: background 0.2s;
      }

      .btn:hover {
        background: #444;
      }

      .btn-save {
        background: #0e7c0e;
        border-color: #0e7c0e;
      }

      .btn-save:hover {
        background: #1a9a1a;
      }

      .btn-cancel {
        background: #7c0e0e;
        border-color: #7c0e0e;
      }

      .btn-cancel:hover {
        background: #9a1a1a;
      }

      .preview-validation {
        padding: 10px 15px;
        background: #3d2d2d;
        border-bottom: 1px solid #333;
        max-height: 100px;
        overflow-y: auto;
      }

      .validation-error {
        color: #ff6b6b;
        font-size: 12px;
        margin: 5px 0;
      }

      .validation-warning {
        color: #ffd93d;
        font-size: 12px;
        margin: 5px 0;
      }

      .preview-messages {
        flex: 1;
        padding: 15px;
        overflow-y: auto;
      }

      .preview-empty {
        color: #666;
        text-align: center;
        padding: 40px 20px;
        font-style: italic;
      }

      .preview-message {
        margin-bottom: 15px;
        padding: 12px;
        border-radius: 8px;
        border-left: 3px solid #444;
        background: #252525;
      }

      .preview-message.from-player {
        border-left-color: #0e7c0e;
        background: #2d3d2d;
      }

      .preview-message.from-other {
        border-left-color: #7c4c0e;
        background: #3d3d2d;
      }

      .msg-subject {
        font-weight: bold;
        color: #aaa;
        font-size: 12px;
        margin-bottom: 6px;
        padding-bottom: 6px;
        border-bottom: 1px solid #333;
      }

      .msg-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
        font-size: 12px;
      }

      .msg-sender {
        color: #fff;
        font-weight: bold;
      }

      .msg-time {
        color: #888;
        margin-right: 8px;
      }

      .msg-status {
        padding: 2px 6px;
        border-radius: 3px;
        font-size: 10px;
        text-transform: uppercase;
        font-weight: bold;
      }

      .msg-status.unread {
        background: #7c4c0e;
        color: #fff;
      }

      .msg-status.read {
        background: #2d5c2d;
        color: #fff;
      }

      .msg-status.delivered {
        background: #4c6c7c;
        color: #fff;
      }

      .msg-status.sent {
        background: #3d4d5d;
        color: #888;
      }

      .msg-content {
        color: #d0d0d0;
        font-size: 13px;
        line-height: 1.5;
        white-space: pre-wrap;
        word-wrap: break-word;
      }

      .btn-help-toggle {
        padding: 6px 10px;
        background: #444;
        color: #e0e0e0;
        border: 1px solid #666;
        border-radius: 4px;
        cursor: pointer;
        font-weight: bold;
        font-size: 14px;
        transition: background 0.2s;
      }

      .btn-help-toggle:hover {
        background: #555;
      }

      .btn-help-toggle.active {
        background: #0e7c0e;
        border-color: #0e7c0e;
      }

      .editor-help-panel {
        padding: 15px;
        background: #2d2d2d;
        border-bottom: 1px solid #333;
        max-height: 300px;
        overflow-y: auto;
        font-size: 12px;
      }

      .help-content {
        color: #d0d0d0;
      }

      .help-content h4 {
        margin: 0 0 12px 0;
        color: #fff;
        font-size: 13px;
      }

      .help-section {
        margin-bottom: 12px;
        padding-bottom: 12px;
        border-bottom: 1px solid #444;
      }

      .help-section:last-child {
        border-bottom: none;
        margin-bottom: 0;
        padding-bottom: 0;
      }

      .help-section h5 {
        margin: 0 0 6px 0;
        color: #0e9c0e;
        font-size: 12px;
      }

      .help-section code {
        background: #1e1e1e;
        color: #7cfc00;
        padding: 4px 8px;
        border-radius: 3px;
        font-family: 'Courier New', monospace;
        display: inline-block;
        margin: 4px 0;
      }

      .help-example {
        margin: 6px 0 0 0;
        color: #999;
        font-style: italic;
      }

      .help-example code {
        color: #aaa;
      }

      .help-code {
        background: #1e1e1e;
        color: #7cfc00;
        padding: 8px 12px;
        border-radius: 3px;
        border-left: 3px solid #0e7c0e;
        font-family: 'Courier New', monospace;
        font-size: 11px;
        margin: 6px 0 0 0;
        white-space: pre-wrap;
        word-wrap: break-word;
        overflow-x: auto;
      }

      @media (max-width: 1200px) {
        .editor-main-layout {
          flex-direction: column;
        }

        .editor-left-column,
        .editor-right-column {
          min-height: 400px;
        }
      }
    `;

    document.head.appendChild(style);
  }
}
