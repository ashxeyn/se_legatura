<?php

namespace App\Models\contractor;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class progressUploadClass
{
    public function createProgress($data)
    {
        try {
            $progressId = DB::table('progress')->insertGetId([
                'milestone_item_id' => $data['item_id'],
                'purpose' => $data['purpose'],
                'progress_status' => $data['progress_status'] ?? 'submitted'
            ]);

            if (!$progressId) {
                throw new \Exception('Failed to create progress entry in database');
            }

            return $progressId;
        } catch (\Exception $e) {
            Log::error('createProgress error: ' . $e->getMessage(), [
                'data' => $data,
                'trace' => $e->getTraceAsString()
            ]);
            throw $e;
        }
    }

    public function createProgressFile($data)
    {
        try {
        $fileId = DB::table('progress_files')->insertGetId([
                'progress_id' => $data['progress_id'],
            'file_path' => $data['file_path'],
                'original_name' => $data['original_name'] ?? null
        ]);

            if (!$fileId) {
                throw new \Exception('Failed to create progress file entry in database');
            }

        return $fileId;
        } catch (\Exception $e) {
            Log::error('createProgressFile error: ' . $e->getMessage(), [
                'data' => $data,
                'trace' => $e->getTraceAsString()
            ]);
            throw $e;
        }
    }

    public function getProgressByItem($itemId, $contractorId = null)
    {
        $query = DB::table('progress as p')
            ->join('milestone_items as mi', 'p.milestone_item_id', '=', 'mi.item_id')
            ->join('milestones as m', 'mi.milestone_id', '=', 'm.milestone_id')
            ->join('projects as proj', 'm.project_id', '=', 'proj.project_id')
            ->where('p.milestone_item_id', $itemId)
            ->where('p.progress_status', '!=', 'deleted');

        if ($contractorId) {
            $query->where('proj.selected_contractor_id', $contractorId);
        }

        return $query
            ->select(
                'p.progress_id',
                'p.milestone_item_id as item_id',
                'p.purpose',
                'p.progress_status',
                'p.submitted_at',
                'proj.selected_contractor_id as contractor_id'
            )
            ->orderBy('p.submitted_at', 'desc')
            ->get();
    }

    public function getProgressFilesByItem($itemId, $contractorId = null)
    {
        $progressList = $this->getProgressByItem($itemId, $contractorId);
        
        $result = [];
        foreach ($progressList as $progress) {
            $files = $this->getProgressFiles($progress->progress_id);
            $progress->files = $files;
            $result[] = $progress;
        }

        return $result;
    }

    public function getProgressFiles($progressId)
    {
        return DB::table('progress_files')
            ->where('progress_id', $progressId)
            ->select(
                'file_id',
                'progress_id',
                'file_path',
                'original_name'
            )
            ->get();
    }

    public function getProgressById($progressId)
    {
        return DB::table('progress')
            ->where('progress_id', $progressId)
            ->select(
                'progress_id',
                'milestone_item_id as item_id',
                'purpose',
                'progress_status',
                'submitted_at'
            )
            ->first();
    }

    public function getProgressWithFiles($progressId)
    {
        try {
            $progress = $this->getProgressById($progressId);
            if ($progress) {
                $files = $this->getProgressFiles($progressId);
                $progress->files = $files;
            }
            return $progress;
        } catch (\Exception $e) {
            Log::error('getProgressWithFiles error: ' . $e->getMessage(), [
                'progress_id' => $progressId,
                'trace' => $e->getTraceAsString()
            ]);
            throw $e;
        }
    }

    public function getProgressFileById($fileId)
    {
        return DB::table('progress_files')
            ->where('file_id', $fileId)
            ->select(
                'file_id',
                'progress_id',
                'file_path',
                'original_name'
            )
            ->first();
    }

    public function updateProgressStatus($progressId, $status)
    {
        return DB::table('progress')
            ->where('progress_id', $progressId)
            ->update([
                'progress_status' => $status
            ]);
    }

    public function updateProgress($progressId, $data)
    {
        $updateData = [];

        if (isset($data['purpose'])) {
            $updateData['purpose'] = $data['purpose'];
        }

        if (isset($data['progress_status'])) {
            $updateData['progress_status'] = $data['progress_status'];
        }

        if (!empty($updateData)) {
            return DB::table('progress')
                ->where('progress_id', $progressId)
            ->update($updateData);
        }

        return false;
    }

    public function deleteProgressFile($fileId)
    {
        return DB::table('progress_files')
            ->where('file_id', $fileId)
            ->delete();
    }

    public function getProgressFileWithDetails($fileId)
    {
        return DB::table('progress_files as pf')
            ->join('progress as p', 'pf.progress_id', '=', 'p.progress_id')
            ->join('milestone_items as mi', 'p.milestone_item_id', '=', 'mi.item_id')
            ->join('milestones as m', 'mi.milestone_id', '=', 'm.milestone_id')
            ->join('projects as proj', 'm.project_id', '=', 'proj.project_id')
            ->where('pf.file_id', $fileId)
            ->where('p.progress_status', '!=', 'deleted')
            ->select(
                'pf.file_id',
                'pf.progress_id',
                'pf.file_path',
                'pf.original_name',
                'p.milestone_item_id as item_id',
                'p.purpose',
                'p.progress_status',
                'p.submitted_at',
                'mi.milestone_item_title as item_title',
                'proj.project_id',
                'proj.project_title',
                'proj.selected_contractor_id as contractor_id'
            )
            ->first();
    }
}
