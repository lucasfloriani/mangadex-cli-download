import 'dotenv/config'
import * as puppeteer from 'puppeteer'
import { getListOfChapters, getImageUrlsOfChapters, saveImagesInLocal } from './src/manga'
import { filterColoredImages } from './src/helpers/file'
import { generateDefaultProgressBar, logSectionName } from './src/helpers/cli'

(async () => {
  try {
    // TODO: The only upgrade that can be made is using some Monad to make it a pipe
    const browser = await puppeteer.launch({ headless: true });

    logSectionName("chaptersUrls")
    const chaptersUrls = await getListOfChapters(browser)

    logSectionName("imageUrlsOfChapters")
    const imagesUrlProgress = generateDefaultProgressBar();
    imagesUrlProgress.start(chaptersUrls.length, 0)
    const imageUrlsOfChapters = await getImageUrlsOfChapters(browser, imagesUrlProgress, chaptersUrls)

    logSectionName("saveImagesInLocal")
    /**
     * First parameter of saveImagesInLocal receive a list of filters using the buffer of the images,
     * if isn't needed you can just call the function because the default value is an array, example:
     *
     * saveImagesInLocal()(imageUrlsOfChapters)
     */
    const saveImagesProgress = generateDefaultProgressBar();
    const totalImages = imageUrlsOfChapters.reduce((acc, imageUrlsOfChapter) => acc + imageUrlsOfChapter.images.length, 0)
    saveImagesProgress.start(totalImages, 0)
    await saveImagesInLocal(saveImagesProgress, [filterColoredImages])(imageUrlsOfChapters)
    saveImagesProgress.stop()

    await browser.close();
  } catch (e) {
    console.error(e)
  }
})();
