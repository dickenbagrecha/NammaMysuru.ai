import type { Express, Request, Response } from "express";
import { model, plainTextModel } from "../gemini_client";
import { chatStorage } from "./storage";
import { getWeather, getTime } from "../weather";
import { SchemaType } from "@google/generative-ai";

const tools = [
  {
    functionDeclarations: [
      {
        name: "getWeather",
        description: "Get the current weather for a specific location",
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            location: {
              type: SchemaType.STRING,
              description: "The city and state, e.g. Mysuru, Karnataka",
            },
          },
          required: ["location"],
        },
      },
    ],
  },
];

type SupportedLanguage = "English" | "Kannada" | "Hindi";
type LanguagePreference = SupportedLanguage | "Auto";

const supportedLanguages = new Set<SupportedLanguage>(["English", "Kannada", "Hindi"]);
const supportedLanguagePreferences = new Set<LanguagePreference>(["Auto", "English", "Kannada", "Hindi"]);

const languageInstructions: Record<SupportedLanguage, string> = {
  English: "Reply in polished, natural English.",
  Kannada: "Reply only in Kannada using Kannada script. Keep place names readable, and use English only for unavoidable proper nouns such as official phone numbers or brand names.",
  Hindi: "Reply only in Hindi using Devanagari script. Keep place names readable, and use English only for unavoidable proper nouns such as official phone numbers or brand names.",
};

function normalizeLanguage(language: unknown): LanguagePreference {
  return typeof language === "string" && supportedLanguagePreferences.has(language as LanguagePreference)
    ? language as LanguagePreference
    : "Auto";
}

function detectLanguageFromText(content: string): SupportedLanguage {
  if (/[\u0C80-\u0CFF]/.test(content)) return "Kannada";
  if (/[\u0900-\u097F]/.test(content)) return "Hindi";
  return "English";
}

function resolveReplyLanguage(language: unknown, content: string): SupportedLanguage {
  const preference = normalizeLanguage(language);
  return preference === "Auto" ? detectLanguageFromText(content) : preference;
}

function hasAny(value: string, keywords: string[]) {
  return keywords.some((keyword) => value.includes(keyword.toLowerCase()));
}

