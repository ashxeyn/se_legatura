<!doctype html>
<html lang="en">
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<title>Login - Legatura</title>
</head>
<body>
	<h1>Login to Legatura</h1>

	@if(session('success'))
		<div class="success-message">{{ session('success') }}</div>
	@endif

	@if($errors->any())
		<div class="error-message">
			@foreach($errors->all() as $error)
				<p>{{ $error }}</p>
			@endforeach
		</div>
	@endif

	<form method="POST" action="/accounts/login" id="loginForm" target="_self">
		@csrf
		<div>
			<label for="username">Username or Email *</label>
			<input
				id="username"
				type="text"
				name="username"
				value="{{ old('username') }}"
				required
				autofocus>
		</div>

		<div>
			<label for="password">Password *</label>
			<input
				id="password"
				type="password"
				name="password"
				required>
		</div>

		<div>
			<button type="submit">Login</button>
		</div>
	</form>

	<p>Don't have an account? <a href="/accounts/signup">Sign up here</a></p>

<script src="{{ asset('js/account.js') }}"></script>
</body>
</html>
