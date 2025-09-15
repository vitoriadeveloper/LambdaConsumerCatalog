import { processCatalogItem } from "../services/catalogService.js";

export const handler = async (event) => {
  try {
    for (const record of event.Records) {
      console.log("[consumerCatalogHandler] - Processando record:", record);

      const rawBody = JSON.parse(record.body);
      const body = JSON.parse(rawBody.Message);

      console.log("[consumerCatalogHandler] - Body obtido:", body);

      await processCatalogItem(body);
    }
  } catch (error) {
    console.error("[consumerCatalogHandler] - Erro ao processar mensagens", error);
    throw new Error("Erro ao processar mensagens do SQS");
  }
};
