import hogan from "hogan.js"

export default hogan.compile(`
server {
    listen 80 default_server;
    listen 443 ssl default_server;

    server_name _;

    ssl_certificate /certs/default.crt;
    ssl_certificate_key /certs/default.crt;

    return 404;
}

{{#configs}}
# {{host}}
  upstream {{host}} {
    {{#upstream}}
      server {{.}};
    {{/upstream}}
  }

  server {
    listen 80;
    server_name {{host}};
    return 301 https://$host$request_uri;
  }

  {{#ssl}}
  server {
    listen 443 ssl;
    server_name {{host}};

    ssl_certificate /certs/{{host}}.crt;
    ssl_certificate_key /certs/{{host}}.crt;

    ssl_protocols TLSv1 TLSv1.1 TLSv1.2;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-SHA:ECDHE-RSA-RC4-SHA:AES128-GCM-SHA256:HIGH:!RC4:!MD5:!aNULL:!EDH:!CAMELLIA;
    ssl_prefer_server_ciphers on;
  
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
 
    ssl_stapling on;
    ssl_stapling_verify on;
    resolver 8.8.8.8 8.8.4.4 valid=300s;
    resolver_timeout 5s;

    add_header Strict-Transport-Security max-age=15638400;
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;

    location / {
      proxy_pass http://{{host}};
      proxy_set_header Host $host;
      proxy_set_header        Host $host;
      proxy_set_header        X-Real-IP $remote_addr;
      proxy_set_header        X-Forwarded-For $remote_addr;
      proxy_set_header        X-Forwarded-Proto $scheme;
      proxy_http_version      1.1;
      proxy_set_header        Upgrade $http_upgrade;
      proxy_set_header        Connection "upgrade";
      proxy_read_timeout      90;
      proxy_redirect          http:// https://;
    }
  }
  {{/ssl}}
{{/configs}}
`)
