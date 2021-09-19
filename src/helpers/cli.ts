import * as cliProgress from 'cli-progress'

export const generateDefaultProgressBar = () => new cliProgress.SingleBar(
  { stopOnComplete: true, clearOnComplete: true },
  cliProgress.Presets.shades_classic
);

export const logSectionName = (name: string) => console.log(`===> Start ${name}`)
