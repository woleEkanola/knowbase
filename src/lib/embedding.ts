import { pipeline } from "@xenova/transformers";

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

/**
 * Generate a 384-dimensional normalized embedding vector for a given text.
 * Uses all-MiniLM-L6-v2 running locally via ONNX — no API keys, no network.
 * First call downloads ~80MB model; subsequent calls use cached model.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const pipe = await getExtractor();
  const result = await pipe(text, { pooling: "mean", normalize: true });
  return Array.from(result.data);
}
