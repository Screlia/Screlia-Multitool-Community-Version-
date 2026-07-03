import { useSettings } from '../context/SettingsContext';

const tr = {
  // Layout
  search_engine: "Arama Motoru",
  chat: "Sohbet",
  studios: "Stüdyolar",
  weather: "Hava Durumu",
  news: "Haberler",
  notes: "Notlar",
  feedback: "Geri Bildirim",
  settings: "Ayarlar",
  profile: "Profil",
  login: "Giriş Yap",
  store: "Eklentiler",

  // Settings
  settings_title: "Ayarlar",
  settings_desc: "Yapay Zeka çoklu araç deneyiminizi özelleştirin.",
  api_config: "API Yapılandırması & Model",
  api_config_desc: "Kullanmak istediğiniz yapay zeka modelini seçin ve API anahtarlarınızı girin.",
  premium_active: "Premium Aktif",
  ai_model: "AI Modeli",
  gemini_api_key: "Gemini API Anahtarı",
  chatgpt_api_key: "ChatGPT API Anahtarı",
  claude_api_key: "Claude API Anahtarı",
  api_keys_note: "Anahtarlarınız yerel olarak tarayıcınızda tutulur ve asla sunucularımıza gönderilmez.",
  appearance: "Görünüm",
  appearance_desc: "Uygulama için bir tema seçin.",
  search_engine_title: "Arama Motoru",
  search_engine_desc: "Tercih ettiğiniz arama motorunu seçin.",
  search_engine_note: "Not: Tüm aramalar Gemini Aramaları ile güçlendirilmiştir, ancak arama motoru sonucunu tercihinize göre optimize ederiz.",
  language_accessibility: "Erişilebilirlik ve Dil",
  language_desc: "Yapay zeka yanıtları ve arayüz için dil seçimi.",
  response_language: "Arayüz & Yanıt Dili",
  search_filters: "Arama Filtreleri",
  search_filters_desc: "Bu filtreler otomatik olarak aramalarınıza uygulanır.",
  included_keywords: "Dahil Edilecek Terimler",
  included_keywords_desc: "Bu terimleri aramalara hep dahil et",
  excluded_keywords: "Hariç Tutulacak Terimler",
  excluded_keywords_desc: "Bu kelimelerin geçtiği sonuçları çıkar",
  preferred_sites: "Tercih Edilen Siteler",
  preferred_sites_desc: "Öncelikli olarak bu sitelerin sonuçlarını göster (virgül ile ayırın)",
  result_relevance: "Sonuç Alakalılığı",
  broad: "Geniş & Çeşitli",
  precise: "Kesin & Odaklı",
  about: "Hakkında",
  dev_team: "Multitool geliştiricileri",
  dev_studio: "Geliştirici Stüdyo",
  dev_designer: "Geliştirici & Tasarımcı",
  built_with: "ile geliştirildi",
  for_world: "Tüm dünya için",

  // Chat
  new_chat: "Yeni Sohbet",
  history: "Geçmiş",
  message_placeholder: "Mesajınızı yazın...",
};

const en = {
  // Layout
  search_engine: "Search Engine",
  chat: "Chat",
  studios: "Studios",
  weather: "Weather",
  news: "News",
  notes: "Notes",
  feedback: "Feedback",
  settings: "Settings",
  profile: "Profile",
  login: "Login",
  store: "Add-ons",

  // Settings
  settings_title: "Settings",
  settings_desc: "Customize your AI multi-tool experience.",
  api_config: "API Configuration & Model",
  api_config_desc: "Select the AI model you want to use and enter your API keys.",
  premium_active: "Premium Active",
  ai_model: "AI Model",
  gemini_api_key: "Gemini API Key",
  chatgpt_api_key: "ChatGPT API Key",
  claude_api_key: "Claude API Key",
  api_keys_note: "Your keys are stored locally in your browser and never sent to our servers.",
  appearance: "Appearance",
  appearance_desc: "Choose a theme for the application.",
  search_engine_title: "Search Engine",
  search_engine_desc: "Select your preferred search engine.",
  search_engine_note: "Note: All searches are powered by Gemini Search, but we optimize the result based on your preference.",
  language_accessibility: "Accessibility & Language",
  language_desc: "Language selection for AI responses and interface.",
  response_language: "Interface & Response Language",
  search_filters: "Search Filters",
  search_filters_desc: "These filters are automatically applied to your searches.",
  included_keywords: "Included Terms",
  included_keywords_desc: "Always include these terms in searches",
  excluded_keywords: "Excluded Terms",
  excluded_keywords_desc: "Remove results containing these words",
  preferred_sites: "Preferred Sites",
  preferred_sites_desc: "Show results from these sites primarily (comma separated)",
  result_relevance: "Result Relevance",
  broad: "Broad & Diverse",
  precise: "Precise & Focused",
  about: "About",
  dev_team: "Multitool developers",
  dev_studio: "Developer Studio",
  dev_designer: "Developer & Designer",
  built_with: "built with",
  for_world: "For the whole world",

  // Chat
  new_chat: "New Chat",
  history: "History",
  message_placeholder: "Type your message...",
};

type Translations = typeof tr;

export function useTranslation() {
  const { filters } = useSettings();
  const isEnglish = filters.language === 'English';
  
  const translations: Translations = isEnglish ? en : tr;

  return {
    t: (key: keyof Translations) => translations[key] || key,
    isEnglish
  };
}
