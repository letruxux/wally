"use client";

import { useEffect } from "react";

async function setup() {
  if (typeof window === "undefined") return;

  const { init } = await import("@plausible-analytics/tracker");
  const domain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
  if (!domain) return;

  const host = process.env.NEXT_PUBLIC_PLAUSIBLE_HOST;

  init({
    domain,
    endpoint: host ? `https://${host}/api/event` : undefined,
    autoCapturePageviews: true,
    outboundLinks: true,
    fileDownloads: true,
  });
}

export function Plausible() {
  useEffect(() => {
    setup();
  }, []);

  return null;
}