function buildFallbackResponse(content: string, language: SupportedLanguage = "English") {
  const query = content.toLowerCase();
  const isFood = hasAny(query, ["food", "eat", "restaurant", "mysore pak", "dosa", "breakfast", "lunch", "dinner", "ಆಹಾರ", "ಊಟ", "ತಿಂಡಿ", "ದೋಸೆ", "ಮೈಸೂರು ಪಾಕ್", "खाना", "भोजन", "रेस्तरां", "डोसा", "मैसूर पाक"]);
  const isPlan = hasAny(query, ["itinerary", "day", "plan", "route", "trip", "ಪ್ರವಾಸ", "ಯೋಜನೆ", "ದಿನ", "मार्ग", "योजना", "घूमना", "दिन"]);
  const isChamundi = hasAny(query, ["chamundi", "hill", "ಚಾಮುಂಡಿ", "ಬೆಟ್ಟ", "चामुंडी", "पहाड़ी"]);
  const isPalace = hasAny(query, ["palace", "royal", "heritage", "ಅರಮನೆ", "ರಾಜ", "ಪಾರಂಪರ್ಯ", "महल", "शाही", "विरासत"]);
  const isEmergency = hasAny(query, ["emergency", "help", "police", "hospital", "ambulance", "ತುರ್ತು", "ಸಹಾಯ", "ಪೊಲೀಸ್", "ಆಸ್ಪತ್ರೆ", "आपात", "मदद", "पुलिस", "अस्पताल", "एम्बुलेंस"]);

  if (language === "Kannada") {
    if (isFood) {
      return `ಗೌರವಾನ್ವಿತ ಅತಿಥಿಯೇ, ಮೈಸೂರಿನ ರುಚಿ ಪ್ರಯಾಣವನ್ನು **ಮೈಸೂರು ಮಸಾಲೆ ದೋಸೆ**, **ಫಿಲ್ಟರ್ ಕಾಫಿ**, ಮತ್ತು ಬಿಸಿ **ಮೈಸೂರು ಪಾಕ್** ನಿಂದ ಆರಂಭಿಸಿ.\n\n- **ಬೆಳಗ್ಗೆ:** ಸಾಂಪ್ರದಾಯಿಕ ದಕ್ಷಿಣ ಭಾರತೀಯ ಉಪಹಾರ\n- **ಮಧ್ಯಾಹ್ನ:** ಸರಳ ಸ್ಥಳೀಯ ಊಟ ಅಥವಾ ಥಾಳಿ\n- **ಸಂಜೆ:** ಅರಮನೆ ಪ್ರದೇಶದ ಹತ್ತಿರ ಸಿಹಿ ಮತ್ತು ಕಾಫಿ\n\n**ರಾಜಮರ್ಯಾದೆಯ ಸ್ಪರ್ಶ:** ನಂಬಿಕೆಯ ಅಂಗಡಿಯಿಂದ ಮೈಸೂರು ಪಾಕ್ ಅಥವಾ ಚಂದನದ ಸ್ಮರಣಿಕೆ ತೆಗೆದುಕೊಂಡು ಹೋಗಿ.`;
    }
    if (isPlan) {
      return `ಗೌರವಾನ್ವಿತ ಅತಿಥಿಯೇ, ಮೈಸೂರಿಗೆ ಸುಂದರ ಒಂದು ದಿನದ ಯೋಜನೆ ಇಲ್ಲಿದೆ:\n\n- **ಬೆಳಗ್ಗೆ:** ಮೈಸೂರು ಅರಮನೆ ಮತ್ತು ದೇವರಾಜ ಮಾರುಕಟ್ಟೆ\n- **ಮಧ್ಯಾಹ್ನ:** ಸಂತ ಫಿಲೋಮಿನಾ ಚರ್ಚ್ ಅಥವಾ ಮೈಸೂರು ಮೃಗಾಲಯ\n- **ಸಂಜೆ:** ಚಾಮುಂಡಿ ಬೆಟ್ಟದ ನೋಟ, ನಂತರ ನಗರದಲ್ಲಿ ಭೋಜನ\n\nಸ್ಥಳಗಳ ನಡುವೆ 45-60 ನಿಮಿಷದ ಬಿಡುವು ಇಡಿ.\n\n**ರಾಜಮರ್ಯಾದೆಯ ಸ್ಪರ್ಶ:** ದಿನಾಂಕ ಸರಿಯಾಗಿದ್ದರೆ ಅರಮನೆಯ ಬೆಳಕು ಅಲಂಕಾರದಿಂದ ದಿನ ಮುಗಿಸಿ.`;
    }
    if (isChamundi) {
      return `**ಚಾಮುಂಡಿ ಬೆಟ್ಟಕ್ಕೆ** ಬೆಳಿಗ್ಗೆ ಬೇಗ ಅಥವಾ ಸೂರ್ಯಾಸ್ತದ ಸಮಯದಲ್ಲಿ ಹೋಗುವುದು ಉತ್ತಮ. ಚಾಮುಂಡೇಶ್ವರಿ ದೇವಾಲಯಕ್ಕೆ ಭೇಟಿ ನೀಡಿ, ದಾರಿಯಲ್ಲಿ ದೊಡ್ಡ ನಂದಿ ಪ್ರತಿಮೆಯ ಬಳಿ ನಿಲ್ಲಿ, ಮತ್ತು ನೀರು ತೆಗೆದುಕೊಂಡು ಹೋಗಿ.\n\n**ರಾಜಮರ್ಯಾದೆಯ ಸ್ಪರ್ಶ:** ಸಂಜೆ ಹೊತ್ತಿನಲ್ಲಿ ಕೆಳಗಿನ ಮೈಸೂರು ನಗರ ದೀಪಗಳು ಕಾಣುವಾಗ ಫೋಟೋಗಳು ಅತ್ಯಂತ ಸುಂದರವಾಗುತ್ತವೆ.`;
    }
    if (isPalace) {
      return `**ಮೈಸೂರು ಅರಮನೆ** ನಗರದ ಅತ್ಯಂತ ರಾಜಮರ್ಯಾದೆಯ ತಾಣ. ಒಳಾಂಗಣ ಮತ್ತು ವಾಸ್ತುಶಿಲ್ಪಕ್ಕಾಗಿ ಹಗಲಿನಲ್ಲಿ ಭೇಟಿ ನೀಡಿ; ಭಾನುವಾರ ಅಥವಾ ಹಬ್ಬದ ದಿನಗಳಲ್ಲಿ ಬೆಳಕು ಅಲಂಕಾರವನ್ನು ಪರಿಶೀಲಿಸಿ.\n\nಹತ್ತಿರದ **ದೇವರಾಜ ಮಾರುಕಟ್ಟೆ** ಅಥವಾ **ಜಗನ್ಮೋಹನ ಅರಮನೆ** ಜೊತೆ ಸೇರಿಸಿದರೆ ಪಾರಂಪರಿಕ ಮಾರ್ಗ ಇನ್ನಷ್ಟು ಸೊಗಸಾಗುತ್ತದೆ.\n\n**ರಾಜಮರ್ಯಾದೆಯ ಸ್ಪರ್ಶ:** ಜನಸಂದಣಿ ಹೆಚ್ಚಾಗುವ ಮೊದಲು ಸ್ವಲ್ಪ ಬೇಗ ತಲುಪಿ.`;
    }
    if (isEmergency) {
      return `ಮೈಸೂರಿನಲ್ಲಿ ತುರ್ತು ಸಹಾಯಕ್ಕಾಗಿ:\n\n- **ಪೊಲೀಸ್:** 100\n- **ಆಂಬುಲೆನ್ಸ್:** 108\n- **ಪರ್ಯಟನ ಸಹಾಯವಾಣಿ:** 1363\n\nತುರ್ತು ಪರಿಸ್ಥಿತಿಯಲ್ಲಿ ಮೊದಲು ಸರಿಯಾದ ಸಂಖ್ಯೆಗೆ ಕರೆ ಮಾಡಿ, ನಂತರ ಹೋಟೆಲ್ ಸಿಬ್ಬಂದಿ ಅಥವಾ ಹತ್ತಿರದ ಪೊಲೀಸರಿಂದ ಸ್ಥಳೀಯ ಸಹಾಯ ಪಡೆಯಿರಿ.`;
    }
    return `ಗೌರವಾನ್ವಿತ ಅತಿಥಿಯೇ, ಮೈಸೂರನ್ನು ರಾಜಮರ್ಯಾದೆಯ ಸ್ಥಳೀಯ ಮಾರ್ಗದರ್ಶನದೊಂದಿಗೆ ಯೋಜಿಸಲು ನಾನು ಸಿದ್ಧನಿದ್ದೇನೆ. **ಮೈಸೂರು ಅರಮನೆ** ಯಿಂದ ಬೆಳಿಗ್ಗೆ ಆರಂಭಿಸಿ; ಜನಸಂದಣಿ ಕಡಿಮೆ ಇರುತ್ತದೆ. ನಂತರ ದೇವರಾಜ ಮಾರುಕಟ್ಟೆಯಲ್ಲಿ ರೇಷ್ಮೆ, ಹೂವು, ಚಂದನ ಮತ್ತು ಮೈಸೂರಿನ ನಿಜವಾದ ಬಣ್ಣಗಳನ್ನು ಅನುಭವಿಸಿ.\n\n**ರಾಜಮರ್ಯಾದೆಯ ಸ್ಪರ್ಶ:** ಭಾನುವಾರ ಅಥವಾ ಹಬ್ಬದ ದಿನವಾಗಿದ್ದರೆ ಅರಮನೆಯ ಬೆಳಕು ಅಲಂಕಾರವನ್ನು ತಪ್ಪಿಸಿಕೊಳ್ಳಬೇಡಿ.`;
  }

  if (language === "Hindi") {
    if (isFood) {
      return `आदरणीय अतिथि, मैसूर की स्वाद यात्रा **मैसूर मसाला डोसा**, **फिल्टर कॉफी**, और गरम **मैसूर पाक** से शुरू कीजिए.\n\n- **सुबह:** पारंपरिक दक्षिण भारतीय नाश्ता\n- **दोपहर:** स्थानीय थाली या हल्का भोजन\n- **शाम:** महल क्षेत्र के पास मिठाई और कॉफी\n\n**शाही स्पर्श:** किसी भरोसेमंद दुकान से मैसूर पाक या चंदन की छोटी यादगार साथ ले जाइए।`;
    }
    if (isPlan) {
      return `आदरणीय अतिथि, मैसूर के लिए एक सुंदर एक-दिवसीय योजना:\n\n- **सुबह:** मैसूर पैलेस और देवराजा मार्केट\n- **दोपहर:** सेंट फिलोमेना चर्च या मैसूर ज़ू\n- **शाम:** चामुंडी हिल व्यूपॉइंट, फिर शहर में डिनर\n\nहर जगह के बीच 45-60 मिनट का बफर रखें.\n\n**शाही स्पर्श:** अगर तारीख सही हो, तो दिन का अंत पैलेस इल्यूमिनेशन के साथ कीजिए।`;
    }
    if (isChamundi) {
      return `**चामुंडी हिल** के लिए सुबह जल्दी या सूर्यास्त के समय जाना बेहतर है. चामुंडेश्वरी मंदिर जाएं, रास्ते में बड़े नंदी प्रतिमा पर रुकें, और पानी साथ रखें.\n\n**शाही स्पर्श:** शाम के समय नीचे चमकते मैसूर शहर के साथ तस्वीरें बेहद सुंदर आती हैं।`;
    }
    if (isPalace) {
      return `**मैसूर पैलेस** शहर का सबसे शाही आकर्षण है. अंदरूनी हिस्सों और वास्तुकला के लिए दिन में जाएं; रविवार या त्योहारों पर illumination schedule जरूर जांचें.\n\nइसे पास के **देवराजा मार्केट** या **जगनमोहन पैलेस** के साथ जोड़ें तो विरासत यात्रा और सुंदर बनती है.\n\n**शाही स्पर्श:** भीड़ बढ़ने से पहले थोड़ा जल्दी पहुंचें।`;
    }
    if (isEmergency) {
      return `मैसूर में तुरंत सहायता के लिए:\n\n- **पुलिस:** 100\n- **एम्बुलेंस:** 108\n- **पर्यटन हेल्पलाइन:** 1363\n\nअगर स्थिति आपातकालीन है, पहले सही नंबर पर कॉल करें, फिर होटल स्टाफ या नजदीकी पुलिस से स्थानीय सहायता लें।`;
    }
    return `आदरणीय अतिथि, मैं मैसूर को शाही स्थानीय अंदाज़ में प्लान करने में आपकी मदद कर सकता हूं. शुरुआत **मैसूर पैलेस** से सुबह कीजिए, जब भीड़ कम होती है. फिर देवराजा मार्केट में रेशम, फूल, चंदन और मैसूर का असली रंग महसूस कीजिए.\n\n**शाही स्पर्श:** रविवार या त्योहार के दिन पैलेस illumination देखने का मौका न छोड़ें।`;
  }

  if (isFood) {
    return `A fine Mysuru feast should begin with **Mysore masala dosa**, **filter coffee**, and a warm piece of **Mysore Pak**. Choose a classic South Indian breakfast spot in the morning, then reserve the evening for a heritage hotel meal or a local thali.\n\n**Royal touch:** carry home sweets or sandalwood from a trusted local store as a small Mysuru keepsake.`;
  }
  if (isPlan) {
    return `Here is a graceful one-day Mysuru plan:\n\n- **Morning:** Mysore Palace and Devaraja Market\n- **Afternoon:** St. Philomena's Cathedral or Mysore Zoo\n- **Evening:** Chamundi Hill viewpoint, then dinner in the city\n\nKeep 45-60 minutes of buffer between places because traffic near the palace area can slow down.\n\n**Royal touch:** end the day with palace illumination if your date matches the schedule.`;
  }
  if (isChamundi) {
    return `For **Chamundi Hill**, go early morning or around sunset. Visit Chamundeshwari Temple, stop at the large Nandi statue on the way, and carry water. If you are short on time, take a cab or auto up and spend your walking time around the viewpoint.\n\n**Royal touch:** plan your photos when the city lights begin to glow below the hill.`;
  }
  if (isPalace) {
    return `**Mysore Palace** is the signature Mysuru stop, honored guest. Visit during the day for the interiors and architecture, and check local schedules for illumination in the evening. Pair it with nearby Devaraja Market or Jaganmohan Palace if you want a heritage-heavy route.\n\n**Royal touch:** arrive a little early so the palace facade is yours to admire before the crowd thickens.`;
  }
  if (isEmergency) {
    return `For urgent help in Mysuru:\n\n- **Police:** 100\n- **Ambulance:** 108\n- **Tourism helpline:** 1363\n\nIf it is an immediate emergency, call the relevant number first, then ask nearby hotel staff or local police for location-specific help.`;
  }
  return `Welcome, honored guest. I can help you plan Mysuru with a royal local touch. Begin with **Mysore Palace** in the morning for calmer crowds, then keep the evening open for the palace illumination on Sundays and public holidays.\n\n**Royal touch:** pair it with Devaraja Market for silk, flowers, sandalwood, and a very Mysuru atmosphere.`;
}

