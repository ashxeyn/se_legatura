# Web Server Configuration for Backend Folder Structure

## Apache Configuration (.htaccess in backend folder)

Create this file at `c:\se_legatura\backend\.htaccess`:

```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteRule ^(.*)$ public/$1 [L]
</IfModule>
```

## Nginx Configuration

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/se_legatura/backend/public;

    index index.php index.html index.htm;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.ht {
        deny all;
    }
}
```

## Development Server

To run the Laravel development server from the new structure:

```bash
# Navigate to the backend folder
cd c:\se_legatura\backend

# Run the development server
php artisan serve
```

## API Endpoints

Your API will now be available at:
- Web: `http://localhost:8000/api/v1/`
- Projects: `http://localhost:8000/api/v1/projects`
- Disputes: `http://localhost:8000/api/v1/disputes`
- Authentication: `http://localhost:8000/api/v1/auth/login`

## React Native Configuration

Update your React Native API base URL to:
```javascript
const BASE_URL = 'http://localhost:8000/api/v1'; // or your production URL
```
