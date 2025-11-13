import './bootstrap';

// Upload Dashboard Functionality
document.addEventListener('DOMContentLoaded', function() {
    const uploadsTable = document.getElementById('uploads-table');
    const uploadForm = document.getElementById('upload-form');
    const submitBtn = document.getElementById('submit-btn');
    let uploads = [];

    // Toast notification system
    function showToast(message, type = 'success') {
        // Create toast container if it doesn't exist
        let toastContainer = document.getElementById('toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.id = 'toast-container';
            toastContainer.className = 'fixed top-4 left-1/2 -translate-x-1/2 z-50 space-y-2 flex flex-col items-center';
            document.body.appendChild(toastContainer);
        }

        // Create toast element
        const toast = document.createElement('div');
        const bgColor = type === 'success' ? 'bg-gray-900' : 'bg-red-900';
        const borderColor = type === 'success' ? 'border-gray-700' : 'border-red-700';

        toast.className = `${bgColor} ${borderColor} border-b-4 text-white px-6 py-4 rounded-lg shadow-xl transform -translate-y-full opacity-0 transition-all duration-300 ease-out min-w-96 max-w-md`;
        toast.innerHTML = `
            <div class="flex items-start">
                <div class="flex-1">
                    <p class="text-sm font-medium">${message}</p>
                </div>
                <button class="ml-4 text-white hover:text-gray-300 focus:outline-none">
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                    </svg>
                </button>
            </div>
        `;

        toastContainer.appendChild(toast);

        // Slide down animation
        setTimeout(() => {
            toast.classList.remove('-translate-y-full', 'opacity-0');
            toast.classList.add('translate-y-0', 'opacity-100');
        }, 10);

        // Close button functionality
        const closeBtn = toast.querySelector('button');
        closeBtn.addEventListener('click', () => {
            removeToast(toast);
        });

        // Auto remove after 5 seconds
        setTimeout(() => {
            removeToast(toast);
        }, 5000);
    }

    function removeToast(toast) {
        toast.classList.remove('translate-y-0', 'opacity-100');
        toast.classList.add('-translate-y-full', 'opacity-0');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }

    // Handle form submission
    if (uploadForm) {
        uploadForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const formData = new FormData(uploadForm);
            submitBtn.disabled = true;
            submitBtn.textContent = 'Uploading...';

            try {
                const response = await axios.post('/upload', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });

                // Show success toast
                showToast(response.data.message, 'success');

                uploadForm.reset();

                // Immediately update the table with the new upload
                if (response.data.upload) {
                    updateUpload(response.data.upload);
                    setTimeout(() => animateRow(response.data.upload.id), 100);
                }

            } catch (error) {
                console.error('Upload error:', error);
                const errorMsg = error.response?.data?.message || 'An error occurred during upload';

                // Show error toast
                showToast(errorMsg, 'error');
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
                    <td colspan="7" class="px-6 py-4 text-center text-gray-900">
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
                    <td colspan="7" class="px-6 py-4 text-center text-gray-600">
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
            const executionTime = formatExecutionTime(upload.created_at, upload.updated_at);

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
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-center">
                        <span class="font-medium">${executionTime}</span>
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

    // Format execution time (duration between created_at and updated_at)
    function formatExecutionTime(createdAt, updatedAt) {
        const created = new Date(createdAt);
        const updated = new Date(updatedAt);
        const diffMs = updated - created;
        const diffSeconds = Math.floor(diffMs / 1000);

        if (diffSeconds < 1) return '< 1s';
        if (diffSeconds < 60) return `${diffSeconds}s`;

        const minutes = Math.floor(diffSeconds / 60);
        const remainingSeconds = diffSeconds % 60;

        if (minutes < 60) {
            return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
        }

        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;

        if (hours < 24) {
            return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
        }

        const days = Math.floor(hours / 24);
        const remainingHours = hours % 24;

        return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
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
            updateUpload(e.upload);
            setTimeout(() => animateRow(e.upload.id), 100);
        })
        .listen('.upload.updated', (e) => {
            // Get the previous status before updating
            const previousUpload = uploads.find(u => u.id === e.upload.id);
            const previousStatus = previousUpload?.status?.name;

            // Update the upload
            updateUpload(e.upload);
            animateRow(e.upload.id);

            // Show toast notification when status changes to completed
            if (e.upload.status.name === 'completed' && previousStatus !== 'completed') {
                showToast(`Upload #${e.upload.id} (${e.upload.document_name}) has been completed successfully!`, 'success');
            }
        });
});
