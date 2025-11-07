<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Dashboard - Legatura</title>
</head>
<body>
    <h1>Admin Dashboard</h1>
    <p>Welcome, {{ session('user')->username ?? 'Admin' }}!</p>

    <div>
        <a href="/accounts/logout">Logout</a>
    </div>
</body>
</html>
