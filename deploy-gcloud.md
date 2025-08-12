# Seta o ID do seu projeto
gcloud config set project mkcloset-backend


# O Cloud Build vai construir a imagem e enviá-la para o Artifact Registry.
gcloud builds submit --tag gcr.io/mkcloset-backend/mkcloset-backend


# O comando de implantação para o Cloud Run
gcloud run deploy mkcloset-backend `
    --image gcr.io/mkcloset-backend/mkcloset-backend `
    --platform managed `
    --region southamerica-east1 `
    --allow-unauthenticated `
    --max-instances 2 `
    --service-account mkcloset-backend@mkcloset-backend.iam.gserviceaccount.com `
    --add-cloudsql-instances "mkcloset-backend:southamerica-east1:ecommerce-db" `
    --set-env-vars PAGSEGURO_API_URL=https://api.pagseguro.com `
    --set-env-vars DATABASE_URL="postgresql://ecommerce_db:M@iara123@35.198.21.242:5432/postgres" `
    --set-env-vars PAGSEGURO_API_TOKEN=6eea4f4d-e47f-4d9a-b4a7-8da803a5588c21946116400d8cea724ab845fd5f96365a3b-ab91-41e3-93e9-fcf285a15896 `
    --set-env-vars JWT_SECRET=ZhEiNRfURY8VmeiOwvnNVq3bJrCFIVcDO8LYwFC+ugI= `
    --set-env-vars JWT_EXPIRES_IN=1d `
    --set-env-vars CORREIOS_API_URL=https://viacep.com.br