function buildLocalizedFallbackResponse(content: string, language: SupportedLanguage = "English") {
  const query = content.toLowerCase();
  const isFood = hasAny(query, ["food", "eat", "restaurant", "mysore pak", "dosa", "breakfast", "lunch", "dinner"]);
  const isPlan = hasAny(query, ["itinerary", "day", "plan", "route", "trip"]);
  const isChamundi = hasAny(query, ["chamundi", "hill"]);
  const isPalace = hasAny(query, ["palace", "royal", "heritage"]) || /[\u0C80-\u0CFF\u0900-\u097F]/.test(content);
  const isEmergency = hasAny(query, ["emergency", "help", "police", "hospital", "ambulance"]);

  if (language === "Kannada") {
    if (isFood) {
      return "\u0c97\u0ccc\u0cb0\u0cb5\u0cbe\u0ca8\u0ccd\u0cb5\u0cbf\u0ca4 \u0c85\u0ca4\u0cbf\u0ca5\u0cbf\u0caf\u0cc7, \u0cae\u0cc8\u0cb8\u0cc2\u0cb0\u0cbf\u0ca8 \u0cb0\u0cc1\u0c9a\u0cbf \u0caa\u0ccd\u0cb0\u0caf\u0cbe\u0ca3\u0cb5\u0ca8\u0ccd\u0ca8\u0cc1 **\u0cae\u0cc8\u0cb8\u0cc2\u0cb0\u0cc1 \u0cae\u0cb8\u0cbe\u0cb2\u0cc6 \u0ca6\u0ccb\u0cb8\u0cc6**, **\u0cab\u0cbf\u0cb2\u0ccd\u0c9f\u0cb0\u0ccd \u0c95\u0cbe\u0cab\u0cbf**, \u0cae\u0ca4\u0ccd\u0ca4\u0cc1 **\u0cae\u0cc8\u0cb8\u0cc2\u0cb0\u0cc1 \u0caa\u0cbe\u0c95\u0ccd** \u0ca8\u0cbf\u0c82\u0ca6 \u0c86\u0cb0\u0c82\u0cad\u0cbf\u0cb8\u0cbf.\n\n**\u0cb0\u0cbe\u0c9c\u0cae\u0cb0\u0ccd\u0caf\u0cbe\u0ca6\u0cc6\u0caf \u0cb8\u0ccd\u0caa\u0cb0\u0ccd\u0cb6:** \u0ca8\u0c82\u0cac\u0cbf\u0c95\u0cc6\u0caf \u0c85\u0c82\u0c97\u0ca1\u0cbf\u0caf\u0cbf\u0c82\u0ca6 \u0cae\u0cc8\u0cb8\u0cc2\u0cb0\u0cc1 \u0caa\u0cbe\u0c95\u0ccd \u0c85\u0ca5\u0cb5\u0cbe \u0c9a\u0c82\u0ca6\u0ca8\u0ca6 \u0cb8\u0ccd\u0cae\u0cb0\u0ca3\u0cbf\u0c95\u0cc6 \u0ca4\u0cc6\u0c97\u0cc6\u0ca6\u0cc1\u0c95\u0cca\u0c82\u0ca1\u0cc1 \u0cb9\u0ccb\u0c97\u0cbf.";
    }
    if (isPlan) {
      return "\u0c97\u0ccc\u0cb0\u0cb5\u0cbe\u0ca8\u0ccd\u0cb5\u0cbf\u0ca4 \u0c85\u0ca4\u0cbf\u0ca5\u0cbf\u0caf\u0cc7, \u0cae\u0cc8\u0cb8\u0cc2\u0cb0\u0cbf\u0c97\u0cc6 \u0cb8\u0cc1\u0c82\u0ca6\u0cb0 \u0c92\u0c82\u0ca6\u0cc1 \u0ca6\u0cbf\u0ca8\u0ca6 \u0caf\u0ccb\u0c9c\u0ca8\u0cc6:\n\n- **\u0cac\u0cc6\u0cb3\u0c97\u0ccd\u0c97\u0cc6:** \u0cae\u0cc8\u0cb8\u0cc2\u0cb0\u0cc1 \u0c85\u0cb0\u0cae\u0ca8\u0cc6 \u0cae\u0ca4\u0ccd\u0ca4\u0cc1 \u0ca6\u0cc7\u0cb5\u0cb0\u0cbe\u0c9c \u0cae\u0cbe\u0cb0\u0cc1\u0c95\u0c9f\u0ccd\u0c9f\u0cc6\n- **\u0cae\u0ca7\u0ccd\u0caf\u0cbe\u0cb9\u0ccd\u0ca8:** \u0cb8\u0c82\u0ca4 \u0cab\u0cbf\u0cb2\u0ccb\u0cae\u0cbf\u0ca8\u0cbe \u0c9a\u0cb0\u0ccd\u0c9a\u0ccd \u0c85\u0ca5\u0cb5\u0cbe \u0cae\u0cc8\u0cb8\u0cc2\u0cb0\u0cc1 \u0cae\u0cc3\u0c97\u0cbe\u0cb2\u0caf\n- **\u0cb8\u0c82\u0c9c\u0cc6:** \u0c9a\u0cbe\u0cae\u0cc1\u0c82\u0ca1\u0cbf \u0cac\u0cc6\u0c9f\u0ccd\u0c9f\u0ca6 \u0ca8\u0ccb\u0c9f, \u0ca8\u0c82\u0ca4\u0cb0 \u0ca8\u0c97\u0cb0\u0ca6\u0cb2\u0ccd\u0cb2\u0cbf \u0cad\u0ccb\u0c9c\u0ca8\n\n**\u0cb0\u0cbe\u0c9c\u0cae\u0cb0\u0ccd\u0caf\u0cbe\u0ca6\u0cc6\u0caf \u0cb8\u0ccd\u0caa\u0cb0\u0ccd\u0cb6:** \u0ca6\u0cbf\u0ca8\u0cbe\u0c82\u0c95 \u0cb8\u0cb0\u0cbf\u0caf\u0cbe\u0c97\u0cbf\u0ca6\u0ccd\u0ca6\u0cb0\u0cc6 \u0c85\u0cb0\u0cae\u0ca8\u0cc6\u0caf \u0cac\u0cc6\u0cb3\u0c95\u0cc1 \u0c85\u0cb2\u0c82\u0c95\u0cbe\u0cb0\u0ca6\u0cbf\u0c82\u0ca6 \u0ca6\u0cbf\u0ca8 \u0cae\u0cc1\u0c97\u0cbf\u0cb8\u0cbf.";
    }
    if (isChamundi) {
      return "**\u0c9a\u0cbe\u0cae\u0cc1\u0c82\u0ca1\u0cbf \u0cac\u0cc6\u0c9f\u0ccd\u0c9f\u0c95\u0ccd\u0c95\u0cc6** \u0cac\u0cc6\u0cb3\u0cbf\u0c97\u0ccd\u0c97\u0cc6 \u0cac\u0cc7\u0c97 \u0c85\u0ca5\u0cb5\u0cbe \u0cb8\u0cc2\u0cb0\u0ccd\u0caf\u0cbe\u0cb8\u0ccd\u0ca4\u0ca6 \u0cb8\u0cae\u0caf\u0ca6\u0cb2\u0ccd\u0cb2\u0cbf \u0cb9\u0ccb\u0c97\u0cc1\u0cb5\u0cc1\u0ca6\u0cc1 \u0c89\u0ca4\u0ccd\u0ca4\u0cae. \u0c9a\u0cbe\u0cae\u0cc1\u0c82\u0ca1\u0cc7\u0cb6\u0ccd\u0cb5\u0cb0\u0cbf \u0ca6\u0cc7\u0cb5\u0cbe\u0cb2\u0caf\u0c95\u0ccd\u0c95\u0cc6 \u0cad\u0cc7\u0c9f\u0cbf \u0ca8\u0cc0\u0ca1\u0cbf, \u0ca8\u0cc0\u0cb0\u0cc1 \u0ca4\u0cc6\u0c97\u0cc6\u0ca6\u0cc1\u0c95\u0cca\u0c82\u0ca1\u0cc1 \u0cb9\u0ccb\u0c97\u0cbf.\n\n**\u0cb0\u0cbe\u0c9c\u0cae\u0cb0\u0ccd\u0caf\u0cbe\u0ca6\u0cc6\u0caf \u0cb8\u0ccd\u0caa\u0cb0\u0ccd\u0cb6:** \u0cb8\u0c82\u0c9c\u0cc6 \u0cb9\u0cca\u0ca4\u0ccd\u0ca4\u0cbf\u0ca8\u0cb2\u0ccd\u0cb2\u0cbf \u0c95\u0cc6\u0cb3\u0c97\u0cbf\u0ca8 \u0cae\u0cc8\u0cb8\u0cc2\u0cb0\u0cc1 \u0ca8\u0c97\u0cb0 \u0ca6\u0cc0\u0caa\u0c97\u0cb3\u0cc1 \u0c85\u0ca4\u0ccd\u0caf\u0c82\u0ca4 \u0cb8\u0cc1\u0c82\u0ca6\u0cb0\u0cb5\u0cbe\u0c97\u0cbf \u0c95\u0cbe\u0ca3\u0cc1\u0ca4\u0ccd\u0ca4\u0cb5\u0cc6.";
    }
    if (isEmergency) {
      return "\u0cae\u0cc8\u0cb8\u0cc2\u0cb0\u0cbf\u0ca8\u0cb2\u0ccd\u0cb2\u0cbf \u0ca4\u0cc1\u0cb0\u0ccd\u0ca4\u0cc1 \u0cb8\u0cb9\u0cbe\u0caf\u0c95\u0ccd\u0c95\u0cbe\u0c97\u0cbf:\n\n- **\u0caa\u0cca\u0cb2\u0cc0\u0cb8\u0ccd:** 100\n- **\u0c86\u0c82\u0cac\u0cc1\u0cb2\u0cc6\u0ca8\u0ccd\u0cb8\u0ccd:** 108\n- **\u0caa\u0cb0\u0ccd\u0caf\u0c9f\u0ca8 \u0cb8\u0cb9\u0cbe\u0caf\u0cb5\u0cbe\u0ca3\u0cbf:** 1363\n\n\u0ca4\u0cc1\u0cb0\u0ccd\u0ca4\u0cc1 \u0caa\u0cb0\u0cbf\u0cb8\u0ccd\u0ca5\u0cbf\u0ca4\u0cbf\u0caf\u0cb2\u0ccd\u0cb2\u0cbf \u0cae\u0cca\u0ca6\u0cb2\u0cc1 \u0cb8\u0cb0\u0cbf\u0caf\u0cbe\u0ca6 \u0cb8\u0c82\u0c96\u0ccd\u0caf\u0cc6\u0c97\u0cc6 \u0c95\u0cb0\u0cc6 \u0cae\u0cbe\u0ca1\u0cbf.";
    }
    return "**\u0cae\u0cc8\u0cb8\u0cc2\u0cb0\u0cc1 \u0c85\u0cb0\u0cae\u0ca8\u0cc6** \u0ca8\u0c97\u0cb0\u0ca6 \u0c85\u0ca4\u0ccd\u0caf\u0c82\u0ca4 \u0cb0\u0cbe\u0c9c\u0cae\u0cb0\u0ccd\u0caf\u0cbe\u0ca6\u0cc6\u0caf \u0ca4\u0cbe\u0ca3. \u0cb9\u0c97\u0cb2\u0cbf\u0ca8\u0cb2\u0ccd\u0cb2\u0cbf \u0cad\u0cc7\u0c9f\u0cbf \u0ca8\u0cc0\u0ca1\u0cbf; \u0cad\u0cbe\u0ca8\u0cc1\u0cb5\u0cbe\u0cb0 \u0c85\u0ca5\u0cb5\u0cbe \u0cb9\u0cac\u0ccd\u0cac\u0ca6 \u0ca6\u0cbf\u0ca8\u0c97\u0cb3\u0cb2\u0ccd\u0cb2\u0cbf \u0cac\u0cc6\u0cb3\u0c95\u0cc1 \u0c85\u0cb2\u0c82\u0c95\u0cbe\u0cb0\u0cb5\u0ca8\u0ccd\u0ca8\u0cc1 \u0caa\u0cb0\u0cbf\u0cb6\u0cc0\u0cb2\u0cbf\u0cb8\u0cbf.\n\n**\u0cb0\u0cbe\u0c9c\u0cae\u0cb0\u0ccd\u0caf\u0cbe\u0ca6\u0cc6\u0caf \u0cb8\u0ccd\u0caa\u0cb0\u0ccd\u0cb6:** \u0c9c\u0ca8\u0cb8\u0c82\u0ca6\u0ca3\u0cbf \u0cb9\u0cc6\u0c9a\u0ccd\u0c9a\u0cbe\u0c97\u0cc1\u0cb5 \u0cae\u0cca\u0ca6\u0cb2\u0cc1 \u0cb8\u0ccd\u0cb5\u0cb2\u0ccd\u0caa \u0cac\u0cc7\u0c97 \u0ca4\u0cb2\u0cc1\u0caa\u0cbf.";
  }

  if (language === "Hindi") {
    if (isFood) {
      return "\u0906\u0926\u0930\u0923\u0940\u092f \u0905\u0924\u093f\u0925\u093f, \u092e\u0948\u0938\u0942\u0930 \u0915\u0940 \u0938\u094d\u0935\u093e\u0926 \u092f\u093e\u0924\u094d\u0930\u093e **\u092e\u0948\u0938\u0942\u0930 \u092e\u0938\u093e\u0932\u093e \u0921\u094b\u0938\u093e**, **\u092b\u093f\u0932\u094d\u091f\u0930 \u0915\u0949\u092b\u0940**, \u0914\u0930 **\u092e\u0948\u0938\u0942\u0930 \u092a\u093e\u0915** \u0938\u0947 \u0936\u0941\u0930\u0942 \u0915\u0940\u091c\u093f\u090f.\n\n**\u0936\u093e\u0939\u0940 \u0938\u094d\u092a\u0930\u094d\u0936:** \u0915\u093f\u0938\u0940 \u092d\u0930\u094b\u0938\u0947\u092e\u0902\u0926 \u0926\u0941\u0915\u093e\u0928 \u0938\u0947 \u092e\u0948\u0938\u0942\u0930 \u092a\u093e\u0915 \u092f\u093e \u091a\u0902\u0926\u0928 \u0915\u0940 \u091b\u094b\u091f\u0940 \u092f\u093e\u0926\u0917\u093e\u0930 \u0938\u093e\u0925 \u0932\u0947 \u091c\u093e\u0907\u090f.";
    }
    if (isPlan) {
      return "\u0906\u0926\u0930\u0923\u0940\u092f \u0905\u0924\u093f\u0925\u093f, \u092e\u0948\u0938\u0942\u0930 \u0915\u0947 \u0932\u093f\u090f \u090f\u0915 \u0938\u0941\u0902\u0926\u0930 \u090f\u0915-\u0926\u093f\u0935\u0938\u0940\u092f \u092f\u094b\u091c\u0928\u093e:\n\n- **\u0938\u0941\u092c\u0939:** \u092e\u0948\u0938\u0942\u0930 \u092a\u0948\u0932\u0947\u0938 \u0914\u0930 \u0926\u0947\u0935\u0930\u093e\u091c\u093e \u092e\u093e\u0930\u094d\u0915\u0947\u091f\n- **\u0926\u094b\u092a\u0939\u0930:** \u0938\u0947\u0902\u091f \u092b\u093f\u0932\u094b\u092e\u0947\u0928\u093e \u091a\u0930\u094d\u091a \u092f\u093e \u092e\u0948\u0938\u0942\u0930 \u091c\u093c\u0942\n- **\u0936\u093e\u092e:** \u091a\u093e\u092e\u0941\u0902\u0921\u0940 \u0939\u093f\u0932 \u0935\u094d\u092f\u0942\u092a\u0949\u0907\u0902\u091f, \u092b\u093f\u0930 \u0936\u0939\u0930 \u092e\u0947\u0902 \u0921\u093f\u0928\u0930\n\n**\u0936\u093e\u0939\u0940 \u0938\u094d\u092a\u0930\u094d\u0936:** \u0905\u0917\u0930 \u0924\u093e\u0930\u0940\u0916 \u0938\u0939\u0940 \u0939\u094b, \u0924\u094b \u0926\u093f\u0928 \u0915\u093e \u0905\u0902\u0924 \u092a\u0948\u0932\u0947\u0938 \u0907\u0932\u094d\u092f\u0942\u092e\u093f\u0928\u0947\u0936\u0928 \u0915\u0947 \u0938\u093e\u0925 \u0915\u0940\u091c\u093f\u090f.";
    }
    if (isChamundi) {
      return "**\u091a\u093e\u092e\u0941\u0902\u0921\u0940 \u0939\u093f\u0932** \u0915\u0947 \u0932\u093f\u090f \u0938\u0941\u092c\u0939 \u091c\u0932\u094d\u0926\u0940 \u092f\u093e \u0938\u0942\u0930\u094d\u092f\u093e\u0938\u094d\u0924 \u0915\u0947 \u0938\u092e\u092f \u091c\u093e\u0928\u093e \u092c\u0947\u0939\u0924\u0930 \u0939\u0948. \u091a\u093e\u092e\u0941\u0902\u0921\u0947\u0936\u094d\u0935\u0930\u0940 \u092e\u0902\u0926\u093f\u0930 \u091c\u093e\u090f\u0902 \u0914\u0930 \u092a\u093e\u0928\u0940 \u0938\u093e\u0925 \u0930\u0916\u0947\u0902.\n\n**\u0936\u093e\u0939\u0940 \u0938\u094d\u092a\u0930\u094d\u0936:** \u0936\u093e\u092e \u0915\u0947 \u0938\u092e\u092f \u0928\u0940\u091a\u0947 \u091a\u092e\u0915\u0924\u0947 \u092e\u0948\u0938\u0942\u0930 \u0936\u0939\u0930 \u0915\u0947 \u0938\u093e\u0925 \u0924\u0938\u094d\u0935\u0940\u0930\u0947\u0902 \u092c\u0947\u0939\u0926 \u0938\u0941\u0902\u0926\u0930 \u0906\u0924\u0940 \u0939\u0948\u0902.";
    }
    if (isEmergency) {
      return "\u092e\u0948\u0938\u0942\u0930 \u092e\u0947\u0902 \u0924\u0941\u0930\u0902\u0924 \u0938\u0939\u093e\u092f\u0924\u093e \u0915\u0947 \u0932\u093f\u090f:\n\n- **\u092a\u0941\u0932\u093f\u0938:** 100\n- **\u090f\u092e\u094d\u092c\u0941\u0932\u0947\u0902\u0938:** 108\n- **\u092a\u0930\u094d\u092f\u091f\u0928 \u0939\u0947\u0932\u094d\u092a\u0932\u093e\u0907\u0928:** 1363\n\n\u0906\u092a\u093e\u0924\u0915\u093e\u0932 \u092e\u0947\u0902 \u092a\u0939\u0932\u0947 \u0938\u0939\u0940 \u0928\u0902\u092c\u0930 \u092a\u0930 \u0915\u0949\u0932 \u0915\u0930\u0947\u0902.";
    }
    return "**\u092e\u0948\u0938\u0942\u0930 \u092a\u0948\u0932\u0947\u0938** \u0936\u0939\u0930 \u0915\u093e \u0938\u092c\u0938\u0947 \u0936\u093e\u0939\u0940 \u0906\u0915\u0930\u094d\u0937\u0923 \u0939\u0948. \u0905\u0902\u0926\u0930\u0942\u0928\u0940 \u0939\u093f\u0938\u094d\u0938\u094b\u0902 \u0914\u0930 \u0935\u093e\u0938\u094d\u0924\u0941\u0915\u0932\u093e \u0915\u0947 \u0932\u093f\u090f \u0926\u093f\u0928 \u092e\u0947\u0902 \u091c\u093e\u090f\u0902; \u0930\u0935\u093f\u0935\u093e\u0930 \u092f\u093e \u0924\u094d\u092f\u094b\u0939\u093e\u0930\u094b\u0902 \u092a\u0930 illumination schedule \u091c\u0930\u0942\u0930 \u091c\u093e\u0902\u091a\u0947\u0902.\n\n**\u0936\u093e\u0939\u0940 \u0938\u094d\u092a\u0930\u094d\u0936:** \u092d\u0940\u0921\u093c \u092c\u0922\u093c\u0928\u0947 \u0938\u0947 \u092a\u0939\u0932\u0947 \u0925\u094b\u0921\u093c\u093e \u091c\u0932\u094d\u0926\u0940 \u092a\u0939\u0941\u0902\u091a\u0947\u0902.";
  }

  return buildFallbackResponse(content, "English");
}

