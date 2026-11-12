#!/usr/bin/env node
import path from "node:path";
import { fileURLToPath } from "node:url";
import { deployExhibitionBuildVariants } from "./deploy-unity-build.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const source = process.argv[2] || path.join(root, "../gemfi-gaming/Builds/AurayaleExhibition");
deployExhibitionBuildVariants(source, { publicBuild: path.join(root, "public/ExhibitionBuild") });
