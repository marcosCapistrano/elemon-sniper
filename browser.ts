import puppeteer, { PuppeteerErrors } from 'puppeteer';

let page: puppeteer.Page;

export const start = async () => {
  const browser = await puppeteer.connect({
    browserWSEndpoint: "ws://127.0.0.1:9000/devtools/browser/8dcf7dca-2d8a-4c7c-9c0a-3e96d31bdd2c",
    defaultViewport: null
  });

  page = await browser.newPage();

  return page;
};

export default page!;
