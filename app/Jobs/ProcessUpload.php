<?php

namespace App\Jobs;

use App\Models\Upload;
use App\Models\CsvData;
use App\Models\Status;
use App\Events\UploadCreated;
use App\Events\UploadUpdated;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Storage;
use Exception;

class ProcessUpload implements ShouldQueue
{
    use Queueable;

    public $upload;
    public $filePath;

    /**
     * Create a new job instance.
     */
    public function __construct(Upload $upload, string $filePath)
    {
        $this->upload = $upload;
        $this->filePath = $filePath;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try {
            // Get processing status
            $processingStatus = Status::where('name', 'processing')->first();
            $this->upload->update(['status_id' => $processingStatus->id]);

            // Try to broadcast update, but don't fail if it doesn't work
            try {
                event(new UploadUpdated($this->upload->fresh()->load('status')));
            } catch (\Exception $e) {
                // Silently ignore broadcast errors
            }

            // Get the file path (local disk uses 'private' subfolder)
            $fullPath = storage_path('app/private/' . $this->filePath);

            if (!file_exists($fullPath)) {
                throw new Exception('File not found: ' . $fullPath);
            }

            // Process CSV file
            $handle = fopen($fullPath, 'r');
            $currentLine = 0;

            if ($handle) {
                // Skip header row
                fgets($handle);

                while (($line = fgets($handle)) !== false) {
                    $currentLine++;

                    // Parse CSV line
                    $data = str_getcsv($line);

                    // Skip empty lines
                    if (empty($data) || (count($data) === 1 && empty($data[0]))) {
                        continue;
                    }

                    // Filter non-UTF-8 characters from all values
                    $data = array_map(function($value) {
                        return $this->filterUtf8($value);
                    }, $data);

                    // Map CSV columns to database fields
                    // Assuming CSV format: UNIQUE_KEY, PRODUCT_TITLE, PRODUCT_DESCRIPTION, STYLE, SANMAR_MAINFRAME_COLOR, SIZE, COLOR_NAME, PIECE_PRICE
                    $csvData = [
                        'upload_id' => $this->upload->id,
                        'unique_key' => $data[0] ?? '',
                        'product_title' => $data[1] ?? null,
                        'product_description' => $data[2] ?? null,
                        'style' => $data[3] ?? null,
                        'sanmar_mainframe_color' => $data[4] ?? null,
                        'size' => $data[5] ?? null,
                        'color_name' => $data[6] ?? null,
                        'piece_price' => !empty($data[7]) ? $data[7] : null,
                    ];

                    // Check if record with this unique_key exists
                    CsvData::updateOrCreate(
                        ['unique_key' => $csvData['unique_key']],
                        $csvData
                    );

                    // Update progress every 100 lines
                    if ($currentLine % 100 === 0) {
                        $this->upload->update(['current_line' => $currentLine]);
                        try {
                            event(new UploadUpdated($this->upload->fresh()->load('status')));
                        } catch (\Exception $e) {
                            // Silently ignore broadcast errors
                        }
                    }
                }

                fclose($handle);

                // Final update
                $this->upload->update(['current_line' => $currentLine]);
            }

            // Mark as completed
            $completedStatus = Status::where('name', 'completed')->first();
            $this->upload->update([
                'status_id' => $completedStatus->id,
                'current_line' => $this->upload->total_lines,
            ]);

            try {
                event(new UploadUpdated($this->upload->fresh()->load('status')));
            } catch (\Exception $e) {
                // Silently ignore broadcast errors
            }

            // Delete temporary file
            Storage::delete($this->filePath);

        } catch (Exception $e) {
            // Mark as failed
            $failedStatus = Status::where('name', 'failed')->first();
            $this->upload->update(['status_id' => $failedStatus->id]);

            try {
                event(new UploadUpdated($this->upload->fresh()->load('status')));
            } catch (\Exception $e) {
                // Silently ignore broadcast errors
            }

            // Optionally delete temporary file
            Storage::delete($this->filePath);

            throw $e;
        }
    }

    /**
     * Filter non-UTF-8 characters from a string
     */
    private function filterUtf8($value)
    {
        if ($value === null) {
            return null;
        }

        // Remove non-UTF-8 characters
        $value = mb_convert_encoding($value, 'UTF-8', 'UTF-8');

        // Remove any remaining invalid UTF-8 sequences
        $value = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x80-\x9F]/u', '', $value);

        return trim($value);
    }
}
