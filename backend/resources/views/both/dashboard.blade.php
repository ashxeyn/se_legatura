<h1>This is the dashboassrdings</h1>
    <div>
        <a href="/both/projects">My Projects</a>
        <a href="/accounts/logout">Logout</a>
        <a href="/accounts/switch">Switch Role</a>
        @php
            $dashboardUser = session('user');
            $isContractor = $dashboardUser && isset($dashboardUser->user_type) && ($dashboardUser->user_type === 'contractor' || $dashboardUser->user_type === 'both');
        @endphp
        @if($isContractor)
            <a href="/contractor/milestone/setup">Set Up Project Milestones</a>
        @endif
    </div>
