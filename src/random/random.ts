import { XorWow } from "@thi.ng/random";
import { timestamp } from "../timestamp.js";

export const random = new XorWow([Number(timestamp().toString())]);
