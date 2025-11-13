<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>My Projects</title>
    <meta name="csrf-token" content="{{ csrf_token() }}">
</head>
<body>
    <div class="container">
        <div class="nav-links">
            <a href="/dashboard">Back</a> |
            <a href="/both/disputes">Disputes</a>
        </div>

        <h1>My Projects</h1>
        <p>Click on a project to view details, progress reports, and payment validations.</p>

        <div id="projectList">
            @if(count($projects) > 0)
                @foreach($projects as $project)
                    <div class="project-item" onclick="window.location.href='/both/projects/{{ $project->project_id }}'">
                        <div class="project-header">
                            <strong>{{ $project->project_title }}</strong>
                            <span class="project-status status-{{ $project->project_status }}">
                                {{ ucfirst(str_replace('_', ' ', $project->project_status)) }}
                            </span>
                        </div>
                        <p><strong>Description:</strong> {{ \Illuminate\Support\Str::limit($project->project_description, 150) }}</p>
                        <p><small>Created: {{ date('M d, Y', strtotime($project->created_at)) }}</small></p>
                    </div>
                @endforeach
            @else
                <div class="empty-state">
                    <h3>No Projects Found</h3>
                    <p>You don't have any projects yet.</p>
                </div>
            @endif
        </div>
    </div>
</body>
</html>
