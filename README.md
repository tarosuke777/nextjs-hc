# 起動

## モック起動

npm run dev

## ローカルの開発環境

npm run dev:local

## ローカルの Docker

npm run dev:prod

## AWS

npm run dev:aws

## コマンド補足

package.json を参照

# Docker

## ローカル用

docker compose up -d --build nginx
docker compose down nginx

## AWS 用

docker compose up -d --build nginx-aws
docker compose down nginx-aws

https://zenn.dev/kiwichan101kg/articles/fd6a94b5edc91a
https://zenn.dev/kazumax4395/articles/643ffc25d3f803
https://zenn.dev/jj/articles/next-js-env-best-practice
