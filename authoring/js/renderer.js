/**
 * StoryEngine Authoring Tool - DOM Renderer
 * Handles all DOM updates and rendering of story data
 */

const Renderer = {
  // Update header with story info
  updateHeader(story) {
    const titleEl = document.getElementById('story-title');
    const artefactEl = document.getElementById('stat-artefacts');
    const statusEl = document.getElementById('stat-status');

    if (titleEl) titleEl.textContent = story.title || 'New Story';
    if (artefactEl) artefactEl.textContent = story.artefacts.length;

    // Validate and set status
    const issues = State.validateStory(story);
    const errors = issues.filter(i => i.type === 'error');
    if (statusEl) {
      statusEl.textContent = errors.length > 0 ? 'Issues' : 'Valid';
      statusEl.style.color = errors.length > 0 ? '#ff4444' : 'var(--terminal-green)';
    }
  },

  // Update dashboard stats
  updateDashboard(story) {
    const stats = State.calculateStats(story);

    const dashboardArtefactEl = document.getElementById('dashboard-artefact-count');
    if (dashboardArtefactEl) dashboardArtefactEl.textContent = stats.totalArtefacts;

    const dashboardLockedEl = document.getElementById('dashboard-locked-count');
    if (dashboardLockedEl) dashboardLockedEl.textContent = stats.lockedCount;

    const dashboardConditionalEl = document.getElementById('dashboard-conditional-count');
    if (dashboardConditionalEl) dashboardConditionalEl.textContent = stats.conditionalCount;

    const emailEl = document.getElementById('stat-emails');
    if (emailEl) emailEl.textContent = stats.typeBreakdown.email;

    const messageEl = document.getElementById('stat-messages');
    if (messageEl) messageEl.textContent = stats.typeBreakdown.message;

    const calendarEl = document.getElementById('stat-calendar');
    if (calendarEl) calendarEl.textContent = stats.typeBreakdown.calendar;

    const documentEl = document.getElementById('stat-documents');
    if (documentEl) documentEl.textContent = stats.typeBreakdown.document;

    const imageEl = document.getElementById('stat-images');
    if (imageEl) imageEl.textContent = stats.typeBreakdown.image;

    const audioEl = document.getElementById('stat-audio');
    if (audioEl) audioEl.textContent = stats.typeBreakdown.audio;

    // Update form fields
    const storyNameEl = document.getElementById('story-name');
    if (storyNameEl) storyNameEl.value = story.title;

    const storyAuthorEl = document.getElementById('story-author');
    if (storyAuthorEl) storyAuthorEl.value = story.author;

    const storyDescEl = document.getElementById('story-description');
    if (storyDescEl) storyDescEl.value = story.description;

    const storyVersionEl = document.getElementById('story-version');
    if (storyVersionEl) storyVersionEl.value = story.version;

    // Update settings tab
    const settingsNameEl = document.getElementById('settings-story-name');
    if (settingsNameEl) settingsNameEl.value = story.title;

    const settingsAuthorEl = document.getElementById('settings-story-author');
    if (settingsAuthorEl) settingsAuthorEl.value = story.author;

    const settingsDescEl = document.getElementById('settings-story-description');
    if (settingsDescEl) settingsDescEl.value = story.description;

    const settingsVersionEl = document.getElementById('settings-story-version');
    if (settingsVersionEl) settingsVersionEl.value = story.version;

    const settingsTagsEl = document.getElementById('settings-story-tags');
    if (settingsTagsEl) settingsTagsEl.value = story.tags;

    const settingsThemeEl = document.getElementById('settings-theme');
    if (settingsThemeEl) settingsThemeEl.value = story.theme;

    const settingsWallpaperEl = document.getElementById('settings-wallpaper');
    if (settingsWallpaperEl) settingsWallpaperEl.value = story.wallpaper;

    // Update login section
    const loginRequiredEl = document.getElementById('settings-login-required');
    if (loginRequiredEl) loginRequiredEl.checked = story.loginRequired;

    const loginMessageEl = document.getElementById('settings-login-message');
    if (loginMessageEl) loginMessageEl.value = story.loginMessage;

    const loginUsernameEl = document.getElementById('settings-login-username');
    if (loginUsernameEl) loginUsernameEl.value = story.loginUsername;

    const loginPasswordEl = document.getElementById('settings-login-password');
    if (loginPasswordEl) loginPasswordEl.value = story.loginPassword;

    // Update ending section
    const endingTitleEl = document.getElementById('settings-ending-title');
    if (endingTitleEl) endingTitleEl.value = story.endingTitle;

    const endingMessageEl = document.getElementById('settings-ending-message');
    if (endingMessageEl) endingMessageEl.value = story.endingMessage;

    const endingConditionEl = document.getElementById('settings-ending-condition');
    if (endingConditionEl) endingConditionEl.value = story.endingCondition;

    const endingValueEl = document.getElementById('settings-ending-value');
    if (endingValueEl) endingValueEl.value = story.endingValue;

    // Update world builder
    const calendarOwnerEl = document.getElementById('calendar-owner');
    if (calendarOwnerEl) calendarOwnerEl.value = story.calendarOwner;

    const calendarStartEl = document.getElementById('calendar-start-date');
    if (calendarStartEl) calendarStartEl.value = story.calendarStartDate;
  },

  // Render filtered artefact list (used by search/filter feature)
  renderArtefactListFiltered(story, filtered) {
    const artefactList = document.getElementById('artefact-list');
    if (!artefactList) return;

    artefactList.innerHTML = '';

    // Sort by release time
    const sorted = [...filtered].sort((a, b) => a.releaseAtTime - b.releaseAtTime);

    if (sorted.length === 0) {
      artefactList.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 20px; font-size: 11px;">No artefacts match the filters.</p>';
      return;
    }

    sorted.forEach(artefact => {
      const li = document.createElement('li');
      li.className = 'artefact-item';
      li.onclick = () => app.selectArtefact(artefact.id);
      li.dataset.artefactId = artefact.id;

      const typeEmoji = {
        email: '📧',
        message: '💬',
        calendar: '📅',
        document: '📄',
        image: '🖼️',
        audio: '🎵'
      }[artefact.type] || '📋';

      const lockReason = this.getArtefactLockReason(story, artefact);
      const lockBadge = lockReason ? `<span class="badge badge-warning" title="${this.escapeHtml(lockReason)}" style="margin-top: 4px; cursor: help;">🔒 ${lockReason.split(' + ').length > 1 ? 'Multi-locked' : 'Locked'}</span>` : '';

      li.innerHTML = `
        <div class="artefact-item-title">${typeEmoji} ${this.escapeHtml(artefact.title)}</div>
        <div class="artefact-item-meta">
          <div>T+${artefact.releaseAtTime}min</div>
          ${lockBadge}
        </div>
      `;

      artefactList.appendChild(li);
    });

    document.getElementById('artefact-count').textContent = sorted.length;
  },

  // Render artefact list
  renderArtefactList(story, filterType = null) {
    const artefactList = document.getElementById('artefact-list');
    if (!artefactList) return;

    artefactList.innerHTML = '';

    const filtered = filterType ? State.filterArtefacts(story, filterType) : story.artefacts;
    const sorted = State.getArtefactsByTime(story).filter(a => {
      if (!filterType) return true;
      return a.type === filterType;
    });

    if (sorted.length === 0) {
      artefactList.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 20px; font-size: 11px;">No artefacts. Create one to get started →</p>';
      return;
    }

    sorted.forEach(artefact => {
      const li = document.createElement('li');
      li.className = 'artefact-item';
      li.onclick = () => app.selectArtefact(artefact.id);
      li.dataset.artefactId = artefact.id;

      const typeEmoji = {
        email: '📧',
        message: '💬',
        calendar: '📅',
        document: '📄',
        image: '🖼️',
        audio: '🎵'
      }[artefact.type] || '📋';

      const lockReason = this.getArtefactLockReason(story, artefact);
      const lockBadge = lockReason ? `<span class="badge badge-warning" title="${this.escapeHtml(lockReason)}" style="margin-top: 4px; cursor: help;">🔒 ${lockReason.split(' + ').length > 1 ? 'Multi-locked' : 'Locked'}</span>` : '';

      li.innerHTML = `
        <div class="artefact-item-title">${typeEmoji} ${this.escapeHtml(artefact.title)}</div>
        <div class="artefact-item-meta">
          <div>T+${artefact.releaseAtTime}min</div>
          ${lockBadge}
        </div>
      `;

      artefactList.appendChild(li);
    });

    document.getElementById('artefact-count').textContent = sorted.length;
  },

  // Render artefact editor form based on type
  renderArtefactEditor(story, artefactId) {
    const artefact = story.artefacts.find(a => a.id === artefactId);
    if (!artefact) return;

    const editor = document.getElementById('artefact-editor');
    if (!editor) return;

    const typeEmoji = {
      email: '📧',
      message: '💬',
      calendar: '📅',
      document: '📄',
      image: '🖼️',
      audio: '🎵'
    }[artefact.type] || '📋';

    let typeFields = this.getTypeSpecificFields(story, artefact);

    editor.innerHTML = `
      <div class="artefact-form">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid var(--border-color);">
          <div>
            <h3 style="margin: 0 0 4px 0; color: var(--terminal-green);">${typeEmoji} ${artefact.type.toUpperCase()}</h3>
            <p style="margin: 0; color: var(--text-secondary); font-size: 11px;">ID: ${artefact.id}</p>
          </div>
          <button class="danger" onclick="app.deleteArtefact('${artefactId}')">🗑️ Delete</button>
        </div>

        <!-- Common Fields -->
        <div style="margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px solid var(--border-color);">
          <h4 style="color: var(--terminal-amber); font-size: 11px; margin-bottom: 12px;">COMMON PROPERTIES</h4>

          <div class="form-row">
            <div class="form-group">
              <label>Title</label>
              <input type="text" id="artefact-title" value="${this.escapeHtml(artefact.title)}" onchange="app.updateCurrentArtefact('title', this.value)">
            </div>
            <div class="form-group">
              <label>Visible Title (Player sees)</label>
              <input type="text" id="artefact-visible-title" value="${this.escapeHtml(artefact.visibleTitle)}" onchange="app.updateCurrentArtefact('visibleTitle', this.value)">
            </div>
          </div>

          <div class="form-group">
            <label>Tags (comma-separated)</label>
            <input type="text" id="artefact-tags" value="${artefact.tags.join(', ')}" onchange="app.updateCurrentArtefact('tags', this.value.split(',').map(t => t.trim()).filter(t => t))">
          </div>

          <div class="form-group">
            <label>Notes (Internal)</label>
            <textarea id="artefact-notes" placeholder="Internal notes about this artefact..." onchange="app.updateCurrentArtefact('notes', this.value)">${artefact.notes || ''}</textarea>
          </div>
        </div>

        <!-- Type-Specific Fields -->
        <div style="margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px solid var(--border-color);">
          <h4 style="color: var(--terminal-amber); font-size: 11px; margin-bottom: 12px;">CONTENT</h4>
          ${typeFields}
        </div>

        <!-- Release & Locking -->
        <div style="margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px solid var(--border-color);">
          <h4 style="color: var(--terminal-amber); font-size: 11px; margin-bottom: 12px;">RELEASE & ACCESS</h4>

          <div class="form-row">
            <div class="form-group">
              <label>Release Time (minutes after start)</label>
              <input type="number" id="artefact-release-time" value="${artefact.releaseAtTime}" onchange="app.updateCurrentArtefact('releaseAtTime', parseInt(this.value))">
            </div>
            <div class="form-group">
              <label>&nbsp;</label>
              <button class="secondary" onclick="app.openConditionBuilder()">⚙️ Set Conditions</button>
            </div>
          </div>

          ${artefact.releaseTriggers && artefact.releaseTriggers.length > 0 ? `
            <div style="background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 4px; padding: 12px; margin-bottom: 12px; font-size: 12px;">
              <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                <div>
                  <div style="color: var(--text-secondary); font-size: 11px; margin-bottom: 4px;">Release Conditions:</div>
                  <div style="color: var(--text-primary); font-family: monospace; line-height: 1.5;">${this.formatConditionPreview(story, artefact.releaseTriggers[0])}</div>
                </div>
                <button class="secondary" style="white-space: nowrap; font-size: 12px; padding: 4px 8px;" onclick="app.openConditionBuilder()">Edit</button>
              </div>
            </div>
          ` : ''}

          <div class="form-group">
            <label>
              <input type="checkbox" id="artefact-locked" ${artefact.locked ? 'checked' : ''} onchange="app.updateCurrentArtefact('locked', this.checked)">
              Password Protected
            </label>
          </div>

          <div id="lock-fields" style="display: ${artefact.locked ? 'block' : 'none'};">
            <div class="form-group">
              <label>Password Key</label>
              <input type="text" id="artefact-password" value="${artefact.lockPassword || ''}" onchange="app.updateCurrentArtefact('lockPassword', this.value)" placeholder="e.g., correct-password">
            </div>
            <div class="form-group">
              <label>Hint (shown to player)</label>
              <input type="text" id="artefact-hint" value="${artefact.lockHint || ''}" onchange="app.updateCurrentArtefact('lockHint', this.value)" placeholder="Hint for the password">
            </div>
          </div>
        </div>
      </div>
    `;

    // Set up lock field toggle
    const lockCheckbox = document.getElementById('artefact-locked');
    const lockFields = document.getElementById('lock-fields');
    if (lockCheckbox) {
      lockCheckbox.addEventListener('change', function() {
        if (lockFields) {
          lockFields.style.display = this.checked ? 'block' : 'none';
        }
      });
    }

    // Validate message artifact fields if applicable
    if (artefact.type === 'message') {
      app.validateMessageFields(artefact);
    }

    // Initialize markdown editor for email and message types
    if (artefact.type === 'email' || artefact.type === 'message') {
      setTimeout(() => {
        const containerId = artefact.type === 'email' ? 'email-editor-container' : 'message-editor-container';
        const container = document.getElementById(containerId);

        if (container) {
          const editor = new ConversationMarkdownEditor({
            type: artefact.type,
            initialMarkdown: artefact.markdownContent || '',
            story: story,
            onSave: (markdown) => {
              app.updateCurrentArtefact('markdownContent', markdown);
              app.showToast(`✓ ${artefact.type === 'email' ? 'Email' : 'Conversation'} saved`);
            },
            onCancel: () => {
              // No action needed for cancel
            }
          });
          editor.render(container);
        }
      }, 0);
    }
  },

  // Get type-specific form fields
  getTypeSpecificFields(story, artefact) {
    let html = '';

    switch (artefact.type) {
      case 'email':
        // Use markdown editor for new conversation format
        html = `
          <div id="email-editor-container" style="height: 600px; border: 1px solid var(--border-color); border-radius: 4px; margin-bottom: 20px;"></div>
          <input type="hidden" id="artefact-markdown-content" value="${this.escapeHtml(artefact.markdownContent || '')}">
          <input type="hidden" id="artefact-reveal-time" value="${artefact.revealTime || ''}">
        `;
        break;

      case 'message':
        // Use markdown editor for new conversation format
        html = `
          <div id="message-editor-container" style="height: 600px; border: 1px solid var(--border-color); border-radius: 4px; margin-bottom: 20px;"></div>
          <input type="hidden" id="artefact-markdown-content" value="${this.escapeHtml(artefact.markdownContent || '')}">
          <input type="hidden" id="artefact-reveal-time" value="${artefact.revealTime || ''}">
        `;
        break;

      case 'calendar':
        html = `
          <div class="form-row">
            <div class="form-group">
              <label>Date</label>
              <input type="date" id="artefact-date" value="${artefact.date}" onchange="app.updateCurrentArtefact('date', this.value)">
            </div>
            <div class="form-group">
              <label>Time</label>
              <input type="time" id="artefact-time" value="${artefact.time}" onchange="app.updateCurrentArtefact('time', this.value)">
            </div>
          </div>
          <div class="form-group">
            <label>Description</label>
            <textarea id="artefact-cal-desc" onchange="app.updateCurrentArtefact('description', this.value)">${this.escapeHtml(artefact.description)}</textarea>
          </div>
          <div class="form-group">
            <label>Attendees (comma-separated names)</label>
            <input type="text" id="artefact-attendees" value="${artefact.attendees?.join(', ') || ''}" placeholder="e.g., Alice, Bob, Charlie" onchange="app.updateCurrentArtefact('attendees', this.value.split(',').map(a => a.trim()).filter(a => a))">
          </div>
        `;
        break;

      case 'document':
        const folders = story.folders;
        html = `
          <div class="form-group">
            <label>Folder</label>
            <select id="artefact-folder" onchange="app.updateCurrentArtefact('folderId', this.value)">
              <option value="">-- Select Folder (optional) --</option>
              ${folders.map(f => `<option value="${f.id}" ${f.id === artefact.folderId ? 'selected' : ''}>${this.escapeHtml(f.name)}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label>Content</label>
            <textarea id="artefact-doc-content" onchange="app.updateCurrentArtefact('content', this.value)">${this.escapeHtml(artefact.content)}</textarea>
          </div>
        `;
        break;

      case 'image':
        html = `
          <div class="form-group">
            <label>Image File</label>
            <div style="display: flex; gap: 8px; margin-bottom: 8px;">
              <input type="file" id="artefact-image-file" accept="image/*" style="flex: 1;">
              <button type="button" class="secondary" onclick="app.handleImageUpload()" style="white-space: nowrap;">Set Path</button>
            </div>
            <p style="font-size: 11px; color: var(--text-secondary); margin: 0 0 8px 0;">
              Select an image file, then click "Set Path" to update the path field.
            </p>
          </div>
          <div class="form-group">
            <label>Asset Path</label>
            <input type="text" id="artefact-asset" value="${artefact.assetPath}" onchange="app.updateCurrentArtefact('assetPath', this.value)" placeholder="e.g., assets/images/photo.jpg">
          </div>
          <div class="form-group">
            <label>Caption</label>
            <input type="text" id="artefact-caption" value="${artefact.caption}" onchange="app.updateCurrentArtefact('caption', this.value)">
          </div>
          ${artefact.assetPath ? `<div style="margin-top: 12px; border: 1px solid var(--border-color); padding: 8px; background: var(--bg-secondary); border-radius: 4px;"><img src="${artefact.assetPath}" style="max-width: 100%; max-height: 200px; border-radius: 2px;" alt="Preview"></div>` : ''}
        `;
        break;

      case 'audio':
        html = `
          <div class="form-group">
            <label>Audio File</label>
            <div style="display: flex; gap: 8px; margin-bottom: 8px;">
              <input type="file" id="artefact-audio-file" accept="audio/*" style="flex: 1;">
              <button type="button" class="secondary" onclick="app.handleAudioUpload()" style="white-space: nowrap;">Set Path</button>
            </div>
            <p style="font-size: 11px; color: var(--text-secondary); margin: 0 0 8px 0;">
              Select an audio file, then click "Set Path" to update the path field.
            </p>
          </div>
          <div class="form-group">
            <label>Asset Path</label>
            <input type="text" id="artefact-audio-asset" value="${artefact.assetPath}" onchange="app.updateCurrentArtefact('assetPath', this.value)" placeholder="e.g., assets/audio/track.mp3">
          </div>
          <div class="form-group">
            <label>Description</label>
            <input type="text" id="artefact-audio-desc" value="${artefact.description}" onchange="app.updateCurrentArtefact('description', this.value)">
          </div>
        `;
        break;
    }

    return html;
  },

  // Render timeline table
  renderTimeline(story) {
    const tbody = document.getElementById('timeline-body');
    if (!tbody) return;

    const sorted = State.getArtefactsByTime(story);

    if (sorted.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--text-secondary);">No artefacts yet. Create one to get started.</td></tr>';
      return;
    }

    tbody.innerHTML = sorted.map(artefact => {
      const lockReason = this.getArtefactLockReason(story, artefact);
      const lockCell = lockReason ? `<span title="${this.escapeHtml(lockReason)}" style="cursor: help;">🔒 Locked</span>` : '-';
      return `
      <tr onclick="app.selectArtefact('${artefact.id}')">
        <td class="timeline-time">T+${artefact.releaseAtTime}min</td>
        <td>${this.escapeHtml(artefact.title)}</td>
        <td>${artefact.type.toUpperCase()}</td>
        <td class="timeline-locked">${lockCell}</td>
        <td class="timeline-gated">${artefact.releaseTriggers && artefact.releaseTriggers.length > 0 ? '⚙️ Yes' : '-'}</td>
      </tr>
    `;
    }).join('');
  },

  // Render world builder entities
  renderWorldBuilder(story) {
    // Render senders
    this.renderEntityList(story.emailSenders, 'senders-list', (entity) => `${this.escapeHtml(entity.name)} <span style="color: var(--text-secondary);">(${entity.email})</span>`);

    // Render threads
    this.renderThreadsList(story);

    // Render participants
    this.renderEntityList(story.imParticipants, 'participants-list', (entity) => `${this.escapeHtml(entity.displayName)} <span style="color: var(--text-secondary);">@${entity.username}</span>`);

    // Render conversations
    this.renderConversationsList(story);

    // Render folders
    this.renderEntityList(story.folders, 'folders-list', (entity) => `📁 ${this.escapeHtml(entity.name)}`);
  },

  // Render email threads list with counts
  renderThreadsList(story) {
    const list = document.getElementById('threads-list');
    if (!list) return;

    if (story.emailThreads.length === 0) {
      list.innerHTML = '<p style="color: var(--text-secondary); text-align: center; font-size: 11px; padding: 12px;">No threads yet. Add one above ↑</p>';
      return;
    }

    list.innerHTML = story.emailThreads.map(thread => {
      const count = story.artefacts.filter(a => a.type === 'email' && a.threadId === thread.id).length;
      return `
        <li class="entity-item">
          <span>
            <strong>${this.escapeHtml(thread.name)}</strong>
            <span style="color: var(--text-secondary); font-size: 12px;"> (${count} email${count !== 1 ? 's' : ''})</span>
          </span>
          <div class="entity-actions">
            <button onclick="app.deleteEntity('thread', '${thread.id}')" class="danger">×</button>
          </div>
        </li>
      `;
    }).join('');
  },

  // Render IM conversations list with counts
  renderConversationsList(story) {
    const list = document.getElementById('conversations-list');
    if (!list) return;

    if (story.imConversations.length === 0) {
      list.innerHTML = '<p style="color: var(--text-secondary); text-align: center; font-size: 11px; padding: 12px;">No conversations yet. Add one above ↑</p>';
      return;
    }

    list.innerHTML = story.imConversations.map(conversation => {
      const count = story.artefacts.filter(a => a.type === 'message' && a.conversationId === conversation.id).length;
      return `
        <li class="entity-item">
          <span>
            <strong>${this.escapeHtml(conversation.name)}</strong>
            <span style="color: var(--text-secondary); font-size: 12px;"> (${count} message${count !== 1 ? 's' : ''})</span>
          </span>
          <div class="entity-actions">
            <button onclick="app.deleteEntity('conversation', '${conversation.id}')" class="danger">×</button>
          </div>
        </li>
      `;
    }).join('');
  },

  // Render a list of entities
  renderEntityList(entities, listId, formatFn) {
    const list = document.getElementById(listId);
    if (!list) return;

    if (entities.length === 0) {
      list.innerHTML = '<p style="color: var(--text-secondary); text-align: center; font-size: 11px; padding: 12px;">No items yet. Add one above ↑</p>';
      return;
    }

    list.innerHTML = entities.map(entity => `
      <li class="entity-item">
        <span>${formatFn(entity)}</span>
        <div class="entity-actions">
          <button onclick="app.deleteEntity('${entity.type}', '${entity.id}')" class="danger">×</button>
        </div>
      </li>
    `).join('');
  },

  // Show/hide login fields based on checkbox
  toggleLoginFields() {
    const checkbox = document.getElementById('settings-login-required');
    const fields = document.getElementById('login-fields');
    if (checkbox && fields) {
      fields.style.display = checkbox.checked ? 'block' : 'none';
    }
  },

  // Update global settings form fields from story data
  updateGlobalSettingsFields(story) {
    const settings = story.globalSettings || {};
    const playerProfile = settings.playerProfile || {};

    // Update each field
    const fieldUpdates = [
      { id: 'settings-story-start-datetime', value: settings.storyStartDateTime || '' },
      { id: 'settings-timezone', value: settings.timeZone || 'UTC' },
      { id: 'settings-player-name', value: playerProfile.name || 'Player' },
      { id: 'settings-player-email', value: playerProfile.email || 'player@email.com' }
    ];

    fieldUpdates.forEach(({ id, value }) => {
      const element = document.getElementById(id);
      if (element) {
        element.value = value;
      }
    });
  },

  // Format a single condition for human readability
  formatConditionPreview(story, trigger) {
    if (!trigger) return 'No conditions set';

    const format = (t) => {
      switch (t.type) {
        case 'time':
          return `After ${t.minutes} minutes`;
        case 'artefact_opened':
          const openedArtefact = story.artefacts.find(a => a.id === t.artefactId);
          return `After "${openedArtefact?.title || 'Unknown'}" is opened`;
        case 'artefact_read':
          const readArtefact = story.artefacts.find(a => a.id === t.artefactId);
          return `After "${readArtefact?.title || 'Unknown'}" is read`;
        case 'password':
          return `When password "${t.value}" is unlocked`;
        case 'app_opened':
          return `After "${t.appName}" is opened`;
        case 'condition_group':
          const op = t.operator === 'AND' ? ' AND ' : ' OR ';
          return t.rules?.map(format).join(op) || 'Complex condition';
        default:
          return 'Unknown condition type';
      }
    };

    return format(trigger);
  },

  // Generate human-readable lock reason from artefact conditions
  getArtefactLockReason(story, artefact) {
    const reasons = [];

    // Check password lock
    if (artefact.locked) {
      reasons.push('Password protected');
    }

    // Check release triggers
    if (artefact.releaseTriggers && artefact.releaseTriggers.length > 0) {
      const triggers = artefact.releaseTriggers;

      const formatTrigger = (trigger) => {
        switch (trigger.type) {
          case 'time':
            return `Until T+${trigger.minutes}min`;
          case 'artefact_opened':
            const openedArtefact = story.artefacts.find(a => a.id === trigger.artefactId);
            return `Until "${openedArtefact?.title || 'Unknown'}" opened`;
          case 'artefact_read':
            const readArtefact = story.artefacts.find(a => a.id === trigger.artefactId);
            return `Until "${readArtefact?.title || 'Unknown'}" read`;
          case 'password':
            return `Password: "${trigger.value}"`;
          case 'app_opened':
            return `Until "${trigger.appName}" opened`;
          case 'condition_group':
            const operator = trigger.operator === 'AND' ? ' AND ' : ' OR ';
            return trigger.rules?.map(formatTrigger).join(operator) || 'Complex condition';
          default:
            return 'Unknown condition';
        }
      };

      triggers.forEach(trigger => {
        reasons.push(formatTrigger(trigger));
      });
    }

    return reasons.length > 0 ? reasons.join(' + ') : null;
  },

  // Escape HTML to prevent XSS
  escapeHtml(text) {
    if (!text) return '';
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
  }
};
