<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>My Projects - Legatura</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background-color: #f5f5f5;
            padding: 0;
        }

        .header-section {
            background: #ff8c42;
            color: white;
            padding: 15px 20px;
            position: relative;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .header-section h1 {
            font-size: 20px;
            font-weight: 600;
        }

        .nav-links {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
            justify-content: flex-end;
        }

        .nav-links a, .nav-btn {
            color: #1877f2;
            text-decoration: none;
            font-weight: 500;
            background: white;
            padding: 6px 12px;
            border-radius: 4px;
            font-size: 13px;
        }

        .nav-btn {
            border: none;
            cursor: pointer;
            font-family: inherit;
        }

        .nav-btn:hover, .nav-links a:hover {
            opacity: 0.8;
        }

        .search-filter-bar {
            display: flex;
            gap: 10px;
            padding: 15px 20px;
            background: white;
            border-bottom: 1px solid #e0e0e0;
        }

        .search-box {
            flex: 1;
            position: relative;
        }

        .search-input {
            width: 100%;
            padding: 10px 40px 10px 15px;
            border: 1px solid #e0e0e0;
            border-radius: 20px;
            font-size: 14px;
            outline: none;
        }

        .search-icon {
            position: absolute;
            right: 15px;
            top: 50%;
            transform: translateY(-50%);
            color: #999;
        }

        .filter-btn {
            width: 45px;
            height: 45px;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            background: white;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
        }

        .projects-container {
            padding: 15px;
            max-width: 600px;
            margin: 0 auto;
        }

        .project-card {
            background: white;
            border-radius: 12px;
            margin-bottom: 15px;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            cursor: pointer;
            transition: transform 0.2s;
        }

        .project-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0,0,0,0.15);
        }

        .project-card-content {
            display: flex;
            padding: 15px;
            gap: 15px;
        }

        .project-thumbnail {
            width: 100px;
            height: 100px;
            border-radius: 8px;
            object-fit: cover;
            background: #e0e0e0;
            flex-shrink: 0;
        }

        .project-info {
            flex: 1;
            min-width: 0;
        }

        .project-title {
            font-size: 16px;
            font-weight: 600;
            color: #1c1e21;
            margin-bottom: 8px;
            line-height: 1.3;
        }

        .project-description {
            font-size: 13px;
            color: #65676b;
            line-height: 1.4;
            margin-bottom: 10px;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
        }

        .project-meta {
            display: flex;
            align-items: center;
            gap: 15px;
            margin-bottom: 10px;
            font-size: 12px;
            color: #65676b;
        }

        .meta-item {
            display: flex;
            align-items: center;
            gap: 5px;
        }

        .meta-icon {
            width: 14px;
            height: 14px;
        }

        .progress-section {
            margin-top: 10px;
        }

        .progress-info {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 5px;
            font-size: 12px;
        }

        .progress-percentage {
            font-weight: 600;
            color: #1c1e21;
        }

        .progress-milestones {
            color: #65676b;
        }

        .progress-bar-container {
            width: 100%;
            height: 6px;
            background: #e0e0e0;
            border-radius: 3px;
            overflow: hidden;
        }

        .progress-bar-fill {
            height: 100%;
            background: #42b883;
            border-radius: 3px;
            transition: width 0.3s;
        }

        .apply-bid-btn {
            background: #1a237e;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 6px;
            font-size: 13px;
            font-weight: 500;
            cursor: pointer;
        }

        .apply-bid-btn:hover {
            background: #283593;
        }

        .project-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 15px;
            background: #f8f9fa;
            border-top: 1px solid #e0e0e0;
        }

        .assigned-person {
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .person-avatar {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            object-fit: cover;
            background: #e0e0e0;
        }

        .person-name {
            font-size: 13px;
            font-weight: 500;
            color: #1c1e21;
        }

        .status-badge {
            padding: 6px 12px;
            border-radius: 6px;
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
        }

        .status-open {
            background: #1877f2;
            color: white;
        }

        .status-in-progress {
            background: #1877f2;
            color: white;
        }

        .status-complete {
            background: #42b883;
            color: white;
        }

        .status-bidding-closed {
            background: #6c757d;
            color: white;
        }

        .empty-state {
            background: white;
            border-radius: 12px;
            padding: 40px 20px;
            text-align: center;
            margin-top: 20px;
        }

        .empty-state h3 {
            color: #65676b;
            margin-bottom: 10px;
            font-size: 18px;
        }

        .empty-state p {
            color: #8a8d91;
            font-size: 14px;
        }

        @media (min-width: 768px) {
            .projects-container {
                max-width: 800px;
            }
        }
    </style>
</head>
<body>
    @php
        $dashboardUser = session('user');
        $currentRole = session('current_role', $dashboardUser ? $dashboardUser->user_type : 'guest');
        $userType = $dashboardUser ? $dashboardUser->user_type : 'guest';
        $isOwner = ($userType === 'property_owner' || $userType === 'both') &&
                   ($currentRole === 'owner' || $currentRole === 'property_owner');
    @endphp

    <div class="header-section">
        <h1>My Projects</h1>
        <div class="nav-links">
            <a href="/both/projects">All Projects</a>
            @if($isOwner)
                <a href="/owner/projects/create" class="nav-btn">Post Project</a>
            @endif
            @if($userType === 'both')
                @if($currentRole !== 'contractor')
                    <button onclick="switchRole('contractor', this)" class="nav-btn">Switch to Contractor</button>
                @endif
                @if($currentRole !== 'owner')
                    <button onclick="switchRole('owner', this)" class="nav-btn">Switch to Owner</button>
                @endif
            @endif
            <a href="/accounts/logout">Logout</a>
        </div>
    </div>

    <div class="search-filter-bar">
        <div class="search-box">
            <input type="text" class="search-input" placeholder="Search through your projects" id="searchInput">
            <span class="search-icon">🔍</span>
        </div>
        <button class="filter-btn" onclick="alert('Filter functionality coming soon')">☰</button>
    </div>

    <div class="projects-container">
        @if(isset($feedItems) && count($feedItems) > 0)
            @if(isset($feedType) && $feedType === 'contractors')
                {{-- Owner View: Show Contractor Profiles (keeping original style for contractors) --}}
                @foreach($feedItems as $contractor)
                    <div class="project-card" onclick="viewContractorProfile({{ $contractor->contractor_id }})">
                        <div class="project-card-content">
                            @php
                                $profilePic = $contractor->profile_pic ?? null;
                                $initials = strtoupper(substr($contractor->company_name, 0, 2));
                                $colorIndex = ($contractor->user_id ?? $contractor->contractor_id) % 8;
                                $colors = ['#1877f2', '#42b883', '#e74c3c', '#f39c12', '#9b59b6', '#1abc9c', '#e67e22', '#3498db'];
                                $bgColor = $colors[$colorIndex];
                            @endphp
                            <div class="project-thumbnail" style="background-color: {{ $bgColor }}; display: flex; align-items: center; justify-content: center; color: white; font-weight: 600; font-size: 24px;">
                                @if($profilePic)
                                    <img src="{{ asset('storage/' . $profilePic) }}" alt="{{ $contractor->company_name }}" class="project-thumbnail" onerror="this.style.display='none'; this.parentElement.textContent='{{ $initials }}';">
                                @else
                                    {{ $initials }}
                                @endif
                            </div>
                            <div class="project-info">
                                <div class="project-title">{{ $contractor->company_name }}</div>
                                <div class="project-description">{{ $contractor->company_description ?? $contractor->services_offered }}</div>
                                <div class="project-meta">
                                    <div class="meta-item">
                                        <span class="meta-icon">📍</span>
                                        <span>{{ $contractor->business_address }}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="project-footer">
                            <div class="assigned-person">
                                <div class="person-avatar" style="background-color: {{ $bgColor }}; display: flex; align-items: center; justify-content: center; color: white; font-weight: 600; font-size: 12px;">
                                    {{ $initials }}
                                </div>
                                <span class="person-name">{{ $contractor->type_name }}</span>
                            </div>
                            <span class="status-badge status-in-progress">View Profile</span>
                        </div>
                    </div>
                @endforeach
            @else
                {{-- Contractor/Owner View: Show Projects --}}
                @foreach($feedItems as $item)
                    <div class="project-card" onclick="@if($isOwner) window.location.href='/both/projects/{{ $item->project_id }}' @endif">
                        <div class="project-card-content">
                            <div class="project-thumbnail" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; color: white; font-size: 32px;">
                                🏗️
                            </div>
                            <div class="project-info">
                                <div class="project-title">{{ $item->project_title }}</div>
                                <div class="project-description">{{ $item->project_description }}</div>
                                <div class="project-meta">
                                    <div class="meta-item">
                                        <span class="meta-icon">📍</span>
                                        <span>{{ $item->project_location }}</span>
                                    </div>
                                    <div class="meta-item">
                                        <span class="meta-icon">📅</span>
                                        <span>
                                            @if(isset($item->bidding_deadline))
                                                {{ date('F Y', strtotime($item->bidding_deadline)) }}
                                            @else
                                                {{ date('F Y', strtotime($item->created_at . ' +6 months')) }}
                                            @endif
                                        </span>
                                    </div>
                                </div>
                                @if($isOwner && isset($item->selected_contractor_id))
                                    {{-- Owner: Show project progress if contractor selected --}}
                                    @php
                                        // Calculate progress if milestones exist
                                        $progressPercent = 0;
                                        $milestoneText = 'No milestones yet';
                                        // This would need to be passed from controller
                                    @endphp
                                    <div class="progress-section">
                                        <div class="progress-info">
                                            <span class="progress-percentage">{{ $progressPercent }}% Complete</span>
                                            <span class="progress-milestones">{{ $milestoneText }}</span>
                                        </div>
                                        <div class="progress-bar-container">
                                            <div class="progress-bar-fill" style="width: {{ $progressPercent }}%;"></div>
                                        </div>
                                    </div>
                                @endif
                            </div>
                        </div>
                        <div class="project-footer">
                            @if($isOwner && isset($item->selected_contractor_id))
                                @php
                                    // Get contractor info for owner view
                                    $contractorName = 'Contractor Assigned';
                                @endphp
                                <div class="assigned-person">
                                    <div class="person-avatar" style="background: #1877f2; display: flex; align-items: center; justify-content: center; color: white; font-weight: 600; font-size: 12px;">C</div>
                                    <span class="person-name">{{ $contractorName }}</span>
                                </div>
                                <span class="status-badge status-in-progress">IN PROGRESS</span>
                            @else
                                <div class="assigned-person">
                                    @php
                                        $ownerName = $item->owner_name ?? 'Owner';
                                        $initials = '';
                                        if ($ownerName) {
                                            $nameParts = explode(' ', $ownerName);
                                            if (count($nameParts) >= 2) {
                                                $initials = strtoupper(substr($nameParts[0], 0, 1) . substr($nameParts[count($nameParts) - 1], 0, 1));
                                            } else {
                                                $initials = strtoupper(substr($ownerName, 0, 2));
                                            }
                                        } else {
                                            $initials = 'OP';
                                        }
                                        $colorIndex = ($item->owner_user_id ?? $item->project_id) % 8;
                                        $colors = ['#1877f2', '#42b883', '#e74c3c', '#f39c12', '#9b59b6', '#1abc9c', '#e67e22', '#3498db'];
                                        $bgColor = $colors[$colorIndex];
                                    @endphp
                                    <div class="person-avatar" style="background-color: {{ $bgColor }}; display: flex; align-items: center; justify-content: center; color: white; font-weight: 600; font-size: 12px;">
                                        @if(isset($item->owner_profile_pic))
                                            <img src="{{ asset('storage/' . $item->owner_profile_pic) }}" alt="{{ $ownerName }}" class="person-avatar" onerror="this.style.display='none'; this.parentElement.textContent='{{ $initials }}';">
                                        @else
                                            {{ $initials }}
                                        @endif
                                    </div>
                                    <span class="person-name">{{ $ownerName }}</span>
                                </div>
                                @if(!$isOwner && $item->project_status === 'open')
                                    <button class="apply-bid-btn" onclick="event.stopPropagation(); window.location.href='/contractor/projects/{{ $item->project_id }}'">
                                        Apply for Bid
                                    </button>
                                @endif
                            @endif
                        </div>
                    </div>
                @endforeach
            @endif
        @else
            <div class="empty-state">
                <h3>No Projects Found</h3>
                @if($isOwner)
                    <p>No active contractors available at the moment.</p>
                @else
                    <p>No approved projects available at the moment.</p>
                @endif
            </div>
        @endif
    </div>

    <script src="{{ asset('js/account.js') }}"></script>
    <script src="{{ asset('js/both.js') }}"></script>
    @if($isOwner)
        <script src="{{ asset('js/owner.js') }}"></script>
    @endif
</body>
</html>
