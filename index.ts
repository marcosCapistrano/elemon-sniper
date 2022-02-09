import puppeteer from 'puppeteer';
import * as browser from './browser';
import { Elemon } from '@prisma/client';
import { addNewElemon, compareElemons } from './controllers/elemon';

let page: puppeteer.Page;
const ELEMONS_IN_EXISTENCE = 164831;

const nameToIdMap = new Map<string, number>();

const crawlAllElemons = async () => {
  for (let pageNum = 962; pageNum < ELEMONS_IN_EXISTENCE; pageNum += 1) {
    await crawlPage(pageNum);
  }
};

const crawlPage = async (pageNum: number) => {
  const ELEMONS_PER_PAGE = 1;

  try {
    const response = await page.goto(
      `https://app.elemon.io/elemon/GetElemonInfo?tokenId=${pageNum.toString()}`
    );
    const text = await response.text();
    const json = JSON.parse(text);
    const data = json.data;

    for (let element of data) {
      let bps = [];
      let skills = [];
      let name = element.skills[0].skillImg.split('/')[5];
      let baseCardId = nameToIdMap.get(name);
      let rarity;
      let quality;
      let purity;

      for (let bp of element.bodyPart) {
        bps.push(bp.quality);
      }

      for (let skill of element.skills) {
        skills.push(skill.level);
      }

      await page.goto(`https://app.elemon.io/elemon/${pageNum}`);
      const rarityImg = await page.$(
        '#main > div > div.elemon-details > div > div.module-header > div.img > img'
      );
      const rarityImgSrc = await rarityImg.getProperty('src');
      const rarityImgSrcValue = await rarityImgSrc.jsonValue();


      switch (rarityImgSrcValue) {
        case 'https://app.elemon.io/assets/images/rarity_B.png?v=9WexQPg2X5g9RuevE8rx5HNyDvuGWVRKSE4krkFwFho':
          rarity = 1;
          break;

        case 'https://app.elemon.io/assets/images/rarity_A.png?v=KfRnu14F1LOpMgSDmnmuX0uv22UNyrywtHirskfjrbA':
          rarity = 2;
          break;

        case 'https://app.elemon.io/assets/images/rarity_S.png?v=X9VsDaiX8z3ubg_VBVctISjVAJAIuFMI59RjYfrv6Xw':
          rarity = 3;
          break;

        case 'https://app.elemon.io/assets/images/rarity_SS.png?v=Dn6RlqRnkYoLa8e_YH4v8TKtf9Nz3Mb9DdH2BC60RgA':
          rarity = 4;
          break;

        case 'https://app.elemon.io/assets/images/rarity_SSS.png?v=BN2ffb5eq6tm9tTJutk-02A0fD2KIx4xrs4F0jcnM4I':
          rarity = 5;
          break;
      }

      const purityImg = await page.$(
        '#main > div > div.elemon-details > div > div.module-content > div > div.content-col.col-left > div > div.head > div.type > img'
      );
      const purityImgSrc = await purityImg.getProperty('src');
      const purityImgSrcValue = await purityImgSrc.jsonValue();

      switch (purityImgSrcValue) {
        case 'https://app.elemon.io/assets/images/purity_hybrid.png':
          purity = 0;
          break;

        case 'https://app.elemon.io/assets/images/purity_pure.png':
          purity = 1;
          break;
      }


			const qualityDivClass = await page.evaluate('document.querySelector("#main > div > div.elemon-details > div > div.module-content > div > div.content-col.col-left > div > div.content > div.character-content > div.character > div").getAttribute("class")')
			

			switch(qualityDivClass) {
				case "img_aura quality_1":
					quality = 1;
					break;
				case "img_aura quality_2":
					quality = 2;
					break;
				case "img_aura quality_3":
					quality = 3;
					break;
				case "img_aura quality_4":
					quality = 4;
					break;
				case "img_aura quality_5":
					quality = 5;
					break;
				case "img_aura quality_6":
					quality = 6;
					break;
				case "img_aura quality_7":
					quality = 7;
					break;
			}


      const newElemon: Elemon = {
        tokenId: pageNum,
        baseCardId,
        name,
				quality,
				rarity,
				purity,
        level: element.level,
        point: element.point,
        star: element.star,
        bp_1: bps[0],
        bp_2: bps[1],
        bp_3: bps[2],
        bp_4: bps[3],
        bp_5: bps[4],
        bp_6: bps[5],
        skill_1: skills[0],
        skill_2: skills.length > 1 ? skills[1] : undefined,
        skill_3: skills.length > 2 ? skills[2] : undefined,
        skill_4: skills.length > 3 ? skills[3] : undefined
      };

      addNewElemon(newElemon);
    }
  } catch (err) {
    // console.log('error crawling page', err);
  }
};