function responseNeedsLocalizedFallback(content: string, response: string, language: SupportedLanguage) {
  const asksAboutPalace = hasAny(content.toLowerCase(), ["palace", "mysore palace", "mysuru palace"]) || /(\u0c85\u0cb0\u0cae\u0ca8\u0cc6|\u092e\u0939\u0932|\u092a\u0948\u0932\u0947\u0938)/.test(content);
  const confusesPalaceWithTemple = asksAboutPalace && /Chamundeshwari Temple|Chamundi Temple|\u0c9a\u0cbe\u0cae\u0cc1\u0c82\u0ca1\u0cc7\u0cb6\u0ccd\u0cb5\u0cb0\u0cbf \u0ca6\u0cc7\u0cb5\u0cbe\u0cb2\u0caf|\u091a\u093e\u092e\u0941\u0902\u0921\u0947\u0936\u094d\u0935\u0930\u0940 \u092e\u0902\u0926\u093f\u0930/.test(response);

  if (language === "Kannada") {
    const hasKannada = /[\u0C80-\u0CFF]/.test(response);
    const hasOtherIndicScript = /[\u0900-\u097F\u0B80-\u0BFF\u0C00-\u0C7F\u0D00-\u0D7F]/.test(response);
    return !hasKannada || hasOtherIndicScript || confusesPalaceWithTemple;
  }

  if (language === "Hindi") {
    const hasHindi = /[\u0900-\u097F]/.test(response);
    const hasOtherIndicScript = /[\u0C80-\u0CFF\u0B80-\u0BFF\u0C00-\u0C7F\u0D00-\u0D7F]/.test(response);
    return !hasHindi || hasOtherIndicScript || confusesPalaceWithTemple;
  }

  return confusesPalaceWithTemple;
}

