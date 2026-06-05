"use client";

import { useEffect } from "react";
import { init } from "@plausible-analytics/tracker";

export function Plausible() {
  useEffect(() => {
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
  }, []);

  return null;
}
