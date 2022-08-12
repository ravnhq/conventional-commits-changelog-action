import conventionalChangelog from "conventional-changelog"

const getChangelogStream = (
  tagPrefix: string,
  preset: string,
  version: string,
  releaseCount: number | undefined
) =>
  conventionalChangelog(
    {
      preset,
      releaseCount,
      tagPrefix,
    },
    { version }
  )

const generateStringChangelog = async (
  tagPrefix: string,
  preset: string,
  version: string,
  releaseCount: number
) => {
  return new Promise<string>((resolve, reject) => {
    const changelogStream = getChangelogStream(
      tagPrefix,
      preset,
      version,
      releaseCount
    )

    let changelog = ""

    changelogStream
      .on("data", (data) => {
        changelog += data.toString()
      })
      .on("end", () => resolve(changelog))
      .on("error", reject)
  })
}

export { getChangelogStream, generateStringChangelog }
