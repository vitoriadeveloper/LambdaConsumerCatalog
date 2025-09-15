import { getS3Object, putS3Object } from "./s3Services";
import { BUCKET_NAME } from "../constants/bucket.js";

export async function processCatalogItem(body) {
  const isProduct = !!body.categoryId;
  const ownerKey = isProduct ? body.categoryId : body.ownerId;

  if (!ownerKey) {
    console.error("[processCatalogItem] - Mensagem inválida: não possui categoryId/ownerId");
    return;
  }

  const filename = `${ownerKey}-catalog.json`;

  try {
    const catalogRaw = await getS3Object(BUCKET_NAME, filename);
    const catalogData = JSON.parse(catalogRaw);

    if (isProduct) {
      updateOrAddItem(catalogData.products, body);
    } else {
      updateOrAddItem(catalogData.categories, body);
    }

    await putS3Object(BUCKET_NAME, filename, JSON.stringify(catalogData));
    console.log(`[processCatalogItem] - Atualizado catálogo: ${filename}`);
  } catch (error) {
    console.log("[processCatalogItem] - Catálogo não existe, criando novo");

    const newCatalog = { products: [], categories: [] };

    if (isProduct) {
      newCatalog.products.push(body);
    } else {
      newCatalog.categories.push(body);
    }

    await putS3Object(BUCKET_NAME, filename, JSON.stringify(newCatalog));
    console.log(`[processCatalogItem] - Criado novo catálogo: ${filename}`);
  }
}

function updateOrAddItem(catalog, newItem) {
  const index = catalog.findIndex(i => i.id === newItem.id);
  if (index !== -1) {
    catalog[index] = { ...catalog[index], ...newItem };
  } else {
    catalog.push(newItem);
  }
}