export function registerChatRoutes(app: Express): void {
  // Get all conversations
  app.get("/api/conversations", async (req: Request, res: Response) => {
    try {
      const conversations = await chatStorage.getAllConversations();
      res.json(conversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ error: "Failed to fetch conversations" });
    }
  });

  // Get single conversation with messages
  app.get("/api/conversations/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
      const conversation = await chatStorage.getConversation(id);
      if (!conversation) {
        return res.status(404).json({ error: "Conversation not found" });
      }
      const messages = await chatStorage.getMessagesByConversation(id);
      res.json({ ...conversation, messages });
    } catch (error) {
      console.error("Error fetching conversation:", error);
      res.status(500).json({ error: "Failed to fetch conversation" });
    }
  });

  // Create new conversation
  app.post("/api/conversations", async (req: Request, res: Response) => {
    try {
      const { title } = req.body;
      const conversation = await chatStorage.createConversation(title || "New Chat");
      res.status(201).json(conversation);
    } catch (error) {
      console.error("Error creating conversation:", error);
      res.status(500).json({ error: "Failed to create conversation" });
    }
  });

  // Delete conversation
  app.delete("/api/conversations/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
      await chatStorage.deleteConversation(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting conversation:", error);
      res.status(500).json({ error: "Failed to delete conversation" });
    }
  });

  // Send message and get AI response (streaming)
  app.post("/api/conversations/:id/messages", async (req: Request, res: Response) => {
    try {
      const conversationId = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
      const { content, language = "Auto" } = req.body;
      const messageContent = typeof content === "string" ? content.trim() : "";
      const replyLanguage = resolveReplyLanguage(language, messageContent);

      if (!Number.isInteger(conversationId) || conversationId < 1) {
        return res.status(400).json({ error: "Invalid conversation id" });
      }

      if (!messageContent) {
        return res.status(400).json({ error: "Message content is required" });
      }

      const conversation = await chatStorage.getConversation(conversationId);
      if (!conversation) {
        return res.status(404).json({ error: "Conversation not found" });
      }

      // Save user message
      await chatStorage.createMessage(conversationId, "user", messageContent);

      // Get conversation history for context
      const messages = await chatStorage.getMessagesByConversation(conversationId);
      const chatMessages = messages.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      }));

      // Set up SSE
      res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      // Stream response from Gemini
      const chat = model.startChat({
        history: chatMessages.slice(0, -1).map(m => ({
          role: m.role === "user" ? "user" : "model",
          parts: [{ text: m.content }],
        })),
        systemInstruction: {
          role: "system",
              parts: [{ text: `You are NammaMysuru.ai, a royal Mysuru concierge and highly helpful AI guide to Mysuru (Mysore), Karnataka, India.
Your goal is to make every visitor feel welcomed, respected, and personally guided while providing accurate, engaging, and informative responses about Mysuru's tourist attractions, local culture, rich history, food, transportation, safety, and weather.
Follow these guidelines:
1. Be warm, polished, and gracious. Make the user feel like an honored guest, but avoid exaggerated old-fashioned language.
2. Provide clear, concise, and structured answers. Use Markdown with bold labels, short bullets, and short paragraphs for readability.
3. Highlight unique aspects of Mysuru, such as its heritage, the Wodeyar dynasty, Dasara festival, silk, sandalwood, and local cuisine.
4. If a user asks about topics unrelated to tourism or Mysuru, politely steer the conversation back to how you can help them explore Mysuru.
5. Provide actionable advice: timings, routes, buffers, nearby places, food pairings, photo moments, and safety tips when useful.
6. Add a brief "Royal touch" suggestion when it improves the answer, such as a scenic finish, heritage detail, silk/sandalwood stop, or quiet photo time.
7. End with one helpful next-step question when the user may need personalization.
8. ${languageInstructions[replyLanguage]}
9. If the user's message is in a different language than the selected reply language, still answer in the selected reply language.
10. Never say you cannot answer in Kannada or Hindi; translate and localize the travel guidance naturally.
11. Never mix Tamil, Telugu, Malayalam, or Devanagari script into Kannada replies. Never mix Kannada, Tamil, Telugu, or Malayalam script into Hindi replies.
12. Factual guardrail: Mysuru Palace is also called Amba Vilas Palace. It is not Chamundeshwari Temple. Chamundeshwari Temple is on Chamundi Hill.
The current system time is ${new Date().toString()}. Use this as reference for "now". For specific locations, use the getTime tool.` }]
        },
        tools: [
          ...tools,
          {
            functionDeclarations: [
              {
                name: "getTime",
                description: "Get the current local time for a specific location",
                parameters: {
                  type: SchemaType.OBJECT,
                  properties: {
                    location: {
                      type: SchemaType.STRING,
                      description: "The city and state, e.g. Mysuru, Karnataka",
                    },
                  },
                  required: ["location"],
                },
              },
            ],
          }
        ] as any,
      });

      let fullResponse = "";
      let functionCallFound = null;
      const shouldBufferResponse = replyLanguage !== "English";
      let wroteResponse = false;

      try {
        const modelInput = `Selected reply language: ${replyLanguage}\n\nUser question:\n${messageContent}`;
        let result = await chat.sendMessageStream(modelInput);

        for await (const chunk of result.stream) {
          const text = chunk.text();
          if (text) {
            fullResponse += text;
            if (!shouldBufferResponse) {
              wroteResponse = true;
              res.write(`data: ${JSON.stringify({ content: text })}\n\n`);
            }
          }

          // Check for function calls
          const functionCalls = chunk.functionCalls();
          if (functionCalls && functionCalls.length > 0) {
            functionCallFound = functionCalls[0];
            break; // Stop streaming current response if we need to call a function
          }
        }

        // If a tool was called, execute it and continue the conversation
        if (functionCallFound) {
          if (functionCallFound.name === "getWeather") {
            const args = functionCallFound.args as { location: string };
            const weatherData = await getWeather(args.location);

            // Send function response
            const functionResponse = [{
              functionResponse: {
                name: "getWeather",
                response: { name: "getWeather", content: { weatherData } }
              }
            }];

            const nextResult = await chat.sendMessageStream(functionResponse);

            for await (const chunk of nextResult.stream) {
              const text = chunk.text();
              if (text) {
                fullResponse += text;
                if (!shouldBufferResponse) {
                  wroteResponse = true;
                  res.write(`data: ${JSON.stringify({ content: text })}\n\n`);
                }
              }
            }
          } else if (functionCallFound.name === "getTime") {
            const args = functionCallFound.args as { location: string };
            const timeData = await getTime(args.location);

            // Send function response
            const functionResponse = [{
              functionResponse: {
                name: "getTime",
                response: { name: "getTime", content: { timeData } }
              }
            }];

            const nextResult = await chat.sendMessageStream(functionResponse);

            for await (const chunk of nextResult.stream) {
              const text = chunk.text();
              if (text) {
                fullResponse += text;
                if (!shouldBufferResponse) {
                  wroteResponse = true;
                  res.write(`data: ${JSON.stringify({ content: text })}\n\n`);
                }
              }
            }
          }
        }
      } catch (aiError) {
        console.error("Gemini chat failed, using fallback response:", aiError);
        fullResponse = buildLocalizedFallbackResponse(messageContent, replyLanguage);
        wroteResponse = true;
        res.write(`data: ${JSON.stringify({ content: fullResponse })}\n\n`);
      }

      if (shouldBufferResponse && !wroteResponse) {
        if (responseNeedsLocalizedFallback(messageContent, fullResponse, replyLanguage)) {
          fullResponse = buildLocalizedFallbackResponse(messageContent, replyLanguage);
        }

        wroteResponse = true;
        res.write(`data: ${JSON.stringify({ content: fullResponse })}\n\n`);
      }

      // Save assistant message
      await chatStorage.createMessage(conversationId, "assistant", fullResponse);

      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
    } catch (error) {
      console.error("Error sending message:", error);
      // Check if headers already sent (SSE streaming started)
      if (res.headersSent) {
        res.write(`data: ${JSON.stringify({ error: "Failed to send message" })}\n\n`);
        res.end();
      } else {
        res.status(500).json({ error: "Failed to send message" });
      }
    }
  });
}
