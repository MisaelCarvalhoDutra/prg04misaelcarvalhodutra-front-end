import { supabase } from "../lib/supabase";

const BUCKET_NAME = "pizzly-imagens";

export async function uploadImagem(imagem, pasta) {
  if (!imagem) {
    throw new Error("Nenhuma imagem foi selecionada.");
  }

  const extensao = imagem.name.split(".").pop();
  const nomeArquivo = `${crypto.randomUUID()}.${extensao}`;
  const caminhoArquivo = `${pasta}/${nomeArquivo}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(caminhoArquivo, imagem, {
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) {
    throw new Error(`Erro ao enviar a imagem: ${uploadError.message}`);
  }

  const { data } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(caminhoArquivo);

  return data.publicUrl;
}