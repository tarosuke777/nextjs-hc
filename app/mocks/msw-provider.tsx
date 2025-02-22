"use client";

import { Suspense, use } from "react";
import { handlers } from "./handlers";

const mockingEnabledPromise =
  typeof window !== "undefined"
    ? import("./browser").then(async ({ worker }) => {
        await worker.start();
        worker.use(...handlers);
      })
    : Promise.resolve();

export function MSWProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Suspense fallback={null}>
      <MSWProviderWrapper>{children}</MSWProviderWrapper>
    </Suspense>
  );
}

function MSWProviderWrapper({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  use(mockingEnabledPromise);
  return children;
}
