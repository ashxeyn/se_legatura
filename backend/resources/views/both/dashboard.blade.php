<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>Dashboard - Legatura</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background-color: #f0f2f5;
            padding: 20px;
        }

        .container {
            max-width: 800px;
            margin: 0 auto;
        }

        .header {
            background: white;
            padding: 15px 20px;
            border-radius: 8px;
            margin-bottom: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .header h1 {
            font-size: 24px;
            color: #1c1e21;
        }

        .nav-links {
            display: flex;
            gap: 15px;
        }

        .nav-links a {
            color: #1877f2;
            text-decoration: none;
            font-weight: 500;
        }

        .nav-links a:hover {
            text-decoration: underline;
        }

        .nav-btn {
            background: none;
            border: none;
            color: #1877f2;
            text-decoration: none;
            font-weight: 500;
            font-size: inherit;
            font-family: inherit;
            cursor: pointer;
            padding: 0;
        }

        .nav-btn:hover {
            text-decoration: underline;
        }

        .nav-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }

        .create-post-box {
            background: white;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            border: 1px solid #e4e6eb;
        }

        .create-post-btn {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 10px;
            background-color: #f0f2f5;
            border: 1px solid #e4e6eb;
            border-radius: 20px;
            cursor: pointer;
            width: 100%;
            font-size: 15px;
            color: #65676b;
        }

        .create-post-btn:hover {
            background-color: #e4e6eb;
        }

        .create-post-btn .icon {
            font-size: 24px;
        }

        .feed {
            display: flex;
            flex-direction: column;
            gap: 20px;
        }

        .feed-item {
            background: white;
            border-radius: 8px;
            padding: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            border: 1px solid #e4e6eb;
            position: relative;
        }

        .feed-item-profile-pic {
            position: absolute;
            top: 15px;
            left: 15px;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            object-fit: cover;
            border: 2px solid #e4e6eb;
            background-color: #f0f2f5;
        }

        .feed-item-header {
            display: flex;
            justify-content: space-between;
            align-items: start;
            margin-bottom: 15px;
            padding-bottom: 15px;
            border-bottom: 1px solid #e4e6eb;
            padding-left: 55px;
        }

        .feed-item-title {
            font-size: 20px;
            font-weight: 600;
            color: #1c1e21;
            margin-bottom: 5px;
        }

        .feed-item-meta {
            font-size: 14px;
            color: #65676b;
        }

        .feed-item-status {
            padding: 5px 12px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
        }

        .status-under_review {
            background-color: #fff3cd;
            color: #856404;
        }

        .status-approved {
            background-color: #d4edda;
            color: #155724;
        }

        .status-open {
            background-color: #d1ecf1;
            color: #0c5460;
        }

        .feed-item-content {
            margin-bottom: 15px;
        }

        .feed-item-content p {
            color: #1c1e21;
            line-height: 1.6;
            margin-bottom: 10px;
        }

        .feed-item-details {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
            margin-bottom: 15px;
            padding: 15px;
            background-color: #f8f9fa;
            border-radius: 6px;
        }

        .feed-item-detail {
            font-size: 14px;
        }

        .feed-item-detail strong {
            color: #65676b;
            display: block;
            margin-bottom: 3px;
        }

        .feed-item-actions {
            display: flex;
            gap: 10px;
            padding-top: 15px;
            border-top: 1px solid #e4e6eb;
        }

        .btn {
            padding: 8px 16px;
            border: none;
            border-radius: 6px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            text-decoration: none;
            display: inline-block;
        }

        .btn-primary {
            background-color: #1877f2;
            color: white;
        }

        .btn-primary:hover {
            background-color: #166fe5;
        }

        .btn-danger {
            background-color: #dc3545;
            color: white;
        }

        .btn-danger:hover {
            background-color: #c82333;
        }

        .btn-secondary {
            background-color: #6c757d;
            color: white;
        }

        .btn-secondary:hover {
            background-color: #5a6268;
        }

        .empty-state {
            background: white;
            border-radius: 8px;
            padding: 40px;
            text-align: center;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .empty-state h3 {
            color: #65676b;
            margin-bottom: 10px;
        }

        .empty-state p {
            color: #8a8d91;
        }
    </style>
</head>
<body>
    <div class="container">
        @php
            $dashboardUser = session('user');
            $currentRole = session('current_role', $dashboardUser ? $dashboardUser->user_type : 'guest');
            $userType = $dashboardUser ? $dashboardUser->user_type : 'guest';
            $isOwner = ($userType === 'property_owner' || $userType === 'both') && 
                       ($currentRole === 'owner' || $currentRole === 'property_owner');
        @endphp

        <div class="header">
            <h1>Dashboard</h1>
            <div class="nav-links">
                <a href="/both/projects">My Projects</a>
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

        @if($isOwner)
            <div class="create-post-box">
                <button class="create-post-btn" onclick="window.location.href='/owner/projects/create'">
                    <span class="icon">✏️</span>
                    <span>Create Project Post</span>
                </button>
            </div>
        @else
            @if(isset($contractorProjectsForMilestone) && count($contractorProjectsForMilestone) > 0)
                <div class="create-post-box">
                    <button class="create-post-btn" onclick="window.location.href='/contractor/milestone/setup'">
                        <span class="icon">📋</span>
                        <span>Setup Milestone</span>
                    </button>
                </div>
            @endif
        @endif

        <div class="feed">
            @if(isset($feedItems) && count($feedItems) > 0)
                @if(isset($feedType) && $feedType === 'contractors')
                    {{-- Owner View: Show Contractor Profiles --}}
                    @foreach($feedItems as $contractor)
                        <div class="feed-item">
                            @php
                                $profilePic = $contractor->profile_pic ?? null;
                                $initials = strtoupper(substr($contractor->company_name, 0, 2));
                                $colorIndex = ($contractor->user_id ?? $contractor->contractor_id) % 8;
                                $colors = ['#1877f2', '#42b883', '#e74c3c', '#f39c12', '#9b59b6', '#1abc9c', '#e67e22', '#3498db'];
                                $bgColor = $colors[$colorIndex];
                            @endphp
                            @if($profilePic)
                                <img src="{{ asset('storage/' . $profilePic) }}" alt="{{ $contractor->company_name }}" class="feed-item-profile-pic" onerror="this.onerror=null; this.style.display='none'; this.nextElementSibling.style.display='flex';">
                                <div class="feed-item-profile-pic" style="display: none; background-color: {{ $bgColor }}; color: white; align-items: center; justify-content: center; font-weight: 600; font-size: 16px;">{{ $initials }}</div>
                            @else
                                <div class="feed-item-profile-pic" style="background-color: {{ $bgColor }}; color: white; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 16px;">{{ $initials }}</div>
                            @endif
                            <div class="feed-item-header">
                                <div>
                                    <div class="feed-item-title">{{ $contractor->company_name }}</div>
                                    <div class="feed-item-meta">
                                        {{ $contractor->type_name }} | {{ $contractor->years_of_experience }} years experience
                                        | Joined {{ date('M d, Y', strtotime($contractor->created_at)) }}
                                    </div>
                                </div>
                            </div>

                            <div class="feed-item-content">
                                @if($contractor->company_description)
                                    <p>{{ $contractor->company_description }}</p>
                                @endif
                                @if($contractor->services_offered)
                                    <p><strong>Services:</strong> {{ $contractor->services_offered }}</p>
                                @endif
                            </div>

                            <div class="feed-item-details">
                                <div class="feed-item-detail">
                                    <strong>Address:</strong>
                                    {{ $contractor->business_address }}
                                </div>
                                @if($contractor->company_website)
                                    <div class="feed-item-detail">
                                        <strong>Website:</strong>
                                        <a href="{{ $contractor->company_website }}" target="_blank">{{ $contractor->company_website }}</a>
                                    </div>
                                @endif
                                @if($contractor->company_social_media)
                                    <div class="feed-item-detail">
                                        <strong>Social Media:</strong>
                                        <a href="{{ $contractor->company_social_media }}" target="_blank">{{ $contractor->company_social_media }}</a>
                                    </div>
                                @endif
                                @if($contractor->business_permit_number)
                                    <div class="feed-item-detail">
                                        <strong>Business Permit Number:</strong>
                                        {{ $contractor->business_permit_number }}
                                    </div>
                                @endif
                                <div class="feed-item-detail">
                                    <strong>PIACAB Number:</strong>
                                    {{ $contractor->picab_number }} ({{ $contractor->picab_category }})
                                </div>
                                <div class="feed-item-detail">
                                    <strong>Completed Projects:</strong>
                                    {{ $contractor->completed_projects }}
                                </div>
                            </div>

                            <div class="feed-item-actions">
                                <button class="btn btn-primary" onclick="viewContractorProfile({{ $contractor->contractor_id }})">View Profile</button>
                            </div>
                        </div>
                    @endforeach
                @else
                    {{-- Contractor View: Show Approved Projects --}}
                    @foreach($feedItems as $item)
                        <div class="feed-item">
                            @php
                                $profilePic = $item->owner_profile_pic ?? null;
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
                            @if($profilePic)
                                <img src="{{ asset('storage/' . $profilePic) }}" alt="{{ $ownerName }}" class="feed-item-profile-pic" onerror="this.onerror=null; this.style.display='none'; this.nextElementSibling.style.display='flex';">
                                <div class="feed-item-profile-pic" style="display: none; background-color: {{ $bgColor }}; color: white; align-items: center; justify-content: center; font-weight: 600; font-size: 16px;">{{ $initials }}</div>
                            @else
                                <div class="feed-item-profile-pic" style="background-color: {{ $bgColor }}; color: white; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 16px;">{{ $initials }}</div>
                            @endif
                            <div class="feed-item-header">
                                <div>
                                    <div class="feed-item-title">{{ $item->project_title }}</div>
                                    <div class="feed-item-meta">
                                        @if(isset($item->owner_name))
                                            Posted by {{ $item->owner_name }}
                                        @endif
                                        | {{ date('M d, Y', strtotime($item->created_at)) }}
                                    </div>
                                </div>
                            </div>

                            <div class="feed-item-content">
                                <p>{{ $item->project_description }}</p>
                            </div>

                            <div class="feed-item-details">
                                <div class="feed-item-detail">
                                    <strong>Location:</strong>
                                    {{ $item->project_location }}
                                </div>
                                <div class="feed-item-detail">
                                    <strong>Property Type:</strong>
                                    {{ $item->property_type }}
                                </div>
                                <div class="feed-item-detail">
                                    <strong>Contractor Type:</strong>
                                    {{ $item->type_name }}
                                </div>
                                <div class="feed-item-detail">
                                    <strong>Budget Range:</strong>
                                    ₱{{ number_format($item->budget_range_min, 2) }} - ₱{{ number_format($item->budget_range_max, 2) }}
                                </div>
                                <div class="feed-item-detail">
                                    <strong>Lot Size:</strong>
                                    {{ $item->lot_size }} sqm
                                </div>
                                <div class="feed-item-detail">
                                    <strong>Floor Area:</strong>
                                    {{ $item->floor_area }} sqm
                                </div>
                                @if(isset($item->bidding_deadline))
                                    <div class="feed-item-detail">
                                        <strong>Bidding Deadline:</strong>
                                        {{ date('M d, Y', strtotime($item->bidding_deadline)) }}
                                    </div>
                                @endif
                            </div>

                            <div class="feed-item-actions">
                                <a href="/contractor/projects/{{ $item->project_id }}" class="btn btn-primary">View Project</a>
                            </div>
                        </div>
                    @endforeach
                @endif
            @else
                <div class="empty-state">
                    <h3>No Items Found</h3>
                    @if($isOwner)
                        <p>No active contractors available at the moment.</p>
                    @else
                        <p>No approved projects available at the moment.</p>
                    @endif
                </div>
            @endif
        </div>
    </div>

    <script src="{{ asset('js/account.js') }}"></script>
    @if(session('active_role') === 'owner')
        <script src="{{ asset('js/owner.js') }}"></script>
    @endif
</body>
</html>
