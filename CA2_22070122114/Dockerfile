# Use a lightweight Nginx image to serve the static files
FROM nginx:1.23-alpine

# Copy all your project files (index.html, script.js, css folder)
# into the default Nginx web root directory.
COPY . /usr/share/nginx/html

# Expose port 80 for the Nginx web server
EXPOSE 80

# The default Nginx command will start the server automatically
CMD ["nginx", "-g", "daemon off;"]