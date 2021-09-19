import * as puppeteer from 'puppeteer'
import { SingleBar } from 'cli-progress'
import { createDirIfDontExist, saveImageFromBuffer } from './helpers/file'
import { grabChapterNumberByUrl } from './helpers/manga'
import { requestImageBuffer } from './helpers/api'
import { asyncEvery, sleep } from './helpers/utils';

export const getListOfChapters = async (browser: puppeteer.Browser) => {
  const page = await browser.newPage();
  await page.goto(process.env.MANGA_URL!);
  const chaptersUrls = await page.evaluate(
    () => Array.from(
      document.querySelectorAll('.chapter-container .row.no-gutters a.text-truncate'),
      (item) => `https://mangadex.tv${item.getAttribute('href')}`
    ).reverse()
  );
  await page.close()
  return chaptersUrls
}

const getImageUrlsOfChapter = (browser: puppeteer.Browser) => async (chapterUrl: string) => {
  const chapterPage = await browser.newPage();
  await chapterPage.goto(chapterUrl);
  const chapterImagesUrl = await chapterPage.evaluate(
    () => Array.from(
      document.querySelectorAll('.reader-images .reader-image-wrapper > img'),
      (item) => item.getAttribute('src') || item.getAttribute('data-src') || '',
    ).filter(item => !!item)
  )
  await chapterPage.close()
  return {
    images: chapterImagesUrl,
    chapterNumber: grabChapterNumberByUrl(chapterUrl)
  };
}

export const getImageUrlsOfChapters = async (browser: puppeteer.Browser, progressBar: SingleBar, chaptersUrls: string[]): Promise<ChapterWithImages[]> => {
  if (chaptersUrls.length === 0) return []
  const [head, ...tail] = chaptersUrls
  const imagesUrl = await getImageUrlsOfChapter(browser)(head)
  progressBar.increment();
  const nextCallResult = await getImageUrlsOfChapters(browser, progressBar, tail)
  await sleep(2000)

  return [imagesUrl, ...nextCallResult]
}

const saveImageByUrl = (imageFilters: ImageFilter[]) => async (url: string, chapterNumber: string, index: number) => {
  try {
    const imageBuffer = await requestImageBuffer(url)
    const hasPassTheFilters = await asyncEvery<ImageFilter>((fn) => fn(imageBuffer))(imageFilters)
    if (!hasPassTheFilters) return;

    const chapterDirectory = `${process.env.DIRECTORY_OF_CHAPTERS!}/chapter-${chapterNumber}`
    createDirIfDontExist(chapterDirectory)
    await saveImageFromBuffer(`${chapterDirectory}/image-${index + 1}.jpg`)(imageBuffer)
  } catch (error) {
    console.log("========================")
    console.log("error:", error)
    console.log("url:", url)
    console.log("========================")
    return ''
  }
}

type ChapterWithImages = {
  images: string[]
  chapterNumber: string
}

const grabImages = (saveImagesProgress: SingleBar, imageFilters: ImageFilter[]) => async (chapterWithImage: ChapterWithImages, index = 0) => {
  if (chapterWithImage.images.length === 0) return;
  const [head, ...tail] = chapterWithImage.images
  await saveImageByUrl(imageFilters)(head, chapterWithImage.chapterNumber, index)
  saveImagesProgress.increment();
  await sleep(3000)
  await grabImages(saveImagesProgress, imageFilters)({ chapterNumber: chapterWithImage.chapterNumber, images: tail }, index + 1)
}

type ImageFilter = (imageBuffer: Buffer) => Promise<boolean>;

export const saveImagesInLocal = (saveImagesProgress: SingleBar, imageFilters: ImageFilter[] = []) => async (chapterWithImages: ChapterWithImages[]) => {
  if (chapterWithImages.length === 0) return
  const [head, ...tail] = chapterWithImages

  await grabImages(saveImagesProgress, imageFilters)(head)
  await sleep(5000)
  await saveImagesInLocal(saveImagesProgress, imageFilters)(tail)
}
