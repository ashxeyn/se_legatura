<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Dashboard - Legatura</title>
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <link rel="stylesheet" href="{{ asset('css/common.css') }}">
</head>
<body>
    <div class="container">
        <div class="header">
    <h1>Admin Dashboard</h1>
            <div class="nav-links">
        <a href="/accounts/logout">Logout</a>
            </div>
        </div>

        <div class="card">
            <p style="font-size: 16px; color: #65676b;">Welcome, <strong>{{ session('user')->username ?? 'Admin' }}</strong>!</p>
        </div>
    </div>
</body>
</html>
