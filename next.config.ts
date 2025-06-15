import type { NextConfig } from "next";
import ideConfig from "./config/ide.json";
import awsConfig from "./config/aws.json";
import prodConfig from "./config/prod.json";

const backAppEnv = process.env.BACK_APP_ENV || "mock";

let selectedConfig: Record<string, string>;

switch (backAppEnv) {
  case "ide":
    selectedConfig = ideConfig;
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
    BACK_APP_ENV: backAppEnv,
    ...selectedConfig,
  },
  output: "export",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
