FROM denoland/deno:alpine-2.0.2
EXPOSE 8000

WORKDIR /app
COPY . /app
RUN deno cache server.tsx
CMD ["deno", "task", "start"]