import type { NextConfig } from "next";
import localConfig from "./config/local.json";
import awsConfig from "./config/aws.json";
import prodConfig from "./config/prod.json";

const appEnv = process.env.APP_ENV || "mock";

let selectedConfig: Record<string, string>;

switch (appEnv) {
  case "local":
    selectedConfig = localConfig;
    break;
  case "aws":
    selectedConfig = awsConfig;
    break;
  case "prod":
    selectedConfig = prodConfig;
    break;
  default:
    selectedConfig = {};
    break;
}

const nextConfig: NextConfig = {
  env: {
    APP_ENV: appEnv,
    ...selectedConfig,
  },
  output: "export",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
