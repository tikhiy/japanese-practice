import type { ISeed160 } from "./types.js";

export class Seed160 {
  static from = (v: string | ISeed160 | Uint32Array): ISeed160 => {
    const padding = new Array(5).fill(0);

    const content =
      typeof v === "string"
        ? (v.match(/([\dabcdef]{8})/g) || []).map(
            (match) => Number.parseInt(match, 16) || 0
          )
        : v;

    return padding.concat(...content).slice(-5) as ISeed160;
  };

  static toString = (v: ISeed160 | Uint32Array): string =>
    `0x${[...v]
      .map((number) => number.toString(16).padStart(8, "0"))
      .join("")}`;
}
