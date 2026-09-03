import type { Ionicons } from '@expo/vector-icons';

export interface TawjihatItem {
  slug: string;
  icon: keyof typeof Ionicons.glyphMap;
  illustrationIcon: keyof typeof Ionicons.glyphMap;
  title: { ar: string; en: string };
  listType: 'bullet' | 'numbered';
  items: { ar: string; en: string }[];
}

export const TAWJIHAT_ITEMS: TawjihatItem[] = [
  {
    slug: 'wiqaya',
    icon: 'book-outline',
    illustrationIcon: 'book',
    title: { ar: 'الوقاية', en: 'Protection' },
    listType: 'bullet',
    items: [
      {
        ar: 'اعلم – عافاك الله – أن الله هو المالك المتصرف في هذا الكون ولا يكون فيه إلا ما أراد على الوجه الذي يرضاه، فلا مكره له سبحانه في ملكه ولا يُرد قضاؤه إلا بإذنه.',
        en: 'Know — may Allah grant you well-being — that Allah is the Owner and Controller of this universe. Nothing occurs except what He wills in the manner He is pleased with. None can compel Him in His dominion, and His decree is not repelled except by His leave.',
      },
      {
        ar: 'الإكثار من الدعاء فقد قال رسول الله صلى الله عليه وسلم (لا يرد القضاء إلا الدعاء)',
        en: "Increase supplication (du'a), for the Messenger of Allah ﷺ said: 'Nothing repels decree except du'a.'",
      },
      {
        ar: 'أن يتوكل على الله وأن يعلم أن كل شيء بيده وأنه بكل شيء عليم وعلى كل شيء قدير وأنه لا يكون إلا ما أراد وكيفما أراد (ومن يتوكل على الله فهو حسبه إن الله بالغ أمره)',
        en: "Trust in Allah, and know that everything is in His hands, He is All-Knowing and All-Capable. 'And whoever relies upon Allah — then He is sufficient for him. Indeed, Allah will accomplish His purpose.'",
      },
      {
        ar: 'المحافظة على الصلاة المفروضة في أوقاتها والسنن الرواتب والنوافل كالضحى وقيام الليل',
        en: 'Maintain the obligatory prayers on time, along with the regular Sunnah prayers and voluntary prayers such as Duha and night prayers.',
      },
      {
        ar: 'المحافظة على أداء صلاتي الفجر والعشاء في جماعة قدر المستطاع',
        en: "Strive to pray Fajr and Isha' in congregation as much as possible.",
      },
      {
        ar: 'المحافظة على الأذكار الواردة في الصباح والمساء ودخول وخروج المسجد ودخول وخروج البيت ودخول وخروج دورة المياه والبسملة والحمد بعد الطعام وأذكار النوم وأذكار اللباس وغيرها',
        en: 'Maintain the prescribed adhkar for morning and evening, entering and leaving the mosque, entering and leaving the home, bathroom adhkar, Bismillah and praise after eating, sleep adhkar, dressing adhkar, and others.',
      },
      {
        ar: 'أن يكون مصدر الرزق حلالاً قال تعالى: (يا أيها الناس كلوا مما في الأرض حلالاً طيباً ولا تتبعوا خطوات الشيطان إنه لكم عدو مبين)',
        en: "Ensure your source of sustenance is lawful. Allah says: 'O people, eat from whatever is on earth that is lawful and good, and do not follow the footsteps of Satan. Indeed, he is to you a clear enemy.'",
      },
      {
        ar: 'أن يحيا حياة طبيعية بعيدة عن الشك. وكلما جاءه هاجس السحر والحسد دفعه بعدم وجود البرهان (قل هاتوا برهانكم إن كنتم صادقين)',
        en: "Live a normal life free from suspicion. Whenever thoughts of magic or envy arise, repel them with the absence of proof. 'Say: Bring your proof, if you are truthful.'",
      },
      {
        ar: 'ضبط النفس وعدم المبالغة في المشاعر كالجزع والفزع الشديد أو الخوف الشديد أو الفرح الشديد، بل يروض نفسه على أن هذه الدنيا فانية بخيرها وشرها (قل بفضل الله وبرحمته فبذلك فليفرحوا)',
        en: "Control yourself and avoid exaggerating emotions such as excessive grief, fear, or joy. Train yourself to know that this world is fleeting. 'Say: In the bounty of Allah and in His mercy — in that let them rejoice.'",
      },
      {
        ar: 'لزوم المساجد والدعاء والعمرة',
        en: 'Frequent the mosques, make supplication, and perform Umrah.',
      },
      {
        ar: 'كثرة الصدقات فإنها تدفع البلاء',
        en: 'Give charity abundantly, for it repels calamity.',
      },
      {
        ar: 'الذبح لله، فهو من أعظم القربات وأجلّ العبادات، وتوزيعها كاملة طيبة بها النفس.',
        en: 'Slaughter for the sake of Allah, for it is among the greatest acts of worship. Distribute it fully with a generous heart.',
      },
      {
        ar: 'صلة الأرحام فإنها تزيد البركة',
        en: 'Maintain ties of kinship, for it increases blessings.',
      },
      {
        ar: 'عدم التباهي أمام الناس بما يملك من مال أو جمال أو قوة عضلية أو قوة عقلية',
        en: 'Do not boast before people about your wealth, beauty, physical strength, or intellectual ability.',
      },
      {
        ar: 'الحذر من قهر الضعفاء',
        en: 'Beware of oppressing the weak.',
      },
      {
        ar: 'البعد عن المعاصي',
        en: 'Stay away from sins and disobedience.',
      },
      {
        ar: 'المكث متستراً قدر المستطاع ولا يتخفف من الملابس إلا بعد الأذكار والتسمية',
        en: 'Remain covered as much as possible. Do not remove clothing except after reciting the prescribed adhkar and Bismillah.',
      },
      {
        ar: 'عدم الوقوف طويلا أمام المرآة ولا التصوير بكثرة (المقصود عدم الإعجاب بالنفس ومنع حديث النفس عن جمال الوجه والجسم وتذكر تفاصيل ذلك)',
        en: 'Do not stand long before a mirror or take excessive photos — the intent is to avoid self-admiration and dwelling on the details of your facial or bodily beauty.',
      },
      {
        ar: 'المنع من الاختلاط نهائياً، حتى لو مع الأقارب الغير محارم، حتى لو كان هناك حرج. ولا تخرج المرأة أمام الرجال إلا أن تكون منتقبة.',
        en: 'Absolutely avoid free mixing, even with non-mahram relatives, even if it causes awkwardness. A woman should not appear before unrelated men except in full niqab.',
      },
      {
        ar: 'الوحدة خير من جليس السوء. فإن لم يكن لك صاحب يحثك على الخير ويأمرك به فاعتزل الفاسدين واصحب الكتب واقرأ ثم اقرأ. أو استمع للكتب، واحرص على القرآن الكريم ثم كتب التفسير وكتب الحديث والعلم الشرعي.',
        en: 'Solitude is better than a bad companion. If you have no friend who calls you to good, keep away from the corrupt. Accompany books and read. Focus on the Holy Quran, then books of tafsir, hadith, and Islamic knowledge.',
      },
    ],
  },
  {
    slug: 'listening-instructions',
    icon: 'radio-outline',
    illustrationIcon: 'radio',
    title: { ar: 'تعليمات الاستماع للرقية الشرعية', en: 'Ruqyah Listening Instructions' },
    listType: 'numbered',
    items: [
      {
        ar: 'اعلم عافاك الله أن الرقية سبب، وأن الأمر بيد الله يقبل السبب أو لا يقبله، وأن بُعد الإنسان عن الله وتركه للصلاة يضعف أثر الرقية، وكلما كان العبد من ربه أقرب كان إلى العافية والنجاة أوجب.',
        en: "Know — may Allah grant you well-being — that ruqyah is a means. The matter is in Allah's hands: He accepts the means or does not. A person's distance from Allah and neglect of prayer weakens the effect of ruqyah. The closer a servant is to his Lord, the more deserving he is of healing and salvation.",
      },
      {
        ar: 'احرص أن تكون وقت استماعك على طهارة، قد صليت ركعتين طلبت فيهما من الله الشفاء والعافية، وإن تصدقت فهذا أكمل، ولو أن تتصدق على أهلك وتدخل السرور عليهم بشيء بسيط.',
        en: "Ensure you are in a state of purity when listening. Pray two rak'ahs asking Allah for healing and well-being. If you give charity beforehand, that is more complete — even something small that brings joy to your family.",
      },
      {
        ar: 'تفرغ تماماً وكن في مكان هادئ خالياً من الأشغال أو الملهيات، يفضل أن تكون في المنزل وأن تضع السماعات - جالساً أو مستلقياً - وتستمع للرقية كاملة. حاول جاهداً ألا يقطع الاستماع طفل أو زوجة، ولا تنشغل بالجوال أثناء الاستماع للرقية، (وإذا قرأ القرآن فاستمعوا له وأنصتوا لعلكم ترحمون).',
        en: "Be fully free and in a quiet place away from distractions. Preferably be at home with earphones — seated or lying down — and listen to the full ruqyah. Try your best not to be interrupted by a child or spouse, and do not use your phone during listening. 'When the Quran is recited, listen to it and pay attention that you may receive mercy.'",
      },
      {
        ar: 'يمكنك إعادة الاستماع للرقية أكثر من مرة في نفس اليوم.',
        en: 'You may replay the ruqyah multiple times in the same day.',
      },
      {
        ar: 'في حال أردت أن تشمل الرقية ماء وزيت، اجعل الماء والزيت بجانبك وقت الرقية وافتح العلب، ولا بأس بزيادتهما بعد ذلك، مع التأكيد على أن الرقية تعمل على المكبر وليس في سماعات الأذن حتى يصل صوت الرقية للماء والزيت.',
        en: 'If you want to include water and oil in the session, place them beside you with the containers open. You may add more afterward. Note: ruqyah must be played on a speaker — not earphones — so the sound reaches the water and oil.',
      },
      {
        ar: 'لا تستمع للرقية الشرعية وأنت تقود السيارة، فإنها قد تسبب النعاس ويشكل ذلك خطراً عليك وعلى الآخرين.',
        en: 'Do not listen to ruqyah while driving, as it may cause drowsiness and pose a danger to you and others.',
      },
      {
        ar: 'ونؤكد على عدم تركك للعلاج الطبي حال استماع الرقية فإنهما لا يتعارضان، ولو شعرت بتحسن فعليك متابعة ذلك مع الطبيب المعالج.',
        en: 'We emphasize that you should not abandon medical treatment while listening to ruqyah, as the two do not conflict. If you feel improvement, continue to follow up with your treating physician.',
      },
    ],
  },
  {
    slug: 'faith-during-illness',
    icon: 'business-outline',
    illustrationIcon: 'business',
    title: { ar: 'عقيدة المسلم حال المرض', en: "Muslim's Faith During Illness" },
    listType: 'bullet',
    items: [
      {
        ar: 'المرض ابتلاء من الله يرفع به الدرجات ويكفّر به الخطايا، قال ﷺ: "ما يصيب المسلم من نصَب ولا وصَب ولا همٍّ ولا حزن ولا أذى ولا غمٍّ، حتى الشوكة يُشاكها، إلا كفّر الله بها من خطاياه".',
        en: 'Illness is a trial from Allah that raises ranks and expiates sins. The Prophet ﷺ said: "No fatigue, illness, anxiety, sorrow, harm or sadness afflicts a Muslim — even the prick of a thorn — except that Allah expiates his sins by it."',
      },
      {
        ar: 'الصبر على البلاء والرضا بقضاء الله وقدره؛ فالصبر على المرض من أعظم العبادات.',
        en: 'Be patient with trials and content with the decree of Allah, for patience during illness is among the greatest acts of worship.',
      },
      {
        ar: 'لا ينبغي للمريض أن يتمنى الموت، فقال ﷺ: "لا يتمنَّينَّ أحدكم الموتَ لضُرٍّ أصابه"، بل يدعو الله بالعافية.',
        en: "The sick person should not wish for death. The Prophet ﷺ said: 'None of you should wish for death because of a difficulty that has befallen him.' Instead, supplicate to Allah for well-being.",
      },
      {
        ar: 'أن يُحسن الظن بالله في كل أحواله؛ فالله عند ظن عبده به.',
        en: 'Maintain a good opinion of Allah in all circumstances, for Allah is as His servant thinks of Him.',
      },
      {
        ar: 'الإكثار من الذكر والدعاء وتلاوة القرآن، فإن ذلك يُخفف وطأة المرض ويُشرح الصدر.',
        en: 'Increase dhikr, supplication, and recitation of the Quran, for these lighten the burden of illness and expand the chest.',
      },
      {
        ar: 'الأخذ بالأسباب الطبية المشروعة مع التوكل على الله، فالتداوي لا ينافي التوكل.',
        en: 'Take lawful medical means while relying on Allah, for seeking treatment does not contradict tawakkul.',
      },
    ],
  },
  {
    slug: 'useful-habits',
    icon: 'calendar-outline',
    illustrationIcon: 'calendar',
    title: { ar: 'عادات مفيدة', en: 'Useful Habits' },
    listType: 'bullet',
    items: [
      {
        ar: 'اجعل الذكر رفيقك في كل وقت وحين، فإن ذكر الله أكبر سلاح في وجه الأمراض الروحية والنفسية.',
        en: 'Make dhikr your constant companion, for the remembrance of Allah is the greatest weapon against spiritual and psychological ailments.',
      },
      {
        ar: 'احرص على قراءة القرآن يومياً ولو بقدر جزء، فإن القرآن شفاء لما في الصدور.',
        en: 'Strive to read the Quran daily, even if only a portion, for the Quran is a cure for what is in the hearts.',
      },
      {
        ar: 'المحافظة على الصلوات الخمس في أوقاتها تُحصّن القلب وتُطهّر النفس وتُبعد الوساوس.',
        en: 'Maintaining the five daily prayers on time fortifies the heart, purifies the soul, and keeps whispers away.',
      },
      {
        ar: 'النوم المبكر والاستيقاظ لصلاة الفجر من أعظم الأسباب في تقوية الإيمان والحصانة الروحية.',
        en: 'Sleeping early and rising for Fajr prayer is among the greatest means of strengthening faith and spiritual immunity.',
      },
      {
        ar: 'الإكثار من الصدقة؛ فهي تدفع البلاء وتُطفئ غضب الرب وتزيد البركة في المال والعمر.',
        en: 'Give charity frequently; it repels calamity, extinguishes the Lord\'s anger, and increases blessings in wealth and lifespan.',
      },
      {
        ar: 'صلة الأرحام وزيارة الأهل والأقارب يُديم البركة ويشرح الصدر.',
        en: 'Maintaining ties of kinship and visiting family sustains blessings and expands the chest.',
      },
    ],
  },
  {
    slug: 'ruqyah-exercises',
    icon: 'sunny-outline',
    illustrationIcon: 'sunny',
    title: { ar: 'رياضة المرقي', en: "Ruqi's Exercises" },
    listType: 'bullet',
    items: [
      {
        ar: 'هي مجموعة من التمارين والممارسات الروحية التي تُعين المريض على تعزيز استجابته للرقية وتقوية إيمانه.',
        en: 'These are a set of spiritual practices that help the patient enhance their response to ruqyah and strengthen their faith.',
      },
      {
        ar: 'خصّص عشر دقائق يومياً لتردد "لا إله إلا الله" بتمعّن وتدبّر، مع التركيز على معنى التوحيد.',
        en: 'Dedicate ten minutes daily to contemplating "La ilaha illa Allah" with focus on the meaning of Tawhid.',
      },
      {
        ar: 'خذ نفساً عميقاً وأثناء الزفير قل "أعوذ بالله من الشيطان الرجيم"، كرّر ذلك عشر مرات.',
        en: "Take a deep breath and while exhaling say 'A'udhu billahi min al-shaytan al-rajim.' Repeat ten times.",
      },
      {
        ar: 'امشِ في الهواء الطلق مع المداومة على الذكر، فالجمع بين الرياضة البدنية والذكر مفيد للبدن والروح معاً.',
        en: 'Walk outdoors while continuously making dhikr. Combining physical exercise with remembrance benefits both body and soul.',
      },
      {
        ar: 'احرص على النوم في وقت مبكر مع المداومة على أذكار النوم، فهي تُحصّن النائم من أذى الشياطين أثناء النوم.',
        en: 'Sleep early while consistently reciting the sleep adhkar; they protect the sleeper from harm during the night.',
      },
    ],
  },
];
