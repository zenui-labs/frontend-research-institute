export type Protocol = "h1" | "h2" | "h3";

export type Phase = {
  id: string;
  label: string;
  ms: number;
  detail: string;
  tone: "steel" | "amber" | "crt" | "rust";
};

export type JourneyInput = {
  rttMs: number;
  protocol: Protocol;
  warmConnection: boolean;
  dnsCached: boolean;
  serverThinkMs: number;
  htmlKb: number;
  cssKb: number;
  jsKb: number;
  mbps: number;
};

const transferMs = (kb: number, mbps: number) => ((kb * 8) / (mbps * 1000)) * 1000;

/**
 * An educational model of a cold page load. It captures the parts that dominate
 * in practice, round trips, server time, transfer, script execution, and
 * ignores congestion control, jitter and loss recovery.
 */
export function modelJourney(input: JourneyInput): Phase[] {
  const { rttMs, protocol, warmConnection, dnsCached, serverThinkMs, htmlKb, cssKb, jsKb, mbps } =
    input;
  const phases: Phase[] = [];

  phases.push({
    id: "dns",
    label: "DNS",
    ms: dnsCached ? 0 : Math.round(rttMs * 0.6),
    detail: dnsCached
      ? "Resolved from the OS or browser cache"
      : "Recursive lookup via the resolver",
    tone: "steel",
  });

  if (warmConnection) {
    phases.push({
      id: "conn",
      label: "Connection",
      ms: 0,
      detail: "Existing connection reused, the handshake already happened",
      tone: "crt",
    });
  } else if (protocol === "h3") {
    phases.push({
      id: "quic",
      label: "QUIC handshake",
      ms: rttMs,
      detail: "Transport and crypto handshake combined into one round trip",
      tone: "amber",
    });
  } else {
    phases.push({
      id: "tcp",
      label: "TCP handshake",
      ms: rttMs,
      detail: "SYN → SYN-ACK → ACK",
      tone: "amber",
    });
    phases.push({
      id: "tls",
      label: "TLS 1.3 handshake",
      ms: rttMs,
      detail: "Certificate verification and key agreement; ALPN picks the HTTP version",
      tone: "amber",
    });
  }

  phases.push({
    id: "ttfb",
    label: "Request → first byte",
    ms: Math.round(rttMs + serverThinkMs),
    detail: `One round trip plus ${serverThinkMs}ms of server time`,
    tone: "rust",
  });

  phases.push({
    id: "html",
    label: "HTML transfer",
    ms: Math.round(transferMs(htmlKb, mbps)),
    detail: `${htmlKb}KB, parsing starts on the first chunk, not the last`,
    tone: "steel",
  });

  phases.push({
    id: "css",
    label: "Render-blocking CSS",
    ms: Math.round((warmConnection ? 0 : rttMs) + rttMs + transferMs(cssKb, mbps)),
    detail: "Discovered by the preload scanner, then fetched and parsed before the first paint",
    tone: "amber",
  });

  phases.push({
    id: "paint",
    label: "First paint",
    ms: 16,
    detail: "Style, layout, paint, composite for the first frame",
    tone: "crt",
  });

  phases.push({
    id: "js",
    label: "JavaScript parse + execute",
    ms: Math.round(transferMs(jsKb, mbps) + jsKb * 1.1),
    detail: `${jsKb}KB, transfer once, then parse, compile and execute on the main thread`,
    tone: "rust",
  });

  return phases;
}

export type WaterfallInput = {
  rttMs: number;
  mbps: number;
  lossPercent: number;
  protocol: Protocol;
  assets: number;
  assetKb: number;
  cdn: boolean;
};

export type WaterfallBar = { index: number; startMs: number; durationMs: number; stalled: boolean };

export function modelWaterfall(input: WaterfallInput): { bars: WaterfallBar[]; totalMs: number } {
  const rtt = input.cdn ? Math.max(12, Math.round(input.rttMs * 0.25)) : input.rttMs;
  const perAssetTransfer = ((input.assetKb * 8) / (input.mbps * 1000)) * 1000;
  const parallel = input.protocol === "h1" ? 6 : input.assets;
  const lossPenalty = input.lossPercent > 0 ? rtt * (input.lossPercent / 100) * 3 : 0;

  const bars: WaterfallBar[] = [];
  const laneFree = new Array(Math.min(parallel, input.assets)).fill(0) as number[];
  // With multiplexing, streams share the pipe rather than queueing behind each other.
  const sharedTransfer =
    input.protocol === "h1" ? perAssetTransfer : perAssetTransfer * Math.max(1, input.assets / 6);

  for (let i = 0; i < input.assets; i += 1) {
    const lane = laneFree.indexOf(Math.min(...laneFree));
    const start = laneFree[lane];
    // HTTP/2 loses every stream to one dropped TCP segment; HTTP/3 loses only its own.
    const penalty = input.protocol === "h3" ? (i % 7 === 0 ? lossPenalty : 0) : lossPenalty;
    const duration = rtt + sharedTransfer + penalty;
    bars.push({ index: i, startMs: start, durationMs: duration, stalled: penalty > 0 });
    laneFree[lane] = start + duration;
  }

  return { bars, totalMs: Math.max(...bars.map((b) => b.startMs + b.durationMs), 0) };
}
