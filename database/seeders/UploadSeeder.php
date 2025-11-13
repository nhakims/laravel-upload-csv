<?php

namespace Database\Seeders;

use App\Models\Upload;
use App\Models\Status;
use Illuminate\Database\Seeder;

class UploadSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $statuses = Status::all()->pluck('id', 'name');

        $sampleData = [
            [
                'username' => 'john_doe',
                'document_name' => 'financial_report_2024.csv',
                'total_lines' => 1000,
                'current_line' => 1000,
                'status_id' => $statuses['completed'],
            ],
            [
                'username' => 'jane_smith',
                'document_name' => 'customer_data.xlsx',
                'total_lines' => 5000,
                'current_line' => 3500,
                'status_id' => $statuses['processing'],
            ],
            [
                'username' => 'bob_wilson',
                'document_name' => 'inventory_list.csv',
                'total_lines' => 2500,
                'current_line' => 0,
                'status_id' => $statuses['pending'],
            ],
            [
                'username' => 'alice_brown',
                'document_name' => 'employee_records.csv',
                'total_lines' => 800,
                'current_line' => 450,
                'status_id' => $statuses['processing'],
            ],
            [
                'username' => 'charlie_davis',
                'document_name' => 'sales_transactions.csv',
                'total_lines' => 15000,
                'current_line' => 5000,
                'status_id' => $statuses['failed'],
            ],
        ];

        foreach ($sampleData as $data) {
            Upload::create($data);
        }
    }
}
