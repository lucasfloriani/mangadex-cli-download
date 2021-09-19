import * as sharp from 'sharp'
import * as glob from 'glob'
import * as fs from 'fs'
import { prop } from 'ramda'

const testingIfImageIsGray = async (url: string) => {
  const sharpedFile = await sharp(url)
  const { channels } = await sharpedFile.stats();
  const sums = channels.map(prop('sum'))
  const maxSum = Math.max(...sums)
  const minSum = Math.min(...sums)
  const sumDifference = maxSum - minSum
  const isGrayscale = sumDifference <= 1000000

  return {
    url,
    maxSum,
    minSum,
    sumDifference,
    isGrayscale,
  }
}

const main = async () => {
  glob("images/**/*.jpg", { nosort: true }, async (err: Error | null, files: string[]) => {
    let infos = []
    for (const file of files) {
      const info = await testingIfImageIsGray(file)
      infos.push(info)
    }
    fs.writeFileSync("infos.json", JSON.stringify(infos, null, 4));
  })
}

main()
