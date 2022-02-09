import { PrismaClient, Elemon } from '@prisma/client';

const prisma = new PrismaClient();

export const addNewElemon = async (elemon: Elemon) => {
  const el = await prisma.elemon.findMany({
    where: {
      level: elemon.level,
      star: elemon.star,
      point: elemon.point,
      baseCardId: elemon.baseCardId,
      name: elemon.name,
      bp_1: elemon.bp_1,
      bp_2: elemon.bp_2,
      bp_3: elemon.bp_3,
      bp_4: elemon.bp_4,
      bp_5: elemon.bp_5,
      bp_6: elemon.bp_6,
      skill_1: elemon.skill_1,
      skill_2: elemon.skill_2,
      skill_3: elemon.skill_3,
      skill_4: elemon.skill_4
    }
  });

  if (el.length == 0) {
    await prisma.elemon.create({
      data: elemon
    });
  }
};

export const compareElemons = async (elemon1, elcoinPrice, elmonPrice) => {
  const comparableElemons = await prisma.elemon.findMany({
    where: {
      name: elemon1.name,
			baseCardId: elemon1.baseCardId,
			/*
      bp_1: elemon1.bp_1,
      bp_2: elemon1.bp_2,
      bp_3: elemon1.bp_3,
      bp_4: elemon1.bp_4,
      bp_5: elemon1.bp_5,
      bp_6: elemon1.bp_6,
			*/
			rarity: elemon1.rarity,
			purity: elemon1.purity,
			quality: elemon1.quality
    }
  });

	// console.log(comparableElemons)

  for (let compElemon of comparableElemons) {
		// console.log("COMPARABLE")
		// console.log(compElemon.name)
		// console.log("/////")
    let price = elemon1.price;
    if (elemon1.point < compElemon.point) {
      if (elemon1.star < compElemon.star) {
        price += calculateCostForStar(
          elemon1.star,
          compElemon.star,
          elmonPrice
        );
      }

      if (elemon1.level < compElemon.level) {
        price += calculateCostForLevel(
          elemon1.level,
          compElemon.level,
          elcoinPrice
        );
      }

      if (elemon1.skill_1 < compElemon.skill_1) {
        price += calculateCostForSkill(
          elemon1.skill_1,
          compElemon.skill_1,
          elcoinPrice
        );
      }

      if (
        elemon1.quality >= 3 &&
        compElemon.skill_2 &&
        elemon1.skill_2 < compElemon.skill_2
      ) {
        price += calculateCostForSkill(
          elemon1.skill_2,
          compElemon.skill_2,
          elcoinPrice
        );
      }

      if (
        elemon1.quality >= 5 &&
        compElemon.skill_3 &&
        elemon1.skill_3 < compElemon.skill_3
      ) {
        price += calculateCostForSkill(
          elemon1.skill_3,
          compElemon.skill_3,
          elcoinPrice
        );
      }

      if (
        elemon1.quality >= 7 &&
        compElemon.skill_4 &&
        elemon1.skill_4 < compElemon.skill_4
      ) {
        price += calculateCostForSkill(
          elemon1.skill_4,
          compElemon.skill_4,
          elcoinPrice
        );
      }
    }

		const priceForSelectedROI = calculatePriceForROI(compElemon.point, 21);

		if(price * 1.1 < priceForSelectedROI) {
			console.log(`POSSIBLE OPPORTUNITY: ${elemon1.id} - ${compElemon.tokenId} - ${priceForSelectedROI-price}`);
			console.log(`Price For ROI: ${priceForSelectedROI}`);
			console.log(`Total Price: ${price}`);
			// console.log("quality: " + elemon1.quality);
			// console.log(compElemon);
		}

		 //console.log("profit: ", priceForSelectedROI - price);
  }
};

const calculatePriceForROI = (point: number, days: number) => {
	return point * days * 0.000061824;
}

const calculateCostForLevel = (
  level: number,
  compLevel: number,
  elcoinPrice: number
) => {
  const levelPrices = [
    0, 20, 22, 27, 33, 42, 53, 67, 84, 104, 128,156, 188, 225, 267, 314, 367, 425, 490,
    560, 638, 723, 800, 914, 1021, 1137, 1261, 1394, 1536, 1687, 1848, 2019, 2200,
    2392, 2595, 2809, 3035, 3272, 3522, 3783, 4058, 4346, 4646, 4961, 5289,
    5632, 5989, 6361, 6748, 7150, 7568, 8002, 8452, 8919, 9403, 9904, 10423,
    10959, 11514, 12086
  ];
  let spent = 0;

  const levelInterval = levelPrices.slice(level - 1, compLevel);

  for (let price of levelInterval) {
    spent += price * elcoinPrice;
  }


  return spent;
};

const calculateCostForStar = (
  star: number,
  compStar: number,
  elmonPrice: number
) => {
  const starPrices = [5, 9, 18, 30, 45, 69, 97, 129, 174];
  let spent = 0;

  const starInterval = starPrices.slice(star, compStar);

  for (let price of starInterval) {
    spent += price * elmonPrice;
  }


  return spent;
};

const calculateCostForSkill = (
  skill: number,
  compSkill: number,
  elcoinPrice: number
) => {
  const skillPrices = [
    0, 100, 114, 136, 168, 211, 266, 335, 420, 522, 642, 782, 944, 1129, 1338,
    1573, 1836, 2128, 2450, 2804, 3192, 3615, 4074, 4571, 5108, 5686, 6300,
    6970, 7700, 8500
  ];
  let spent = 0;

  const skillInterval = skillPrices.slice(skill, compSkill);

  for (let price of skillInterval) {
    spent += price * elcoinPrice;
  }


  return spent;
};

console.log(calculateCostForLevel(2, 25, 0.006));
console.log(calculateCostForSkill(1, 12, 0.006));
console.log(calculateCostForSkill(1, 12, 0.006));
console.log(calculateCostForSkill(2, 12, 0.006));
console.log(calculateCostForStar(0, 6, 0.18));

