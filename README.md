Project Scerlia: Core Infrastructure

Scerlia, Google Gemini API entegrasyonu ile çalışan, yüksek performanslı ve otonom bir AI agent framework'üdür. Bu döküman, sistemin çalışma zamanı (runtime) parametrelerini ve mimari gereksinimlerini tanımlar.

 Technical Architecture

Component

Technology

Model

gemini-2.5-flash-preview-09-2025

Runtime

Google Cloud Run (Containerized)

Environment

AI Studio Managed Runtime

Auth

OAuth 2.0 / API Key

Runtime Configuration

Uygulama, çalışma anında aşağıdaki ortam değişkenlerini (Environment Variables) otomatik olarak enjekte eder.

Secret Management

Hassas veriler Secrets katmanı üzerinden yönetilir:

# Gemini API erişim yetkisi
GEMINI_API_KEY="AI_STUDIO_INJECTED_KEY"

# Dinamik Cloud Run servis URL'si
APP_URL="[https://scerlia-service-hash.a.run.app](https://scerlia-service-hash.a.run.app)"


📡 Network & Endpoints

APP_URL değişkeni, sistemin callback ve origin doğrulamaları için dinamik olarak kullanılır:

OAuth Redirects: ${APP_URL}/auth/callback

API Gateway: ${APP_URL}/api/v1/

Webhook Listener: ${APP_URL}/webhooks/gemini

🚀 Deployment Pipeline

Sistemi ayağa kaldırmak için aşağıdaki protokolü izleyin:

# 1. AI Studio üzerinden Secrets paneline gidin
# 2. Gerekli keyleri tanımlayın:
SET SECRET GEMINI_API_KEY = "your_key_here"

# 3. Cloud Run trigger'ını başlatın
# APP_URL sistem tarafından otomatik atanacaktır.


📊 Monitoring & Logging

Sistem operasyonel verileri şu şekilde takip edilebilir:

Stdout/Stderr: AI Studio Console üzerinden gerçek zamanlı log akışı.

Latency: Model yanıt süreleri ve token tüketim metrikleri.

[!IMPORTANT]
APP_URL değişkeni her yeni deployment (cold start veya version update) sonrası servis tarafından güncellenmektedir. Statik URL tanımlamalarından kaçının.

© 2026 Scerlia Project - Technical Documentation
