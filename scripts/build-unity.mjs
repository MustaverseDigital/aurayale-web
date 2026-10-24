#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { deployUnityBuild } from "./deploy-unity-build.mjs";

const webRoot = fileURLToPath(new URL("../", import.meta.url));
const project = path.resolve(process.argv[2] || path.join(webRoot, "../gemfi-gaming"));
const versionFile = path.join(project, "ProjectSettings/ProjectVersion.txt");
if (!fs.existsSync(versionFile)) throw new Error(`Unity project not found: ${project}`);
const version = fs.readFileSync(versionFile, "utf8").match(/m_EditorVersion: (\S+)/)?.[1];
const editor = process.env.UNITY_EDITOR_PATH || (process.platform === "darwin"
  ? `/Applications/Unity/Hub/Editor/${version}/Unity.app/Contents/MacOS/Unity`
  : process.platform === "win32" ? `C:/Program Files/Unity/Hub/Editor/${version}/Editor/Unity.exe`
  : `${process.env.HOME}/Unity/Hub/Editor/${version}/Editor/Unity`);
if (!fs.existsSync(editor)) throw new Error(`Unity ${version} not found. Set UNITY_EDITOR_PATH to its executable.`);
if (fs.existsSync(path.join(project, "Temp/UnityLockfile"))) throw new Error("Close the Unity Editor for this project before starting the command-line build.");
const output = path.join(project, "Builds/AurayaleWeb");
const log = path.join(project, "Logs/aurayale-webgl-build.log");
fs.mkdirSync(path.dirname(log), { recursive: true });
console.log(`Building Unity ${version}. Log: ${log}`);
const result = spawnSync(editor, ["-batchmode", "-nographics", "-quit", "-projectPath", project, "-buildTarget", "WebGL", "-executeMethod", "Aurayale.Editor.WebGLBuild.Build", "-aurayaleBuildPath", output, "-logFile", log], { stdio: "inherit" });
if (result.error || result.status !== 0) {
  console.error(result.error?.message || `Unity exited with ${result.status}. See ${log}`);
  process.exitCode = 1;
} else {
  deployUnityBuild(output, { publicBuild: path.join(webRoot, "public/Build") });
}
