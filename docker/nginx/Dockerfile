FROM nginx:alpine

# Copy nginx configuration
COPY docker/nginx/nginx.conf /etc/nginx/conf.d/default.conf

# Expose ports
EXPOSE 80 8080

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
