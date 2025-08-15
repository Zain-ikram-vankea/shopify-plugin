const axios = require("axios");

async function autoInjectModelViewer(shop, accessToken) {
  console.log(shop,"shop")
  const snippetCode = `
{% if product.metafields['custom']['3d_model'] %}
  <model-viewer
    src="{{ product.metafields['custom']['3d_model'] }}"
    alt="{{ product.title }}"
    camera-controls
    auto-rotate
    ar
    ar-modes="webxr scene-viewer quick-look"
    style="width:100%; height:500px;"
  ></model-viewer>
{% else %}
  {% for image in product.images %}
     {% render 'product-media-gallery', media: product.media %}
  {% endfor %}
{% endif %}

`;

  // 1️⃣ Get Main Theme
  const themeRes = await axios.get(
    `https://${shop}/admin/api/2025-01/themes.json`,
    { headers: { "X-Shopify-Access-Token": accessToken } }
  );
  const mainTheme = themeRes.data.themes.find(t => t.role === "main");
  if (!mainTheme) throw new Error("Main theme not found");

  // 2️⃣ Upload Snippet
  await axios.put(
    `https://${shop}/admin/api/2025-01/themes/${mainTheme.id}/assets.json`,
    {
      asset: {
        key: "snippets/model-viewer.liquid",
        value: snippetCode
      }
    },
    { headers: { "X-Shopify-Access-Token": accessToken } }
  );

  // 3️⃣ List Theme Assets
  const assetsRes = await axios.get(
    `https://${shop}/admin/api/2025-01/themes/${mainTheme.id}/assets.json`,
    { headers: { "X-Shopify-Access-Token": accessToken } }
  );

  // 4️⃣ Detect product template/section files
  const productFiles = assetsRes.data.assets.filter(asset =>
    asset.key.includes("product") && asset.key.endsWith(".liquid")
  );

  let injectedFiles = [];

  // 5️⃣ Scan and Inject
  for (const file of productFiles) {
    const fileRes = await axios.get(
      `https://${shop}/admin/api/2025-01/themes/${mainTheme.id}/assets.json`,
      {
        headers: { "X-Shopify-Access-Token": accessToken },
        params: { "asset[key]": file.key }
      }
    );

    let content = fileRes.data.asset.value;

    // Match possible gallery render
    const pattern = /render\s+'product-media-gallery'|for\s+image\s+in\s+product\.images|product\.media/g;

    if (pattern.test(content)) {
        // Backup key with .bak before .liquid
        const backupKey = file.key.replace('.liquid', `_bak.liquid`);

        // 1. Create Backup
        await axios.put(
          `https://${shop}/admin/api/2025-01/themes/${mainTheme.id}/assets.json`,
          {
            asset: {
              key: backupKey, // e.g. "sections/product-template.bak.liquid"
              value: content
            }
          },
          { headers: { "X-Shopify-Access-Token": accessToken } }
        );

        // 2. Replace with snippet
        const newContent = content.replace(
          pattern,
          `{% render 'model-viewer' %}\n$&`
        );

        // 3. Save updated file
        await axios.put(
          `https://${shop}/admin/api/2025-01/themes/${mainTheme.id}/assets.json`,
          {
            asset: {
              key: file.key,
              value: newContent
            }
          },
          { headers: { "X-Shopify-Access-Token": accessToken } }
        );

        injectedFiles.push(file.key);
      }

  }

  return { snippet: "model-viewer.liquid", modifiedFiles: injectedFiles };
}

module.exports = { autoInjectModelViewer };
