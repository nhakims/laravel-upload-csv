<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Upload Processing Dashboard</title>

    @vite(['resources/css/app.css', 'resources/js/app.js'])
</head>
<body class="bg-gray-50 min-h-screen">
    <div class="container mx-auto px-4 py-8">
        <!-- Upload Form -->
        <div class="bg-white rounded-lg shadow-lg p-6 mb-6 border border-gray-200">
            <h2 class="text-xl font-semibold text-black mb-4">Upload New Document</h2>
            <form id="upload-form" enctype="multipart/form-data" class="space-y-4">
                @csrf
                <div>
                    <label for="document" class="block text-sm font-medium text-gray-900 mb-2">CSV Document</label>
                    <input type="file" id="document" name="document" accept=".csv,.txt" required
                           class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-900 hover:file:bg-gray-200">
                </div>
                <div class="flex items-center justify-between">
                    <p class="text-sm text-gray-600">Maximum file size: 50MB</p>
                    <button type="submit" id="submit-btn"
                            class="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 transition-colors">
                        Upload Document
                    </button>
                </div>
                <div id="upload-message" class="hidden mt-4"></div>
            </form>
        </div>

        <div class="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
            <div class="px-6 py-4 bg-gray-100 border-b border-gray-300">
                <h2 class="text-xl font-semibold text-black">Upload History</h2>
            </div>

            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-300">
                    <thead class="bg-gray-100">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">ID</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">Document</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">Progress Bar</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">Lines</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">Status</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">Date</th>
                        </tr>
                    </thead>
                    <tbody id="uploads-table" class="bg-white divide-y divide-gray-200">
                        <tr>
                            <td colspan="6" class="px-6 py-4 text-center text-gray-600">
                                Loading uploads...
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</body>
</html>
