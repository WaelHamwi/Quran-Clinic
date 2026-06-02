/**
 * "Ask Me" local assistant — fully offline, no API key required.
 * Detects user intent from Arabic/English keywords and returns
 * context-aware Islamic guidance with tappable app-section navigation.
 */

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface NavAction {
  label: { ar: string; en: string };
  href: string;
}

export interface AiResponse {
  text: string;
  actions?: NavAction[];
}

export class AiError extends Error {}

type Lang = 'ar' | 'en';

function detectLang(text: string): Lang {
  return /[؀-ۿ]/.test(text) ? 'ar' : 'en';
}

interface Intent {
  patterns: RegExp[];
  text: Record<Lang, string>;
  actions?: NavAction[];
}

const INTENTS: Intent[] = [
  {
    // Greeting
    patterns: [
      /\b(hi|hello|hey|salam|peace|good morning|good evening|assalamu)\b/i,
      /السلام|مرحب|أهل|هلا|حياك|كيف حال|صباح|مساء/,
    ],
    text: {
      ar: 'وعليكم السلام ورحمة الله وبركاته 🌿\nأنا مساعدك في تطبيق المشفى القرآني. يمكنني مساعدتك في إيجاد الرقية المناسبة، أو الأذكار اليومية، أو التحصينات، أو قراءة القرآن الكريم.\n\nبماذا تحتاج اليوم؟',
      en: 'Peace be upon you 🌿\nI\'m your assistant in the Quranic Clinic app. I can help you find the right ruqyah, keep up with daily adhkar, fortify yourself, or read the Quran.\n\nHow can I help you today?',
    },
    actions: [
      { label: { ar: '🏥 المشفى', en: '🏥 The Clinic' }, href: '/hospital' },
      { label: { ar: '📿 الأذكار', en: '📿 Adhkar' }, href: '/adhkar' },
      { label: { ar: '📖 المصحف', en: '📖 Mushaf' }, href: '/(tabs)/mushaf' },
    ],
  },
  {
    // How to use the app
    patterns: [
      /\b(how to|how do|what can|help|guide|tutorial|features|sections|use app|navigate)\b/i,
      /كيف|دليل|مساعدة|استخدام|ماذا تفعل|أقسام|شرح التطبيق/,
    ],
    text: {
      ar: 'تطبيق المشفى القرآني يضم:\n\n🏥 **المشفى** — رقية صوتية مصنّفة حسب الحالة\n📿 **الأذكار** — أذكار الصباح والمساء والنوم\n🛡️ **التحصينات** — تحصين النفس والآخرين\n📖 **المصحف** — قراءة واستماع بأصوات متعددة\n\nاضغط على أي قسم للانتقال إليه مباشرة.',
      en: 'The Quranic Clinic app includes:\n\n🏥 **The Clinic** — audio ruqyah organised by condition\n📿 **Adhkar** — morning, evening & sleep remembrances\n🛡️ **Tahsinat** — fortification for yourself and others\n📖 **Mushaf** — read and listen with multiple reciters\n\nTap any section below to go there directly.',
    },
    actions: [
      { label: { ar: '🏥 المشفى', en: '🏥 The Clinic' }, href: '/hospital' },
      { label: { ar: '📿 الأذكار', en: '📿 Adhkar' }, href: '/adhkar' },
      { label: { ar: '🛡️ التحصينات', en: '🛡️ Tahsinat' }, href: '/tahsinat' },
      { label: { ar: '📖 المصحف', en: '📖 Mushaf' }, href: '/(tabs)/mushaf' },
    ],
  },
  {
    // Evil eye & envy
    patterns: [
      /\b(evil\s*eye|evil eye|envy|envious|jealousy|jealous|hasad|ayn)\b/i,
      /عين|حسد|حاسد|مصاب بالعين|إصابة بالعين|نظرة/,
    ],
    text: {
      ar: 'العين والحسد حقيقة ثابتة شرعاً، قال ﷺ: "العين حق". علاجها بالرقية الشرعية والإكثار من قراءة آية الكرسي والمعوذتين. احرص على السرية وعدم إظهار النعمة أمام من تخشى عيونهم.',
      en: 'The evil eye is established in Islamic teaching — the Prophet ﷺ said: "The evil eye is real." Treatment is through ruqyah, frequent recitation of Ayat al-Kursi and the Mu\'awwidhatayn, and limiting exposure of blessings.',
    },
    actions: [
      { label: { ar: '🏥 رقية العين والحسد', en: '🏥 Evil Eye Ruqyah' }, href: '/hospital' },
      { label: { ar: '📿 أذكار الحماية', en: '📿 Protection Adhkar' }, href: '/adhkar' },
    ],
  },
  {
    // Magic / sihr
    patterns: [
      /\b(magic|sihr|spell|sorcery|witchcraft|hex|curse|black magic|bewitched)\b/i,
      /سحر|ساحر|مسحور|ربط|تفريق|عقد|عمل مس|عمل سحر/,
    ],
    text: {
      ar: 'السحر حقيقة ذكرها الله في كتابه الكريم. والعلاج منه بالرقية الشرعية المأخوذة من الكتاب والسنة، والصبر واليقين بأن الله هو الشافي. لا تلجأ أبداً لمن يدّعي نقض السحر بسحر مثله.',
      en: 'Magic (sihr) is acknowledged in the Quran and treated through lawful ruqyah from the Quran and Sunnah, combined with patience and firm trust that Allah alone heals. Never seek those who claim to undo magic with more magic.',
    },
    actions: [
      { label: { ar: '🏥 رقية السحر', en: '🏥 Sihr Ruqyah' }, href: '/hospital' },
      { label: { ar: '🛡️ التحصينات', en: '🛡️ Fortification' }, href: '/tahsinat' },
    ],
  },
  {
    // Jinn / possession / waswas
    patterns: [
      /\b(jinn|jin|djinn|possession|possessed|waswas|whispers|demonic)\b/i,
      /جن|مس|تلبس|وسواس|شيطان|وساوس|موسوس|أصوات|صوت في الرأس/,
    ],
    text: {
      ar: 'مسّ الجن أمر ثابت، والعلاج بالرقية الشرعية بإذن الله. أكثر من قراءة سورة البقرة في بيتك، وداوم على أذكار الصباح والمساء، والتعوذ بالله من الشيطان الرجيم.',
      en: 'Jinn possession is real and treated through lawful ruqyah. Recite Surah Al-Baqarah in your home regularly, maintain morning and evening adhkar daily, and always seek refuge in Allah from Shaytan.',
    },
    actions: [
      { label: { ar: '🏥 رقية المس والجن', en: '🏥 Jinn Ruqyah' }, href: '/hospital' },
      { label: { ar: '📿 أذكار الصباح والمساء', en: '📿 Morning & Evening Adhkar' }, href: '/adhkar' },
    ],
  },
  {
    // Anxiety / depression / OCD
    patterns: [
      /\b(anxiety|anxious|stress|stressed|depressed|depression|sad|sadness|fear|scared|panic|worry|worried|ocd|mental|psychological)\b/i,
      /قلق|خوف|وسواس قهري|اكتئاب|هم|حزن|وحدة|ضيق|توتر|يأس|وحيد|مكتئب/,
    ],
    text: {
      ar: 'القلق والحزن أمراض العصر، والإسلام يملك لها الدواء. قال ﷺ: "ما أصاب المسلم من هم ولا حزن إلا كفّر الله بها من خطاياه". أكثر من الاستغفار والدعاء: "اللهم إني أعوذ بك من الهم والحزن".\n\n⚠️ الرقية مكمّل للعلاج النفسي وليس بديلاً عنه.',
      en: 'Anxiety and depression are real struggles — Islam has powerful remedies. The Prophet ﷺ taught: "O Allah, I seek refuge in You from worry and grief." Increase istighfar and stay connected to dhikr.\n\n⚠️ Ruqyah complements professional mental health care — please consult a specialist if needed.',
    },
    actions: [
      { label: { ar: '🏥 رقية القلق والاكتئاب', en: '🏥 Anxiety Ruqyah' }, href: '/hospital' },
      { label: { ar: '📿 أذكار الطمأنينة', en: '📿 Adhkar for Peace' }, href: '/adhkar' },
    ],
  },
  {
    // Sleep / nightmares
    patterns: [
      /\b(sleep|nightmare|insomnia|bad dream|can't sleep|trouble sleeping|night terrors)\b/i,
      /نوم|أرق|كوابيس|منام|رؤيا|لا أنام|تعب من النوم|مشكلة في النوم/,
    ],
    text: {
      ar: 'اضطرابات النوم والكوابيس قد تكون من أثر الشيطان. من السنة النبوية قبل النوم: قراءة آية الكرسي والمعوذتين والنفث، وقول "باسمك اللهم أموت وأحيا".',
      en: 'Sleep disturbances and nightmares can have spiritual causes. The Prophet ﷺ recommended reciting Ayat al-Kursi and the Mu\'awwidhatayn before sleep, and saying: "In Your Name, O Allah, I die and I live."',
    },
    actions: [
      { label: { ar: '📿 أذكار النوم', en: '📿 Sleep Adhkar' }, href: '/adhkar' },
      { label: { ar: '🏥 رقية الكوابيس', en: '🏥 Nightmares Ruqyah' }, href: '/hospital' },
    ],
  },
  {
    // Physical illness / pain
    patterns: [
      /\b(sick|illness|pain|headache|fever|disease|hurt|ache|body pain|physical|health issue|unwell)\b/i,
      /مرض|ألم|صداع|حمى|وجع|تعب|مريض|جسد|وجع في|صحة|علاج جسدي/,
    ],
    text: {
      ar: 'الشفاء من عند الله وحده. قال ﷺ: "ما أنزل الله داءً إلا أنزل له شفاءً". ضع يدك على موضع الألم وقل "بسم الله" ثلاثاً، ثم سبع مرات: "أعوذ بعزة الله وقدرته من شر ما أجد وأحاذر".\n\n💡 لا تُهمل مراجعة الطبيب المختص.',
      en: 'Healing is from Allah alone. The Prophet ﷺ said: "Allah has not sent down a disease without sending down its cure." Place your hand on the pain, say "Bismillah" three times, then seven times: "I seek refuge in Allah\'s might and power from what I feel and fear."\n\n💡 Do not neglect consulting a qualified doctor.',
    },
    actions: [
      { label: { ar: '🏥 رقية الأمراض الجسدية', en: '🏥 Physical Illness Ruqyah' }, href: '/hospital' },
    ],
  },
  {
    // Fortification / protection
    patterns: [
      /\b(protect|protection|fortif|fortification|ward off|guard|shield|daily protection)\b/i,
      /تحصين|تحصن|حماية|وقاية|حصن نفس|أمان|أحمي نفسي/,
    ],
    text: {
      ar: 'التحصين اليومي سنة مؤكدة. أهم وسائله: آية الكرسي بعد كل صلاة، أذكار الصباح والمساء، والمعوذتين ثلاثاً صباحاً ومساءً.',
      en: 'Daily fortification is an established Prophetic practice. Key means: Ayat al-Kursi after every prayer, morning and evening adhkar, and the Mu\'awwidhatayn three times at morning and evening.',
    },
    actions: [
      { label: { ar: '🛡️ التحصينات', en: '🛡️ Tahsinat' }, href: '/tahsinat' },
      { label: { ar: '📿 أذكار الحماية', en: '📿 Protection Adhkar' }, href: '/adhkar' },
    ],
  },
  {
    // Adhkar / dhikr
    patterns: [
      /\b(adhkar|dhikr|zikr|remembrance|tasbih|morning adhkar|evening adhkar|supplication|dua)\b/i,
      /أذكار|ذكر|تسبيح|دعاء|أوراد|صباح مساء|ورد|يومي/,
    ],
    text: {
      ar: 'قسم الأذكار في التطبيق يضم أربعة أقسام:\n• 🌅 أذكار الصباح\n• 🌇 أذكار المساء\n• 🌙 أذكار النوم\n• 🌤 أذكار الاستيقاظ\n\nكل ذكر مع دليله الشرعي وعدد مرات التكرار.',
      en: 'The Adhkar section has four parts:\n• 🌅 Morning adhkar\n• 🌇 Evening adhkar\n• 🌙 Before-sleep adhkar\n• 🌤 Upon-waking adhkar\n\nEach dhikr includes its evidence and repetition count.',
    },
    actions: [
      { label: { ar: '📿 اذهب إلى الأذكار', en: '📿 Go to Adhkar' }, href: '/adhkar' },
    ],
  },
  {
    // Quran / Mushaf
    patterns: [
      /\b(quran|mushaf|surah|recite|recitation|read quran|listen quran|reciter|tilawa|verse)\b/i,
      /قرآن|مصحف|سورة|تلاوة|استماع|قراءة|قارئ|ختمة|آية/,
    ],
    text: {
      ar: 'قال الله تعالى: ﴿وَنُنَزِّلُ مِنَ الْقُرْآنِ مَا هُوَ شِفَاءٌ وَرَحْمَةٌ لِلْمُؤْمِنِينَ﴾. قسم المصحف يتيح لك تصفح ١١٤ سورة، الاستماع مع قراء متعددين، ومتابعة مكانك في القراءة.',
      en: 'Allah says: "We send down of the Quran that which is healing and mercy for the believers." The Mushaf section lets you browse all 114 surahs, listen with multiple reciters, and track your reading progress.',
    },
    actions: [
      { label: { ar: '📖 اذهب إلى المصحف', en: '📖 Go to Mushaf' }, href: '/(tabs)/mushaf' },
    ],
  },
  {
    // Marriage / family
    patterns: [
      /\b(marriage|divorce|wife|husband|family|relationship|marital|spouse|couple)\b/i,
      /زواج|طلاق|زوج|زوجة|أسرة|علاقة|خطبة|مشاكل زوجية|هجر بين الزوجين/,
    ],
    text: {
      ar: 'مشاكل الأسرة قد يكون وراءها سحر التفريق أو وساوس شيطانية. العلاج بالرقية الشرعية مع الحرص على الحوار والتفاهم، واستشارة متخصص في الإرشاد الأسري عند الحاجة.',
      en: 'Family and marital difficulties can sometimes have spiritual roots (separation magic or evil whispers). Treatment combines ruqyah with open communication and, when needed, professional counselling.',
    },
    actions: [
      { label: { ar: '🏥 رقية المشاكل الزوجية', en: '🏥 Marital Ruqyah' }, href: '/hospital' },
      { label: { ar: '🛡️ التحصينات', en: '🛡️ Fortification' }, href: '/tahsinat' },
    ],
  },
  {
    // General ruqyah
    patterns: [
      /\b(ruqyah|rokya|roqia|general ruqyah|ruqia|healing audio|listen ruqyah)\b/i,
      /رقية|رقيه|رقى|رقية عامة|رقية شرعية|جلسة رقية/,
    ],
    text: {
      ar: 'الرقية الشرعية علاج مبارك بالقرآن الكريم والأدعية الثابتة. يمكنك البدء بالرقية العامة للحماية الشاملة، أو اختيار الرقية المخصصة لحالتك.',
      en: 'Lawful ruqyah is a blessed treatment combining Quranic verses and authentic supplications. Start with general ruqyah for comprehensive protection, or browse for ruqyah tailored to your specific condition.',
    },
    actions: [
      { label: { ar: '🏥 اذهب إلى المشفى', en: '🏥 Go to The Clinic' }, href: '/hospital' },
    ],
  },
];

const DEFAULT_RESPONSE: Record<Lang, string> = {
  ar: 'أنا هنا لمساعدتك في رحلة الشفاء بإذن الله. يمكنني توجيهك نحو الرقية المناسبة، الأذكار، التحصينات، أو القرآن الكريم.\n\nأخبرني أكثر عما تشعر به أو تحتاجه وسأرشدك للقسم المناسب.',
  en: 'I\'m here to help you on your healing journey, by Allah\'s will. I can guide you to the right ruqyah, adhkar, fortification, or Quran section.\n\nTell me more about what you\'re experiencing and I\'ll point you in the right direction.',
};

const DEFAULT_ACTIONS: NavAction[] = [
  { label: { ar: '🏥 المشفى', en: '🏥 The Clinic' }, href: '/hospital' },
  { label: { ar: '📿 الأذكار', en: '📿 Adhkar' }, href: '/adhkar' },
  { label: { ar: '🛡️ التحصينات', en: '🛡️ Tahsinat' }, href: '/tahsinat' },
];

export async function askAi(history: ChatMessage[]): Promise<AiResponse> {
  const lastUser = [...history].reverse().find((m) => m.role === 'user');
  if (!lastUser) throw new AiError('No user message');

  const text = lastUser.content;
  const lang = detectLang(text);

  for (const intent of INTENTS) {
    if (intent.patterns.some((re) => re.test(text))) {
      return { text: intent.text[lang], actions: intent.actions };
    }
  }

  return { text: DEFAULT_RESPONSE[lang], actions: DEFAULT_ACTIONS };
}
