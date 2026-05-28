import { pipeline, env } from "@xenova/transformers";

// Configure WASM backend paths for cross-platform deployment.
// On Linux serverless (Vercel), native onnxruntime-node is blocked by
// next.config.ts via Turbopack alias - the library falls back to WASM.
env.backends.onnx.wasm.wasmPaths =
  "https://cdn.jsdelivr.net/npm/onnxruntime-web@1.18.0/dist/";

let extractor: any = null;

async function getExtractor() {
  if (!extractor) {
    extractor = await pipeline(
      "feature-extraction",
      "Xenova/all-MiniLM-L6-v2"
    );
  }
  return extractor;
}

export async function generateEmbedding(text: string): Promise<number[]> {
  const pipe = await getExtractor();
  const result = await pipe(text, { pooling: "mean", normalize: true });
  return Array.from(result.data);
}
