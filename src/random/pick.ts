import { random } from "./random.js";
import { pickRandom } from "@thi.ng/random";

export const pick = <T>(array: T[]): T | undefined => pickRandom(array, random);
