FROM nginx:1.27-alpine

LABEL org.opencontainers.image.title="measurement-conversions" \
      org.opencontainers.image.description="Static measurement conversion tool with Google AdSense slots" \
      org.opencontainers.image.source="https://github.com/jonny190/measurement-conversions"

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY site/ /usr/share/nginx/html/

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1/healthz >/dev/null 2>&1 || exit 1
