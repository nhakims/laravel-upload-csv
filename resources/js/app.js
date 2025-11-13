import './bootstrap';

// Upload Dashboard Functionality
document.addEventListener('DOMContentLoaded', function() {
    const uploadsTable = document.getElementById('uploads-table');
    const uploadForm = document.getElementById('upload-form');
    const submitBtn = document.getElementById('submit-btn');
    const uploadMessage = document.getElementById('upload-message');
    let uploads = [];

    // Handle form submission
    if (uploadForm) {
        uploadForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const formData = new FormData(uploadForm);
            submitBtn.disabled = true;
            submitBtn.textContent = 'Uploading...';
            uploadMessage.classList.add('hidden');

            try {
                const response = await axios.post('/upload', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });

                uploadMessage.className = 'mt-4 p-4 bg-gray-100 border-l-4 border-black rounded transition-opacity duration-1000 opacity-100';
                uploadMessage.innerHTML = `
                    <p class="text-sm text-gray-900">
                        <span class="font-medium">Success!</span> ${response.data.message}
                    </p>
                `;
                uploadMessage.classList.remove('hidden');

                // Fade out success message after 5 seconds
                setTimeout(() => {
                    uploadMessage.classList.remove('opacity-100');
                    uploadMessage.classList.add('opacity-0');
                    // Hide after fade completes
                    setTimeout(() => {
                        uploadMessage.classList.add('hidden');
                        uploadMessage.classList.remove('opacity-0');
                        uploadMessage.classList.add('opacity-100');
                    }, 1000);
                }, 5000);

                uploadForm.reset();

                // Immediately update the table with the new upload
                if (response.data.upload) {
                    updateUpload(response.data.upload);
                    setTimeout(() => animateRow(response.data.upload.id), 100);
                }

            } catch (error) {
                console.error('Upload error:', error);
                const errorMsg = error.response?.data?.message || 'An error occurred during upload';
                uploadMessage.className = 'mt-4 p-4 bg-gray-200 border-l-4 border-gray-900 rounded';
                uploadMessage.innerHTML = `
                    <p class="text-sm text-gray-900">
                        <span class="font-medium">Error!</span> ${errorMsg}
                    </p>
                `;
                uploadMessage.classList.remove('hidden');
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Upload Document';
            }
        });
    }

    // Fetch initial uploads
    async function fetchUploads() {
        try {
            const response = await axios.get('/api/uploads');
            uploads = response.data;
            renderUploads();
        } catch (error) {
            console.error('Error fetching uploads:', error);
            uploadsTable.innerHTML = `
                <tr>
                    <td colspan="6" class="px-6 py-4 text-center text-gray-900">
                        Error loading uploads. Please refresh the page.
                    </td>
                </tr>
            `;
        }
    }

    // Render uploads table
    function renderUploads() {
        if (uploads.length === 0) {
            uploadsTable.innerHTML = `
                <tr>
                    <td colspan="6" class="px-6 py-4 text-center text-gray-600">
                        No uploads found.
                    </td>
                </tr>
            `;
            return;
        }

        uploadsTable.innerHTML = uploads.map(upload => {
            const percentage = upload.total_lines > 0
                ? Math.round((upload.current_line / upload.total_lines) * 100)
                : 0;
            const statusColor = getStatusColor(upload.status.name);
            const relativeTime = formatRelativeTime(upload.created_at);
            const fullDate = new Date(upload.created_at).toLocaleString();

            return `
                <tr class="hover:bg-gray-50 transition-colors duration-150" data-upload-id="${upload.id}">
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #${upload.id}
                    </td>
                    <td class="px-6 py-4 text-sm text-gray-700">
                        ${upload.document_name}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        <div class="w-full bg-gray-200 rounded-full h-2.5" style="min-width: 150px;">
                            <div class="bg-gray-900 h-2.5 rounded-full transition-all duration-300" style="width: ${percentage}%"></div>
                        </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        <span class="font-medium">${formatNumber(upload.current_line)}/${formatNumber(upload.total_lines)}</span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColor}">
                            ${upload.status.name}
                        </span>
                    </td>
                    <td class="px-6 py-4 text-sm text-gray-500">
                        <div class="font-medium text-gray-700">${relativeTime}</div>
                        <div class="text-xs text-gray-500">${fullDate}</div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    // Get status badge color
    function getStatusColor(status) {
        const colors = {
            'pending': 'bg-yellow-100 text-yellow-800',
            'processing': 'bg-blue-100 text-blue-800',
            'completed': 'bg-green-100 text-green-800',
            'failed': 'bg-red-100 text-red-800'

        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    }

    // Format number with thousand delimiters
    function formatNumber(num) {
        return num.toLocaleString('en-US');
    }

    // Format date to human-readable relative time
    function formatRelativeTime(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now - date) / 1000);

        if (seconds < 10) return 'just now';
        if (seconds < 60) return `${seconds} seconds ago`;

        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return minutes === 1 ? '1 minute ago' : `${minutes} minutes ago`;

        const hours = Math.floor(minutes / 60);
        if (hours < 24) return hours === 1 ? '1 hour ago' : `${hours} hours ago`;

        const days = Math.floor(hours / 24);
        if (days < 7) return days === 1 ? '1 day ago' : `${days} days ago`;

        const weeks = Math.floor(days / 7);
        if (weeks < 4) return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`;

        const months = Math.floor(days / 30);
        if (months < 12) return months === 1 ? '1 month ago' : `${months} months ago`;

        const years = Math.floor(days / 365);
        return years === 1 ? '1 year ago' : `${years} years ago`;
    }

    // Update specific upload in the list
    function updateUpload(updatedUpload) {
        const index = uploads.findIndex(u => u.id === updatedUpload.id);
        if (index !== -1) {
            uploads[index] = updatedUpload;
        } else {
            uploads.unshift(updatedUpload);
        }
        renderUploads();
    }

    // Add animation to new row
    function animateRow(uploadId) {
        const row = document.querySelector(`[data-upload-id="${uploadId}"]`);
        if (row) {
            row.classList.add('bg-gray-100');
            setTimeout(() => {
                row.classList.remove('bg-gray-100');
            }, 2000);
        }
    }

    // Initialize
    fetchUploads();

    // Poll for updates every 5 seconds as a fallback
    setInterval(() => {
        fetchUploads();
    }, 5000);

    // Listen for WebSocket events
    window.Echo.channel('uploads')
        .listen('.upload.created', (e) => {
            console.log('Upload created:', e.upload);
            updateUpload(e.upload);
            setTimeout(() => animateRow(e.upload.id), 100);
        })
        .listen('.upload.updated', (e) => {
            console.log('Upload updated:', e.upload);
            updateUpload(e.upload);
            animateRow(e.upload.id);
        });
});
