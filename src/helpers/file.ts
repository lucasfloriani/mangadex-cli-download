import * as R from 'ramda'
import * as sharp from 'sharp'
import * as fs from 'fs'
import { applyTwo, getMinAndMax } from './utils';

export const grabChannelByBuffer = async (imageBuffer: Buffer) => {
  const sharpedFile = await sharp(imageBuffer)
  const { channels } = await sharpedFile.stats();
  return channels
}

export const checkGrayscaleByChannels = (grayscaleValue = 1000000) => R.compose(
  R.lte(R.__, grayscaleValue),
  applyTwo(R.subtract),
  getMinAndMax,
  R.map<sharp.ChannelStats, number>(R.prop('sum')),
)

export const filterColoredImages = async (imageBuffer: Buffer) => {
  const channels = await grabChannelByBuffer(imageBuffer)
  const isGrayscale = checkGrayscaleByChannels()(channels)
  return !isGrayscale
}

export const saveImageFromBuffer = (dirWithFilename: string) => async (imageBuffer: Buffer) => {
  fs.writeFileSync(dirWithFilename, imageBuffer)
}

export const createDirIfDontExist = (dir: string) => !fs.existsSync(dir) && fs.mkdirSync(dir, { recursive: true })
