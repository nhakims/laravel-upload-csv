<?php

namespace App\Http\Controllers;

use App\Jobs\ProcessUpload;
use App\Models\Upload;
use App\Models\Status;
use App\Events\UploadCreated;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class UploadController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'document' => 'required|file|mimes:csv,txt|max:51200', // 50MB max
        ]);

        // Store file temporarily with unique filename
        $file = $request->file('document');
        $filename = time() . '_' . uniqid() . '_' . $file->getClientOriginalName();
        $path = $file->storeAs('temp', $filename);

        if (!$path) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to store the uploaded file',
            ], 500);
        }

        // Count lines in CSV (local disk uses 'private' subfolder)
        $fullPath = storage_path('app/private/' . $path);

        if (!file_exists($fullPath)) {
            return response()->json([
                'success' => false,
                'message' => 'File was uploaded but could not be found at: ' . $fullPath,
            ], 500);
        }

        $lineCount = $this->countCsvLines($fullPath);

        // Get pending status
        $pendingStatus = Status::where('name', 'pending')->first();

        // Create upload record with hardcoded username
        $upload = Upload::create([
            'username' => 'public',
            'document_name' => $file->getClientOriginalName(),
            'total_lines' => $lineCount,
            'current_line' => 0,
            'status_id' => $pendingStatus->id,
        ]);

        // Broadcast upload created event
        event(new UploadCreated($upload->load('status')));

        // Dispatch job to process the upload
        ProcessUpload::dispatch($upload, $path);

        return response()->json([
            'success' => true,
            'message' => 'File uploaded successfully and queued for processing',
            'upload' => $upload->load('status'),
        ]);
    }

    private function countCsvLines($filepath)
    {
        $lines = 0;
        $handle = fopen($filepath, 'r');

        if ($handle) {
            while (!feof($handle)) {
                $line = fgets($handle);
                if ($line !== false) {
                    $lines++;
                }
            }
            fclose($handle);
        }

        // Subtract 1 for header row if exists
        return max(0, $lines - 1);
    }
}
