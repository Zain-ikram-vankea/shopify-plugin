const Shop = require("../models/shops");

async function getTokenByShop(shop) {
  const shopData = await Shop.findOne({ shopDomain: shop });
  return shopData ? shopData.accessToken : null;
}
module.exports = { getTokenByShop };