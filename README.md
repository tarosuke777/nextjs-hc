# 起動

## モック起動

npm run dev

## ローカルの開発環境

npm run dev:ide

## ローカルの Docker

npm run dev:prod

## AWS

npm run dev:aws

## Not Node.js

npx serve@latest out -c ../serve.json
https://github.com/vercel/serve
https://github.com/vercel/serve-handler#options

## コマンド補足

package.json を参照

# Docker

## ローカル用

docker compose up -d --build hc-nginx
docker compose down hc-nginx

## AWS 用

docker compose up -d --build nginx-aws
docker compose down nginx-aws
