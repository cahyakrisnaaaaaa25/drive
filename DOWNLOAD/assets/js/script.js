/**
 * J Soft Downloads - Flat Design
 * No animations, no effects, just clean
 */

(function() {
    'use strict';

    const CONFIG = {
        filesJsonPath: 'files.json',
        downloadFolder: 'DOWNLOAD',
    };

    let allFiles = [];
    let currentFilter = 'all';

    const SOFTWARE_CATEGORIES = {
        browser: ['Chrome', 'Firefox', 'Brave', 'Opera', 'Vivaldi', 'Edge'],
        dev: ['VSCode', 'Git', 'Postman', 'DBeaver', 'Docker', 'Sublime', 'Notepad++', 'Python'],
        media: ['VLC', 'Spotify', 'OBS', 'HandBrake'],
        utility: ['7z', 'WinRAR', 'Everything', 'CCleaner', 'Speccy', 'CPU-Z', 'Rainmeter', 'PowerToys', 'ShareX', 'Lightshot', 'XnView', 'SumatraPDF', 'PDF24'],
        chat: ['Discord', 'Telegram', 'Zoom', 'Teams', 'Viber', 'LINE', 'WhatsApp', 'Thunderbird', 'TeamViewer', 'AnyDesk', 'Notion']
    };

    const FILE_TYPES = {
        exe: { icon: 'exe', label: 'EXE' },
        msi: { icon: 'exe', label: 'MSI' },
        dmg: { icon: 'mac', label: 'DMG' },
        pkg: { icon: 'mac', label: 'PKG' },
        zip: { icon: 'fa-file-archive', label: 'ZIP' },
        rar: { icon: 'fa-file-archive', label: 'RAR' },
        '7z': { icon: 'fa-file-archive', label: '7Z' },
        tar: { icon: 'fa-file-archive', label: 'TAR' },
        gz: { icon: 'fa-file-archive', label: 'GZ' },
        pdf: { icon: 'fa-file-pdf', label: 'PDF' },
        jpg: { icon: 'fa-file-image', label: 'IMG' },
        jpeg: { icon: 'fa-file-image', label: 'IMG' },
        png: { icon: 'fa-file-image', label: 'IMG' },
        gif: { icon: 'fa-file-image', label: 'IMG' },
        webp: { icon: 'fa-file-image', label: 'IMG' },
        svg: { icon: 'fa-file-image', label: 'SVG' },
        doc: { icon: 'fa-file-word', label: 'DOC' },
        docx: { icon: 'fa-file-word', label: 'DOCX' },
        xls: { icon: 'fa-file-excel', label: 'XLS' },
        xlsx: { icon: 'fa-file-excel', label: 'XLSX' },
        ppt: { icon: 'fa-file-powerpoint', label: 'PPT' },
        pptx: { icon: 'fa-file-powerpoint', label: 'PPTX' },
        txt: { icon: 'fa-file-alt', label: 'TXT' },
        md: { icon: 'fa-file-alt', label: 'MD' },
        mp4: { icon: 'fa-file-video', label: 'MP4' },
        mov: { icon: 'fa-file-video', label: 'MOV' },
        avi: { icon: 'fa-file-video', label: 'AVI' },
        mkv: { icon: 'fa-file-video', label: 'MKV' },
        mp3: { icon: 'fa-file-audio', label: 'MP3' },
        wav: { icon: 'fa-file-audio', label: 'WAV' },
        flac: { icon: 'fa-file-audio', label: 'FLAC' },
        aac: { icon: 'fa-file-audio', label: 'AAC' },
        iso: { icon: 'fa-compact-disc', label: 'ISO' },
        default: { icon: 'fa-file', label: 'FILE' }
    };

    const SVG_ICONS = {
        exe: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="exeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:#1e40af"/>
                    <stop offset="100%" style="stop-color:#3b82f6"/>
                </linearGradient>
            </defs>
            <rect x="2" y="2" width="20" height="20" rx="4" fill="url(#exeGrad)"/>
            <rect x="5.5" y="4.5" width="13" height="15" rx="2" fill="white"/>
            <rect x="5.5" y="4.5" width="13" height="4" rx="2" fill="url(#exeGrad)"/>
            <circle cx="7.5" cy="6.5" r="0.8" fill="white"/>
            <circle cx="9.3" cy="6.5" r="0.8" fill="white"/>
            <circle cx="11.1" cy="6.5" r="0.8" fill="white"/>
            <rect x="7" y="11" width="10" height="1.4" rx="0.7" fill="url(#exeGrad)" opacity="0.4"/>
            <rect x="7" y="13.4" width="7" height="1.4" rx="0.7" fill="url(#exeGrad)" opacity="0.3"/>
            <rect x="7" y="15.8" width="8" height="1.4" rx="0.7" fill="url(#exeGrad)" opacity="0.2"/>
        </svg>`,
        mac: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="3" y="3" width="18" height="18" rx="3" fill="currentColor" opacity="0.9"/>
            <path d="M12 7c-1.5 0-2.5 1-2.5 2.5S10.5 12 12 12s2.5-1 2.5-2.5S13.5 7 12 7z" fill="white"/>
            <path d="M8 15c0-2 2-3 4-3s4 1 4 3" stroke="white" stroke-width="1.5" fill="none" stroke-linecap="round"/>
        </svg>`
    };

    // ==========================================
    // INIT
    // ==========================================
    document.addEventListener('DOMContentLoaded', () => {
        initSearch();
        initFilters();
        initKeyboard();
        loadFiles();
    });

    // ==========================================
    // LOAD FILES
    // ==========================================
    async function loadFiles() {
        const emptyState = document.getElementById('emptyState');
        const fileCount = document.getElementById('fileCount');

        try {
            let data = null;
            if (window.downloadFilesData && window.downloadFilesData.files) {
                data = window.downloadFilesData;
            } else {
                const response = await fetch(CONFIG.filesJsonPath);
                if (!response.ok) throw new Error('Failed');
                data = await response.json();
            }
            
            allFiles = data.files || data || [];
            allFiles.sort((a, b) => a.name.localeCompare(b.name));
            
            renderFiles(allFiles);
            fileCount.textContent = `${allFiles.length} files`;
            
            if (allFiles.length === 0) {
                emptyState.style.display = 'block';
            }
        } catch (error) {
            console.error('Error:', error);
            document.getElementById('filesContainer').innerHTML = '';
            emptyState.style.display = 'block';
            fileCount.textContent = '0 files';
        }
    }

    // ==========================================
    // RENDER
    // ==========================================
    function renderFiles(files) {
        const container = document.getElementById('filesContainer');
        const emptyState = document.getElementById('emptyState');
        const fileCount = document.getElementById('fileCount');
        
        container.innerHTML = '';
        
        if (files.length === 0) {
            emptyState.style.display = 'block';
            fileCount.textContent = '0 files';
            return;
        }
        
        emptyState.style.display = 'none';
        fileCount.textContent = `${files.length} file${files.length !== 1 ? 's' : ''}`;
        
        files.forEach(file => {
            container.appendChild(createFileRow(file));
        });
    }

    function createFileRow(file) {
        const ext = file.name.split('.').pop().toLowerCase();
        const typeInfo = FILE_TYPES[ext] || FILE_TYPES.default;
        const downloadUrl = file.path || `${CONFIG.downloadFolder}/${encodeURIComponent(file.name)}`;
        
        const row = document.createElement('div');
        row.className = 'file-row';
        
        let iconHtml = '';
        if (typeInfo.icon === 'exe') {
            iconHtml = `<div class="file-icon exe">${SVG_ICONS.exe}</div>`;
        } else if (typeInfo.icon === 'mac') {
            iconHtml = `<div class="file-icon exe">${SVG_ICONS.mac}</div>`;
        } else {
            iconHtml = `<div class="file-icon ${typeInfo.icon === 'fa-file' ? 'default' : ext}">
                <i class="fas ${typeInfo.icon}"></i>
            </div>`;
        }
        
        row.innerHTML = `
            ${iconHtml}
            <div class="file-body">
                <div class="file-name" title="${escapeHtml(file.name)}">${escapeHtml(file.name)}</div>
                <div class="file-meta">
                    <span>${formatSize(file.size)}</span>
                    <span>${typeInfo.label}</span>
                    <span>${formatDate(file.date)}</span>
                </div>
            </div>
            <div class="file-actions">
                <a href="${downloadUrl}" class="download-btn" download title="Download ${escapeHtml(file.name)}">
                    <i class="fas fa-download"></i>
                    <span>Download</span>
                </a>
            </div>
        `;
        
        return row;
    }

    // ==========================================
    // SEARCH & FILTER
    // ==========================================
    function initSearch() {
        const input = document.getElementById('searchInput');
        input.addEventListener('input', (e) => {
            applyFilter(currentFilter, e.target.value.toLowerCase().trim());
        });
    }

    function initFilters() {
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const filter = this.dataset.filter;
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                currentFilter = filter;
                applyFilter(filter, document.getElementById('searchInput').value.toLowerCase().trim());
            });
        });
    }

    function applyFilter(category, query) {
        let filtered = allFiles;
        
        if (category !== 'all') {
            const keywords = SOFTWARE_CATEGORIES[category] || [];
            filtered = filtered.filter(file => 
                keywords.some(k => file.name.toLowerCase().includes(k.toLowerCase()))
            );
        }
        
        if (query) {
            filtered = filtered.filter(file => file.name.toLowerCase().includes(query));
        }
        
        renderFiles(filtered);
    }

    // ==========================================
    // KEYBOARD
    // ==========================================
    function initKeyboard() {
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                document.getElementById('searchInput').focus();
            }
            if (e.key === 'Escape') {
                document.getElementById('searchInput').value = '';
                document.getElementById('searchInput').blur();
                applyFilter(currentFilter, '');
            }
        });
    }

    // ==========================================
    // UTILITIES
    // ==========================================
    function formatSize(bytes) {
        if (!bytes) return 'Unknown';
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        if (i === 0) return bytes + ' ' + sizes[i];
        return (bytes / Math.pow(1024, i)).toFixed(2) + ' ' + sizes[i];
    }

    function formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '';
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

})();
