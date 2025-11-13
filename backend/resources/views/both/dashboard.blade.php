<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>Dashboard - Legatura</title>
</head>
<body>
    <h1>Dashboard</h1>

    @php
        $dashboardUser = session('user');
        $currentRole = session('current_role', $dashboardUser ? $dashboardUser->user_type : 'guest');
        $userType = $dashboardUser ? $dashboardUser->user_type : 'guest';
    @endphp

    <!-- Current Role Display -->
    <div class="role-info-panel">
        <h3 class="role-info-title">Current Role Information</h3>
        <div class="role-info-item">
            <strong>Account Type:</strong>
            <span class="account-type">{{ $userType }}</span>
        </div>
        @if($userType === 'both')
            <div class="role-info-item">
                <strong>Active Role:</strong>
                <span class="active-role">{{ $currentRole }}</span>
            </div>
            <div class="role-switch-section">
                <strong>Quick Role Switch:</strong><br>
                <div class="role-switch-buttons">
                    @if($currentRole !== 'contractor')
                        <button onclick="switchRole('contractor')" class="role-switch-btn contractor-btn">
                            Switch to Contractor
                        </button>
                    @endif
                    @if($currentRole !== 'owner')
                        <button onclick="switchRole('owner')" class="role-switch-btn owner-btn">
                            Switch to Property Owner
                        </button>
                    @endif
                </div>
            </div>
        @elseif($userType === 'contractor')
            <div class="role-info-item">
                <p>You can add Property Owner role to access both contractor and property owner features.</p>
            </div>
        @elseif($userType === 'property_owner')
            <div class="role-info-item">
                <p>You can add Contractor role to access both property owner and contractor features.</p>
            </div>
        @endif
    </div>

    <div>
        <a href="/both/projects">My Projects</a>
        <a href="/accounts/logout">Logout</a>
        @if($userType === 'both')
            <a href="/accounts/switch">Switch Role</a>
        @elseif($userType === 'contractor')
            <a href="/accounts/switch">Add Property Owner Role</a>
        @elseif($userType === 'property_owner')
            <a href="/accounts/switch">Add Contractor Role</a>
        @endif
        @php
            $isContractor = $dashboardUser && isset($dashboardUser->user_type) && ($dashboardUser->user_type === 'contractor' || $dashboardUser->user_type === 'both');
            $canAccessMilestones = $isContractor && ($currentRole === 'contractor');
        @endphp
        @if($canAccessMilestones)
            <a href="/contractor/milestone/setup">Set Up Project Milestones</a>
        @elseif($userType === 'both' && $currentRole === 'owner')
            <span class="role-hint">
                (Switch to Contractor role to access milestone setup)
            </span>
        @endif
    </div>

    <script src="{{ asset('js/account.js') }}"></script>
</body>
</html>
