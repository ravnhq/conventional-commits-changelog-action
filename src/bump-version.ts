const bumpVersion = (
  releaseType: "major" | "minor" | "patch" | undefined,
  version: string | null,
  fallbackVersion = "0.1.0"
) => {
  let major: number | string
  let minor: number | string
  let patch: number | string

  if (version) {
    ;[major, minor, patch] = version.split(".")

    switch (releaseType) {
      case "major":
        major = parseInt(major, 10) + 1
        minor = 0
        patch = 0
        break

      case "minor":
        minor = parseInt(minor, 10) + 1
        patch = 0
        break

      default:
        patch = parseInt(patch, 10) + 1
    }
  } else {
    ;[major, minor, patch] = fallbackVersion.split(".")
  }

  return `${major}.${minor}.${patch}`
}

export { bumpVersion }
