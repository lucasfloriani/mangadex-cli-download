import axios from 'axios'

export const requestImageBuffer = async (imageUrl: string) => {
  const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
  return Buffer.from(response.data, "utf-8");
}
