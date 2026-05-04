const treatmentTranslations = {
  en: {
    'Algal Leaf Spot': {
      organic: [
        'Prune and destroy infected leaves and shoots',
        'Improve air circulation by reducing shade',
        'Apply copper-based organic fungicide in early morning'
      ],
      chemical: [
        'Spray Copper oxychloride / Copper hydroxide / Bordeaux mixture',
        'Ensure full leaf coverage during spraying'
      ]
    },
    'Brown Blight': {
      organic: [
        'Remove and destroy infected leaves',
        'Reduce humidity by proper spacing and pruning',
        'Use neem-based fungicide if available'
      ],
      chemical: [
        'Spray Mancozeb / Carbendazim / Thiophanate-methyl',
        'Repeat every 7–10 days'
      ]
    },
    'Gray Blight': {
      organic: [
        'Prune affected parts',
        'Improve sunlight penetration and airflow',
        'Apply copper-based fungicide'
      ],
      chemical: [
        'Spray Hexaconazole / Propiconazole',
        'Alternative: Azoxystrobin / Copper fungicide'
      ]
    },
    'Healthy': {
      organic: ['Maintain proper field hygiene and plant care'],
      chemical: ['No treatment required']
    },
    'Helopeltis': {
      organic: [
        'Remove infested shoots',
        'Spray Neem oil (Azadirachtin)',
        'Encourage natural predators'
      ],
      chemical: [
        'Spray Imidacloprid / Thiamethoxam',
        'Alternative: Lambda-cyhalothrin'
      ]
    },
    'Red Leaf Spot': {
      organic: [
        'Remove infected leaves',
        'Improve air circulation',
        'Apply copper-based fungicide'
      ],
      chemical: [
        'Spray Chlorothalonil / Mancozeb / Carbendazim',
        'Ensure proper spray coverage'
      ]
    }
  },
  si: {
    'Algal Leaf Spot': {
      organic: [
        'ආසාද පත්‍ර සහ කොළ කපා නිෂ්පාදනය කරන්න',
        'සෙවණ අඩු කිරීමෙන් වාතාශ්‍රිත සංසරණ වැඩි කරන්න',
        'පෙර උදෑසනින් තඹ පාදක ජෛව විෂ නිර්මාණ ශ්‍රිතය සිතුවම්',
        'සම්පූර්ණ පත්‍ර කවරයන් ඉතුරු කරන්න'
      ],
      chemical: [
        'තඹ oxychloride / තඹ hydroxide / Bordeaux මිශ්‍රණ छිදවන්න',
        'ස්‍රිතයේ වේලාවට සම්පූර්ණ පත්‍ර ආවරණ සහතික කරන්න'
      ]
    },
    'Brown Blight': {
      organic: [
        'ආසාද පත්‍ර ඉවත් කර විනාශ කරන්න',
        'නිසි දුරස්‍තානයි සහ කපා කිරීමෙන් ආර්ද්‍රතා අඩු කරන්න',
        'නීම් පාදක පෙර කිරීම් පදනම් ඉතුරු කරන්න'
      ],
      chemical: [
        'Mancozeb / Carbendazim / Thiophanate-methyl ස්‍රිතයේ',
        '7–10 දින විතර පුනරාවර්තනය කරන්න'
      ]
    },
    'Gray Blight': {
      organic: [
        'බලපෑමට ලක්වූ කොටස් කපා දමන්න',
        'සූර්ය කිරණ ඇතුළුවීම සහ වායු ප්‍රවාහ වැඩි කරන්න',
        'තඹ පාදක පෙර කිරීම ශ්‍රිතය යොදන්න'
      ],
      chemical: [
        'Hexaconazole / Propiconazole ස්‍රිතයේ',
        'විකල්පය: Azoxystrobin / තඹ පෙර කිරීම'
      ]
    },
    'Healthy': {
      organic: ['නිසි ක්ෂේත්‍ර සtisztាකාරය සහ ශාකමාතा පිපිරිම පවත්වා ගන්න'],
      chemical: ['ප්‍රතිකාර අවශ්‍ය නොවේ']
    },
    'Helopeltis': {
      organic: [
        'ආසාද පිටි ඉවත් කරන්න',
        'නීම් තෙල් (Azadirachtin) ස්‍රිතයේ',
        'ස්වාභාවික විසි දෙයින්ගේ දෙමාපිය කරන්න'
      ],
      chemical: [
        'Imidacloprid / Thiamethoxam ස්‍රිතයේ',
        'විකල්පය: Lambda-cyhalothrin'
      ]
    },
    'Red Leaf Spot': {
      organic: [
        'ආසාද පත්‍ර ඉවත් කරන්න',
        'වායු සංසරණ වැඩි කරන්න',
        'තඹ පාදක පෙර කිරීම ශ්‍රිතය යොදන්න'
      ],
      chemical: [
        'Chlorothalonil / Mancozeb / Carbendazim ස්‍රිතයේ',
        'නිසි ස්‍රිතයේ ආවරණ සහතික කරන්න'
      ]
    }
  },
  ta: {
    'Algal Leaf Spot': {
      organic: [
        'பாதிக்கப்பட்ட இலைகள் மற்றும் தளிர்களை அறுவடை செய்யவும்',
        'நிழல் குறைப்பதன் மூலம் வாயு சுழற்சியை மேம்படுத்தவும்',
        'காலை சீக்கிரம் செப்பு அடிப்படையிலான கரிம பூச்சிக்கொல்லி பயன்படுத்தவும்'
      ],
      chemical: [
        'செப்பு ஆக்சிক்লோரைடு / செப்பு ஹைட்रોக்சைடு / போர்டோக்ஸ் கலவை தெளிக்கவும்',
        'தெளிப்பின் போது முழு இலை அட்டையை உறுதிப்படுத்தவும்'
      ]
    },
    'Brown Blight': {
      organic: [
        'பாதிக்கப்பட்ட இலைகளை அகற்றி அழிக்கவும்',
        'சரியான இடைவெளி மற்றும் கத்தरை மூலம் ஈரப்பதம் குறைக்கவும்',
        'கிடைக்கிற முகவாய் அடிப்படை பூச்சிக்கொல்லி பயன்படுத்தவும்'
      ],
      chemical: [
        'Mancozeb / Carbendazim / Thiophanate-methyl தெளிக்கவும்',
        '7–10 நாட்களுக்கு மீண்டும் செய்யவும்'
      ]
    },
    'Gray Blight': {
      organic: [
        'பாதிக்கப்பட்ட பகுதிகளை அறுவடை செய்யவும்',
        'சூரிய ஒளி ஊடுருவல் மற்றும் வாயு ஓட்டத்தை மேம்படுத்தவும்',
        'செப்பு அடிப்படையிலான பூச்சிக்கொல்லி பயன்படுத்தவும்'
      ],
      chemical: [
        'Hexaconazole / Propiconazole தெளிக்கவும்',
        'மாற்று: Azoxystrobin / செப்பு பூச்சிக்கொல்லி'
      ]
    },
    'Healthy': {
      organic: ['சரியான வயல் சுத்தம் மற்றும் தாவர பராமரிப்பை பராமரிக்கவும்'],
      chemical: ['சிகிச்சை தேவைப்படுவதில்லை']
    },
    'Helopeltis': {
      organic: [
        'தொற்றுற்ற தளிர்களை அகற்றவும்',
        'ஆமணக்கு எண்ணெய் (Azadirachtin) தெளிக்கவும்',
        'இயற்கை கொல்லிகளை ஊக்குவிக்கவும்'
      ],
      chemical: [
        'Imidacloprid / Thiamethoxam தெளிக்கவும்',
        'மாற்று: Lambda-cyhalothrin'
      ]
    },
    'Red Leaf Spot': {
      organic: [
        'தொற்றுற்ற இலைகளை அகற்றவும்',
        'வாயு சுழற்சியை மேம்படுத்தவும்',
        'செப்பு அடிப்படையிலான பூச்சிக்கொல்லி பயன்படுத்தவும்'
      ],
      chemical: [
        'Chlorothalonil / Mancozeb / Carbendazim தெளிக்கவும்',
        'சரியான தெளிப்பு வேலை உறுதிப்படுத்தவும்'
      ]
    }
  }
}

export const getTreatment = (language = 'en', disease = 'Healthy') => {
  return treatmentTranslations[language]?.[disease] || treatmentTranslations['en'][disease] || {
    organic: [],
    chemical: []
  }
}

export default treatmentTranslations
