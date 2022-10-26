import { shuffle as s } from "@thi.ng/arrays";
import { random } from "./random.js";

export const shuffle = <T>(array: T[]): T[] => s(array, undefined, random);
