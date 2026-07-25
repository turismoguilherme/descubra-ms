/**
 * Gera o APK debug via Gradle (sem abrir a UI do Android Studio)
 * e copia para public/downloads/descubra-ms.apk
 */
import { spawnSync } from "child_process";
import { copyFileSync, existsSync, mkdirSync, readdirSync, statSync } from "fs";
import path from "path";

const root = process.cwd();
const androidDir = path.join(root, "android");
const outApk = path.join(androidDir, "app", "build", "outputs", "apk", "debug", "app-debug.apk");
const destDir = path.join(root, "public", "downloads");
const destApk = path.join(destDir, "descubra-ms.apk");

function findStudioJbr() {
  const bases = [
    "C:\\Program Files\\Android\\Android Studio1\\jbr",
    "C:\\Program Files\\Android\\Android Studio\\jbr",
    process.env.JAVA_HOME,
  ].filter(Boolean);

  for (const base of bases) {
    const java = path.join(base, "bin", "java.exe");
    if (existsSync(java)) return base;
  }
  return null;
}

const jbr = findStudioJbr();
if (!jbr) {
  console.error(
    "JDK do Android Studio não encontrado. Instale o Android Studio ou defina JAVA_HOME."
  );
  process.exit(1);
}

const androidHome =
  process.env.ANDROID_HOME ||
  process.env.ANDROID_SDK_ROOT ||
  path.join(process.env.LOCALAPPDATA || "", "Android", "Sdk");

if (!existsSync(androidHome)) {
  console.error("Android SDK não encontrado em", androidHome);
  process.exit(1);
}

const env = {
  ...process.env,
  JAVA_HOME: jbr,
  ANDROID_HOME: androidHome,
  ANDROID_SDK_ROOT: androidHome,
  Path: `${path.join(jbr, "bin")};${path.join(androidHome, "platform-tools")};${process.env.Path || ""}`,
};

console.log("JAVA_HOME =", jbr);
console.log("ANDROID_HOME =", androidHome);
console.log("Building debug APK…");

const result = spawnSync(
  process.platform === "win32" ? "gradlew.bat" : "./gradlew",
  ["assembleDebug", "--no-daemon"],
  { cwd: androidDir, env, stdio: "inherit", shell: true }
);

if (result.status !== 0) {
  process.exit(result.status || 1);
}

if (!existsSync(outApk)) {
  console.error("APK não gerado em", outApk);
  process.exit(1);
}

mkdirSync(destDir, { recursive: true });
copyFileSync(outApk, destApk);
const sizeMb = (statSync(destApk).size / (1024 * 1024)).toFixed(2);
console.log(`OK → ${destApk} (${sizeMb} MB)`);
console.log("Página de download: /descubrams/baixar-app");
