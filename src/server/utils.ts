import path from "path";
import { getConfig } from "./config";

export function contentDir(...dirs: string[]) {
    return path.resolve(getConfig().contenDir, path.join(...dirs));
}
