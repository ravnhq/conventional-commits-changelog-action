/* eslint-disable sort-imports, eslint-comments/no-unused-disable */
import * as core from "@actions/core"
import conventionalRecommendedBump from "conventional-recommended-bump"
import gitSemverTags from "git-semver-tags"
import { bumpVersion } from "./bump-version"
import { generateStringChangelog } from "./generate-changelog"

const gitSemverTagsAsync = async () => {
  return new Promise<string[]>((resolve, reject) => {
    gitSemverTags((err, tags) => {
      if (err) {
        reject(err)
      } else {
        resolve(tags)
      }
    })
  })
}

const conventionalRecommendedBumpAsync = async (
  tagPrefix: string,
  preset: string
) => {
  return new Promise<conventionalRecommendedBump.Callback.Recommendation>(
    (resolve, reject) => {
      conventionalRecommendedBump(
        {
          tagPrefix,
          preset,
        },
        (error, recommendation) => {
          if (error) {
            reject(error)
          } else {
            resolve(recommendation)
          }
        }
      )
    }
  )
}

async function run() {
  try {
    const tagPrefix = core.getInput("tag-prefix")
    const preset = core.getInput("preset")
    const version = core.getInput("version")

    core.info(`Using "${preset}" preset`)
    core.info(`Using "${tagPrefix}" as tag prefix`)

    let newVersion = version

    if (!newVersion) {
      const { releaseType, reason } = await conventionalRecommendedBumpAsync(
        tagPrefix,
        preset
      )

      core.info(`Recommended release type: ${releaseType}`)

      if (reason) {
        core.info(`Because: ${reason}`)
      }
      const tags = await gitSemverTagsAsync()
      const tagVersion = tags[0] ? tags[0].replace(tagPrefix, "") : null
      newVersion = bumpVersion(releaseType, tagVersion, "1.0.0")

      core.info(`Recommended new version: ${newVersion}`)
    }

    const stringChangelog = await generateStringChangelog(
      tagPrefix,
      preset,
      newVersion,
      1
    )

    core.info("Changelog generated")
    core.info(stringChangelog)

    const cleanChangelog = stringChangelog
      .split("\n")
      .slice(1)
      .join("\n")
      .trim()

    if (cleanChangelog === "") {
      core.info("Generated changelog is empty")
      core.setOutput("empty", "true")
      return
    }

    const gitTag = `${tagPrefix}${newVersion}`

    core.setOutput("changelog", stringChangelog)
    core.setOutput("clean_changelog", cleanChangelog)
    core.setOutput("version", newVersion)
    core.setOutput("tag", gitTag)
    core.setOutput("empty", "false")
  } catch (error: unknown) {
    if (error instanceof Error) {
      core.setFailed(error.message)
    }
  }
}

run()