const crawlMarket = async () => {
  try {
    const response = await page.goto(
      `https://app.elemon.io/market/getElemonItems?pageNumber=1&pageSize=5000&positionType=0&priceMode=&baseCardId=&tokenId=&rarities=&classes=&purities=`
    );
    const text = await response.text();
    const json = JSON.parse(text);
    const data = json.data;

    crawlMarketPages(data);
  } catch (err) {
    // console.log('error crawling market', err);
  }
};

const crawlMarketPages = async (elemonsForSale: any) => {
  for (
    let elemonCount = 0;
    elemonCount < elemonsForSale.length;
    elemonCount++
  ) {
    try {
      // console.log(ids);
      const response = await page.goto(
        `https://app.elemon.io/elemon/GetElemonInfo?tokenId=${elemonsForSale[
          elemonCount
        ].tokenId.toString()}`
      );
      const text = await response.text();
      const json = JSON.parse(text);
      const data = json.data;

      let currElemon = data[0];
      let bps = [];
      let skills = [];
      let name = currElemon.skills[0].skillImg.split('/')[5];
      let baseCardId = nameToIdMap.get(name);
      let price;
      let quality;
			let rarity;
			let purity;

      for (let bp of currElemon.bodyPart) {
        bps.push(bp.quality);
      }

      for (let skill of currElemon.skills) {
        skills.push(skill.level);
      }

      for (let elemonForSale of elemonsForSale) {
        // console.log(elemonForSale.tokenId, currId);
        if (elemonForSale.tokenId === elemonsForSale[elemonCount].tokenId) {
          // console.log('MATCH', nowId);
          price = elemonForSale.lastPrice / 1000000000000000000;
          quality = elemonForSale.quality;
					rarity = elemonForSale.rarity;
					purity = elemonForSale.purity;
          // console.log(`${nowId} - ${quality}`)

          const newElemon = {
            id: elemonsForSale[elemonCount].tokenId,
            baseCardId,
            name,
            level: currElemon.level,
            point: currElemon.point,
            star: currElemon.star,
            bp_1: bps[0],
            bp_2: bps[1],
            bp_3: bps[2],
            bp_4: bps[3],
            bp_5: bps[4],
            bp_6: bps[5],
            skill_1: skills[0],
            skill_2: skills.length > 1 ? skills[1] : undefined,
            skill_3: skills.length > 2 ? skills[2] : undefined,
            skill_4: skills.length > 3 ? skills[3] : undefined,
            price,
            quality,
						rarity,
						purity,
          };

          await compareElemons(newElemon, 0.006, 0.115);
        }
      }
    } catch (err) {
      // console.log('error crawling market page', err);
    }
  }
};

const comparePages = async (newId: number, oldId: number) => {
  let imageJsonValue, imageJsonValue2;
  let nameJsonValue, nameJsonValue2;

  await page.goto(`https://app.elemon.io/elemon/${newId}`);
  const image = await page.$(
    '#main > div > div.elemon-details > div > div.module-header > div.img > img'
  );
  const imageSrc = await image.getProperty('src');
  imageJsonValue = await imageSrc.jsonValue();
  const name = await page.$(
    '#main > div > div.elemon-details > div > div.module-header > div.header-info > div.text > p.name'
  );
  const nameText = await name.getProperty('textContent');
  nameJsonValue = await nameText.jsonValue();
  // console.log(nameJsonValue);

  await page.goto(`https://app.elemon.io/elemon/${oldId}`);
  const image2 = await page.$(
    '#main > div > div.elemon-details > div > div.module-header > div.img > img'
  );
  const imageSrc2 = await image2.getProperty('src');
  imageJsonValue2 = await imageSrc2.jsonValue();
  const name2 = await page.$(
    '#main > div > div.elemon-details > div > div.module-header > div.header-info > div.text > p.name'
  );
  const nameText2 = await name2.getProperty('textContent');
  nameJsonValue2 = await nameText2.jsonValue();
  if (imageJsonValue == imageJsonValue2 && nameJsonValue == nameJsonValue2)
    return true;

  return false;
};

const main = async () => {
  page = await browser.start();

  nameToIdMap.set('Neikoo', 4);
  nameToIdMap.set('Skurumi', 8);
  nameToIdMap.set('RusMoonch', 9);
  nameToIdMap.set('PoxArchies', 10);
  nameToIdMap.set('Legolas', 11);
  nameToIdMap.set('Mykasa', 12);
  nameToIdMap.set('Hyugar', 15);
  nameToIdMap.set('Inori', 16);
  nameToIdMap.set('Kuroo', 22);
  nameToIdMap.set('Elight', 17);
  nameToIdMap.set('Finter', 20);
  nameToIdMap.set('Ties', 21);
  nameToIdMap.set('Hoorus', 26);
  nameToIdMap.set('Raizer', 6);
  nameToIdMap.set('Scary', 9);
  nameToIdMap.set('Cokoner', 13);
  nameToIdMap.set('SkyGaden', 18);
  nameToIdMap.set('CorsairMastic', 27);
  nameToIdMap.set('CorsairLord', 28);

  // await crawlAllElemons();
  await crawlMarket();
};

main();
