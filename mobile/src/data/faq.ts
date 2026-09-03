export interface FaqItem {
  id: string;
  question: { ar: string; en: string };
  answer: { ar: string; en: string };
  highlight: { ar: string; en: string };
}

export interface FaqSection {
  id: string;
  title: { ar: string; en: string };
  data: FaqItem[];
}

const HIGHLIGHT_VERSE = {
  ar: '"يَا أَيُّهَا النَّاسُ قَدْ جَاءَتْكُم مَّوْعِظَةٌ مِّن رَّبِّكُمْ وَشِفَاءٌ لِّمَا فِي الصُّدُورِ وَهُدًى وَرَحْمَةٌ لِّلْمُؤْمِنِينَ"',
  en: '"O mankind, there has come to you instruction from your Lord and healing for what is in the breasts and guidance and mercy for the believers"',
};

export const FAQ_SECTIONS: FaqSection[] = [
  {
    id: 'ruqyah',
    title: { ar: 'الرقية الشرعية', en: 'Islamic Ruqyah' },
    data: [
      {
        id: 'specific-verses',
        question: {
          ar: 'هل يجوز تخصيص بعض الآيات لبعض الأمراض؟',
          en: 'Can specific verses be designated for specific diseases?',
        },
        answer: {
          ar: 'دَأَبَ العلماء على الحث على قراءة بعض الآيات الخاصة لبعض الحالات، كما فعل الشيخ: عبدالعزيز بن باز – رحمه الله – حين سأله أحد المستفتين عن آيات تُقرأ لإبطال عمل السحر فأرشده إلى آية الكرسي وسور: الإخلاص والفلق والناس وآيات قصة موسى مع السحرة في سور: الأعراف ويونس وطه والشعراء؛ علمًا بأن هذه الآيات لم يرد في قراءتها نص شرعي يفيد بجواز قراءتها لفك السحر، وفعل الشيخ ابن باز رحمه الله له أصل في الشريعة الغراء، ففي القرآن الكريم قوله تعالى: @@"وَنُنَزِّلُ مِنَ الْقُرْآنِ مَا هُوَ شِفَاءٌ وَرَحْمَةٌ لِّلْمُؤْمِنِينَ ۙ وَلَا يَزِيدُ الظَّالِمِينَ إِلَّا خَسَارًا"@@ قال القرطبي: ويصح أن تكون (من) لبيان الجنس؛ كأنه قال: وننزل ما فيه شفاء من القرآن. قال ابن عطية: يصح أن تكون للتبعيض بحسب أن إنزاله إنما هو مبعض، فكأنه قال: وننزل من القرآن شيئا شفاء. وأما مسألة الشفاء فهل المقصود الشفاء المعنوي لأمراض القلوب أم الشفاء الحسي لأمراض الأبدان؟ فالصحيح أن القرآن الكريم شفاء لكليهما، فلا يشك أحد أنه شفاء لأمراض القلوب لما فيه من حجج وبراهين، قال تعالى: @@"يَا أَيُّهَا النَّاسُ قَدْ جَاءَتْكُم مَّوْعِظَةٌ مِّن رَّبِّكُمْ وَشِفَاءٌ لِّمَا فِي الصُّدُورِ وَهُدًى وَرَحْمَةٌ لِّلْمُؤْمِنِينَ"@@ وأما الشفاء من أمراض الأبدان فقد قال تعالى: @@"قُلْ هُوَ لِلَّذِينَ آمَنُوا هُدًى وَشِفَاءٌ ۖ"@@ وجاء في البخاري: ((أنَّ النَّبيَّ صلَّى اللهُ عليه وسلَّم كانَ يَنْفِثُ علَى نَفْسِهِ في مَرَضِهِ الذي قُبِضَ فيه بالمُعَوِّذَاتِ))، وفي الحديث المتفق عليه من حديث أبي سعيد الخدري رضي الله عنه: ((انْطَلَقَ نَفَرٌ مِن أَصْحَابِ النَّبيِّ صَلَّى اللهُ عليه وسلَّمَ في سَفْرَةٍ سَافَرُوهَا، حتَّى نَزَلُوا علَى حَيٍّ مِن أَحْيَاءِ العَرَبِ، فَاسْتَضَافُوهُمْ فأبَوْا أَنْ يُضَيِّفُوهُمْ، فَلُدِغَ سَيِّدُ ذلكَ الحَيِّ، فَسَعَوْا له بكُلِّ شَيءٍ لا يَنْفَعُهُ شَيءٌ، فَقالَ بَعْضُهُمْ: لو أَتَيْتُمْ هَؤُلَاءِ الرَّهْطَ الَّذِينَ نَزَلُوا لَعَلَّهُ أَنْ يَكونَ عِنْدَ بَعْضِهِمْ شَيءٌ. فأتَوْهُمْ فَقالوا: يا أَيُّهَا الرَّهْطُ إنَّ سَيِّدَنَا لُدِغَ وَسَعَيْنَا له بكُلِّ شَيءٍ لا يَنْفَعُهُ، فَهلْ عِنْدَ أَحَدٍ مِنكُم مِن شَيءٍ؟ فَقالَ بَعْضُهُمْ: نَعَمْ وَاللَّهِ إنِّي لَأَرْقِي، وَلَكِنْ وَاللَّهِ لَقَدِ اسْتَضَفْنَاكُمْ فَلَمْ تُضَيِّفُونَا، فَما أَنَا بِرَاقٍ لَكُمْ حتَّى تَجْعَلُوا لَنَا جُعْلًا. فَصَالَحُوهُمْ علَى قَطِيعٍ مِنَ الغَنَمِ، فَانْطَلَقَ يَتْفِلُ عليه وَيَقْرَأُ: (الحَمْدُ لِلَّهِ رَبِّ العَالَمِينَ)، فَكَأنَّما نُشِطَ مِن عِقَالٍ فَانْطَلَقَ يَمْشِي وَما به قَلَبَةٌ)). والشاهد من هذا الحديث أمران، الأول: أن الرقية نفعت الملدوغ وهو مرض حسي. والثاني: قول النبي صلى الله عليه وسلم للصحابي الذي رقى: ((وَما يُدْرِيكَ أنَّهَا رُقْيَةٌ؟)) فهذا أصل في أن الرقى جائزة لا بأس بها طالما كانت من كلام الله وسنة نبيه أو كانت بأسمائه وصفاته أو كانت من الأدعية التي لا شرك فيها ولا بدعة، لما روى مسلم عَنْ عَوْفِ بْنِ مَالِكٍ الأَشْجَعِيِّ رضي الله عنه قَالَ: كُنَّا نَرْقِي فِي الْجَاهِلِيَّةِ فَقُلْنَا يَا رَسُولَ اللَّهِ كَيْفَ تَرَى فِي ذَلِكَ فَقَالَ: (اعْرِضُوا عَلَيَّ رُقَاكُمْ، لاَ بَأْسَ بِالرُّقَى مَا لَمْ يَكُنْ فِيهِ شِرْكٌ).',
          en: 'Scholars have consistently encouraged reciting specific verses for specific conditions, as did Sheikh Ibn Baz ﵀ when he recommended Ayat al-Kursi, Al-Ikhlas, Al-Falaq, An-Nas, and the verses of Moses with the sorcerers for breaking magic — though no explicit prophetic text specifies them for this purpose. This practice has its foundation in the Quran: "And We reveal of the Quran that which is healing and mercy for the believers" (17:82). Al-Qurtubi said \'min\' here is for genus — all of the Quran is healing. The Quran heals both spiritual and physical ailments. In the agreed-upon hadith of Abu Sa\'id al-Khudri, a companion recited Al-Fatiha over a scorpion-stung man and he was healed; the Prophet ﷺ approved it saying: "What told you it was a ruqyah?" — establishing that ruqyah by Allah\'s words is permitted as long as it contains no shirk, as Muslim narrated from \'Awf ibn Malik: "Show me your ruqyah — there is no harm in ruqyah as long as it does not involve shirk."',
        },
        highlight: HIGHLIGHT_VERSE,
      },
      {
        id: 'ruqyah-restricted',
        question: {
          ar: 'هل الرقية توقيفية؟ لا يجوز فيها إلا ما جاء عن النبي صلى الله عليه وسلم؟',
          en: 'Is Ruqyah restricted to prophetic narrations only?',
        },
        answer: {
          ar: 'ليست توقيفية، بل يجوز الاجتهاد فيها، وقد أقر النبي صلى الله عليه وسلم الصحابي أبا سعيد الخدري رضي الله عنه قراءته الفاتحة على اللديغ على سبيل الرقية من غير أن يعلمهم إياها، فقال له: وما يدريك أنها رقية؟، وقال صلى الله عليه وسلم: ((اعْرِضُوا عَلَيَّ رُقَاكُمْ، لاَ بَأْسَ بِالرُّقَى مَا لَمْ يَكُنْ فِيهِ شِرْكٌ)) رواه مسلم، وهي من باب الطب، والطب بالتجارب، وقد ثبت بالتجارب انتفاع الناس بالرقى ببعض الآيات لبعض الأمراض، وانتفاعهم بالماء والزيت المقروء فيهما مع عدم ورود ذلك في السنة المطهرة.',
          en: 'The correct scholarly view is that Ruqyah is not exclusively restricted to narrated prophetic texts. The Prophet ﷺ approved Abu Sa\'id al-Khudri reading Al-Fatiha over a sting victim as ruqyah without having taught them to do so, saying: "What told you it was a ruqyah?" He ﷺ also said: "Show me your ruqyah — there is no harm in ruqyah as long as it does not involve shirk" (Muslim). Ruqyah belongs to the domain of medicine, and medicine is built on experience. Experience has confirmed that certain verses benefit certain conditions, and that water and oil recited over benefit patients even without explicit prophetic narrations specifying this.',
        },
        highlight: HIGHLIGHT_VERSE,
      },
      {
        id: 'physical-healing',
        question: {
          ar: 'هل يُشفى المرض العضوي بالرقية؟ وما هي علامات الاستجابة؟',
          en: 'Can physical illness be healed by Ruqyah? What are the signs of response?',
        },
        answer: {
          ar: 'قال ابن القيم رحمه الله: إن قوى العوذ والرقى والدعوات فوق قوى الأدوية، حتى إنها تبطل قوى السموم القاتلة. وقال الشيخ عبد الكريم الخضير: بل الأصل أن يرقي نفسه كما كان النبي عليه الصلاة والسلام يفعل، وأيضًا لا مانع من فعل الأسباب المحسوسة، فيتظافر هذا وهذا، والكل إن شاء الله فيه خير، فيجمع بينهما ولا مانع. وقد ثبت بالتجارب آثار الاستجابة لسماع الرقية، ومنها:\n• يشعر بطمأنينة وسكينة ونعاس وهدوء @@"أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ"@@\n• قد ينام المرقي حال الرقية وذلك لا بأس به\n• يشعر بتحسن بشكل مباشر وملحوظ بعد الاستماع\n• تبدأ الأعراض تخف بالتدريج على فترة\n• إبطاء وتيرة تدهور الحالة المرضية أو إيقافه\n• يجد طبيبه العلاج الصحيح أو يُوفق المريض إلى طبيب حاذق\n• تتيسر العمليات الجراحية وتنجح\n• وهناك أمور أخرى غير الشكوى الرئيسية تتحسن بفضل الله',
          en: 'Ibn al-Qayyim ﵀ said: "The powers of ruqyah, supplications, and dhikr exceed the powers of medicine — to the point of neutralizing lethal poisons." Sheikh \'Abd al-Karim al-Khudayr said: "The default is that one performs ruqyah on himself as the Prophet ﷺ did; and there is no objection to also using physical means — both work together, and all of it is good inshallah." Signs of response to ruqyah include:\n• Feeling tranquility, calm, drowsiness, and peace — "Verily in the remembrance of Allah do hearts find rest"\n• The patient may fall asleep during ruqyah — this is fine\n• Feeling direct, noticeable improvement after listening\n• Symptoms gradually easing over time\n• Slowing or stopping the worsening of the condition\n• The patient finding the right treatment or being guided to a skilled doctor\n• Surgical procedures becoming easier and successful\n• Other issues besides the main complaint improving by Allah\'s grace',
        },
        highlight: HIGHLIGHT_VERSE,
      },
      {
        id: 'medical-conflict',
        question: {
          ar: 'هل يتعارض سماع الرقية الشرعية مع العلاج الطبي والأدوية؟',
          en: 'Does listening to Ruqyah conflict with medical treatment and medication?',
        },
        answer: {
          ar: 'بالتأكيد لا يتعارض، بل الرقية مع العلاج الطبي دافعة لزوال المرض بوتيرة أسرع من استخدام العلاج بلا رقية، واستخدام العلاج الطبي فيه اقتداء لأمر النبي صلى الله عليه وسلم بقوله: (تداووا عباد الله).',
          en: 'There is absolutely no conflict. In fact, combining ruqyah with medical treatment accelerates recovery more than using either alone. Using medical treatment follows the Prophet\'s ﷺ command: "Seek treatment, servants of Allah."',
        },
        highlight: HIGHLIGHT_VERSE,
      },
      {
        id: 'disbelief-in-ruqyah',
        question: {
          ar: 'بعض الناس غير مصدق بأن هناك نفعاً من الرقية الشرعية!!',
          en: "Some people don't believe Ruqyah has any benefit!",
        },
        answer: {
          ar: 'عرفت الرقى منذ القدم بأن فيها شفاء للأمراض بإذن الله، وقد قال الله في كتابه: @@"وَقِيلَ مَنْ رَاقٍ"@@. ذكر الطبري في تفسيره: من ذا يرقيه ليشفيه مما قد نزل به. وكانت الرقية مشهورة من قبل عهد النبوة – وقد أصابها ما كان منتشراً من شرك – حتى أن النبي صلى الله عليه وسلم قال: اعرِضوا عليَّ رُقاكُم، لا بَأسَ بالرُّقى ما لَم يَكُنْ فيه شِركٌ. رواه مسلم. فلو لم تكن لتنفع لما أقر النبي صلى الله عليه وسلم بالسليم من الشرك منها.',
          en: 'Ruqyah has been known since ancient times as a cure for ailments by Allah\'s permission. Allah says in His Book: "And it was said: who will cure him?" (75:27). Al-Tabari commented: "Who will recite over him to heal him from what has befallen him?" Ruqyah was well known before the era of prophethood — though it had been corrupted by shirk — so the Prophet ﷺ said: "Show me your ruqyah — there is no harm in ruqyah as long as it contains no shirk" (Muslim). Had it been of no benefit, the Prophet ﷺ would not have approved what was free of shirk from it.',
        },
        highlight: HIGHLIGHT_VERSE,
      },
      {
        id: 'no-improvement',
        question: {
          ar: 'ماذا أفعل إن لم أشعر بتحسن؟',
          en: "What should I do if I don't feel improvement?",
        },
        answer: {
          ar: '**هل يمكن أن يصرف الطبيب دواءً لا يؤثر في المريض؟** نعم. **هل له آثار جانبية سيئة؟** نعم. **هل يمكن أن يصرف الطبيب دواءً يؤثر سلباً على المريض؟** نعم. **هل هناك ضرر من الاستماع للرقية الشرعية؟** لا. **هل استماعي للرقية الشرعية ذهب سدى؟** لا.\n\n**أولاً:** لقد استمعت إلى آيات قرآنية وأدعية شرعية وأنت مأجور على سماعك.\n\n**ثانياً:** استماعك للرقية الشرعية وانتظار تأثيرها هو من الإيمان بالغيب، والإيمان بالغيب من أهم صفات المتقين، قال تعالى: @@"ذَٰلِكَ الْكِتَابُ لَا رَيْبَ فِيهِ هُدًى لِّلْمُتَّقِينَ الَّذِينَ يُؤْمِنُونَ بِالْغَيْبِ"@@.\n\n**ثالثاً:** الرقية سبب، والله سبحانه له أن يقبل السبب فينفع أو يرده فلا ينفع. أما الدعاء الذي في الرقية فلا يمكن أن يضيع، بل إما يُجاب في الحال، أو يُجاب ويتأخر لحكمة يعلمها الله، أو يغفر الله للمدعو، أو يرد الله بهذا الدعاء بلاءً أكبر كان مقدراً عليه، أو يدَّخر الله هذا الدعاء إلى يوم القيامة. قال رسول الله صلى الله عليه وسلم: (ما من رجل يدعو الله بدعاء إلا استجيب له، فإما أن يعجل له في الدنيا، وإما أن يدخر له في الآخرة، وإما أن يكفر عنه من ذنوبه بقدر ما دعا ما لم يدع بإثم أو قطيعة رحم).\n\n**رابعاً:** أكثر من الأسباب الشرعية الأخرى: المداومة على الصلوات في أوقاتها، وأذكار الصباح والمساء، والاستغفار، وصدقة السر.\n\n**خامساً:** انظر إلى آثار الاستماع للرقى واشكر لله واحمده حتى يزيدك من أثر الاستجابة.',
          en: "**Can a doctor prescribe a medicine that has no effect?** Yes. **Can it have side effects?** Yes. **Can it harm the patient?** Yes. **Does listening to Islamic ruqyah cause any harm?** No. **Did your listening go to waste?** No.\n\n**First:** You listened to Quranic verses and prophetic supplications and you are rewarded for that listening.\n\n**Second:** Listening to ruqyah and awaiting its effect is itself a manifestation of belief in the unseen — one of the most important qualities of the God-fearing: \"That is the Book about which there is no doubt, a guidance for those who fear Allah — who believe in the unseen\" (2:1-3).\n\n**Third:** Ruqyah is a means, and Allah may accept or decline any means. As for the supplication within it, it can never be wasted: it is either answered immediately, answered later by His wisdom, results in forgiveness, repels a greater calamity, or is stored for the Day of Judgment. The Prophet ﷺ said: \"There is no man who supplicates to Allah except that he is responded to: either it is hastened for him in this world, stored for him in the hereafter, or sins are forgiven from him in proportion to what he supplicated.\"\n\n**Fourth:** Increase other spiritual means — maintaining prayers on time, morning and evening adhkar, seeking forgiveness, and giving charity in secret.\n\n**Fifth:** Reflect on the signs of response you may have noticed, thank Allah, and praise Him — so that He increases your response.",
        },
        highlight: HIGHLIGHT_VERSE,
      },
      {
        id: 'worship-replaces-ruqyah',
        question: {
          ar: 'هل من الممكن أن يقوم التزام الشخص بالطاعات مقام الرقية؟',
          en: "Can a person's commitment to worship replace Ruqyah?",
        },
        answer: {
          ar: 'كل ما كنت من الله أقرب كنت لنفسك أحفظ، قال تعالى في حديث قدسي: **(ولا يزال عبدي يتقرب إليَّ بالنوافل حتى أحبه، فإن أحببته كنت سمعه الذي يسمع به وبصره الذي يبصر به ويده التي يبطش بها ورجله التي يمشي بها، ولئن سألني لأعطينَّه ولئن استعاذني لأعيذنَّه)**. قال ابن القيم رحمه الله: وكم من سحر بطل وكم من عين ذهبت بسبب سياحة عقلك في معاني الآيات ورطوبة لسانك بذكر الله وكثرة صيامك وزيادة طاعاتك. فحياتك مع الله ولله كفيلة بإصلاح ما فسد بسبب أعين الناس وسحرهم.',
          en: 'The closer you are to Allah, the more protected you are. Allah says in a hadith qudsi: **"My servant continues to draw near to Me with supererogatory acts until I love him. When I love him, I become his hearing with which he hears, his sight with which he sees, his hand with which he strikes, and his leg with which he walks. If he asks Me, I will give him; if he seeks My protection, I will protect him."** Ibn al-Qayyim ﵀ said: "How much magic was nullified and how many evil eyes were repelled through your mind contemplating the meanings of the verses, your tongue being moist with Allah\'s remembrance, your frequent fasting, and your increased acts of worship. Your life with Allah and for Allah is sufficient to repair what was corrupted by the evil eyes and magic of people."',
        },
        highlight: HIGHLIGHT_VERSE,
      },
      {
        id: 'recitation-vs-supplication',
        question: {
          ar: 'هل الأفضل القراءة على المريض أم الدعاء له؟',
          en: 'Is it better to recite Ruqyah on the patient or make supplication for them?',
        },
        answer: {
          ar: 'الأفضل هو الرقية الشرعية الكاملة، لأنها تحتوي على:\n• قراءة آيات الرقية من القرآن\n• الرقية من السنة النبوية\n• التعظيم لله ودعائه بأسمائه وصفاته\n• الدعاء للمريض وأهله\n• ختم الرقية بالصلاة على النبي والحمد لله',
          en: 'The best is the complete Islamic ruqyah, because it contains:\n• Recitation of Quranic ruqyah verses\n• Ruqyah from the Prophetic Sunnah\n• Glorifying Allah and supplicating through His Names and Attributes\n• Supplication for the patient and their family\n• Closing the ruqyah with prayers upon the Prophet and praise of Allah',
        },
        highlight: HIGHLIGHT_VERSE,
      },
      {
        id: 'non-muslim-benefit',
        question: {
          ar: 'هل الرقية الشرعية تفيد غير المسلم؟',
          en: 'Does Islamic Ruqyah benefit non-Muslims?',
        },
        answer: {
          ar: 'نعم، الرقية بالقرآن قد تُفيد غير المسلم بإذن الله، وقد ثبت ذلك في حادثة الصحابي الذي رقى سيد قبيلة مشركة باستخدام الفاتحة فشُفي، وأجازه النبي صلى الله عليه وسلم على ذلك. ومن الناحية العملية كذلك، فُتح الإسلام لكثيرين من خلال ما شهدوه من أثر الرقية. غير أن درجة الاستجابة مرتبطة بالإيمان واليقين من حيث الجملة، فالمؤمن الموحد أكثر استعداداً للاستفادة. ومن أسلم بسبب الرقية أو تأثر بها نحو الإسلام كان أجره عند الله عظيماً.',
          en: 'Yes, Ruqyah with the Quran may benefit non-Muslims by Allah\'s permission, as established by the companion\'s narration of reciting Surah Al-Fatiha over a polytheist tribal leader who was then healed — an action the Prophet ﷺ approved of. Practically speaking, many have been guided to Islam through witnessing the effects of Ruqyah. However, the degree of response is generally connected to faith and certainty — a believing monotheist is more receptive to its benefit. Whoever embraces Islam due to Ruqyah or is moved toward it has an immense reward with Allah.',
        },
        highlight: HIGHLIGHT_VERSE,
      },
    ],
  },
  {
    id: 'recorded-ruqyah',
    title: { ar: 'الرقية الشرعية المسجلة', en: 'Recorded Islamic Ruqyah' },
    data: [
      {
        id: 'recorded-benefit',
        question: {
          ar: 'هل يمكن الانتفاع من الرقية المسجلة؟',
          en: 'Can one benefit from recorded Ruqyah?',
        },
        answer: {
          ar: 'نعم، أفاد آلاف المرضى بتحسن ملحوظ أو شفاء تام من خلال الاستماع المنتظم للرقية المسجلة. وهذا منطقي شرعاً، فكلام الله تعالى نافع في كل حال، سواء أُلقي مباشرة على المريض أم استمع إليه من تسجيل. وقد أكد كثير من علماء الرقية أن فائدتها لا تختلف جوهرياً في الحالتين، بشرط الحضور التام وخشوع القلب والنية الصادقة. والتطور التقني جعل الرقية المسجلة أداة فاعلة للوصول إلى من لا يجد راقياً في بلده، وللمداومة في الأوقات المناسبة كالليل والسحر.',
          en: 'Yes, thousands of patients have reported notable improvement or complete healing through regular listening to recorded Ruqyah. This is logically consistent in Islamic scholarship — Allah\'s words are beneficial in all circumstances, whether recited directly on the patient or listened to from a recording. Many scholars of Ruqyah have confirmed that the benefit is not fundamentally different in either case, provided the listener is fully present, humble of heart, and sincere in intention. Modern technology has made recorded Ruqyah an effective tool for reaching those without access to a healer, and for maintaining the practice at optimal times such as night and the pre-dawn hours.',
        },
        highlight: HIGHLIGHT_VERSE,
      },
      {
        id: 'any-recording',
        question: {
          ar: 'هل أي رقية مسجلة تنفع؟',
          en: 'Does any recorded Ruqyah provide benefit?',
        },
        answer: {
          ar: 'لا، ليست كل رقية مسجلة نافعة، بل قد يكون بعضها ضاراً. الرقية الصحيحة يجب أن تكون من القرآن الكريم أو من الأدعية والأذكار النبوية المأثورة، مقروءة بصوت واضح وتجويد سليم من راقٍ موثوق معروف بصلاحه وعلمه الشرعي. ينبغي تجنب: الرقى المصحوبة بموسيقى أو إيقاعات، والرقى المجهولة المصدر، وما يشتمل على طلاسم أو ألفاظ غير مفهومة، وما يدّعي أصحابه أنهم يستعينون بالجن أو يعالجون بهم. احرص دائماً على مصادر موثوقة وعلماء معتمدين حتى لا تقع فريسة للدجل والشعوذة.',
          en: 'Not every recording is beneficial — some may even be harmful. Valid Ruqyah must come from the Quran or established prophetic supplications and adhkar, recited with clear pronunciation and correct Tajweed by a trusted healer known for their piety and Islamic knowledge. Avoid: Ruqyah accompanied by music or rhythmic beats, recordings of unknown origin, anything containing unintelligible incantations or symbols, and those whose practitioners claim to use or heal through jinn. Always rely on trusted and verified sources to avoid falling prey to charlatans and sorcerers who exploit the sick.',
        },
        highlight: HIGHLIGHT_VERSE,
      },
      {
        id: 'seeking-ruqyah',
        question: {
          ar: 'هل سماع الرقية المسجلة يُعتبر من طلب الرقية؟',
          en: 'Is listening to recorded Ruqyah considered seeking Ruqyah?',
        },
        answer: {
          ar: 'الراجح أن سماع الرقية المسجلة لا يدخل تحت النهي عن طلب الرقية الوارد في حديث السبعين ألفاً الذين يدخلون الجنة بغير حساب، لأن المقصود بالنهي طلب الراقي الحي قبل تحقق الضرورة. أما سماع الرقية المسجلة فهو في حكم التداوي المشروع الذي يأمر به الإسلام، ولا يُنقص من درجة التوكل على الله طالما كان القلب معلقاً بالله وحده دون اعتقاد التأثير من الكلام ذاته. وقد أفتى غير واحد من أهل العلم المعاصرين بهذا ولم يروا فيه حرجاً.',
          en: "The stronger view is that listening to recorded Ruqyah does not fall under the prohibition of seeking Ruqyah mentioned in the hadith of the seventy thousand who enter Paradise without reckoning — because that prohibition refers to seeking a live healer before necessity arises. Listening to recorded Ruqyah is considered lawful treatment that Islam encourages, and it does not diminish one's reliance on Allah as long as the heart is attached to Allah alone without attributing the effect to the words themselves. Numerous contemporary Islamic scholars have issued fatwas confirming this and found no objection to it.",
        },
        highlight: HIGHLIGHT_VERSE,
      },
      {
        id: 'recitation-without-blowing',
        question: {
          ar: 'هل تجوز القراءة بلا نفث؟',
          en: 'Is recitation without blowing permissible?',
        },
        answer: {
          ar: 'نعم تجوز القراءة دون نفث، فالنفث والتفل سنة مستحبة وليست شرطاً لصحة الرقية ولا ركناً فيها. وقد ثبت أن النبي صلى الله عليه وسلم كان ينفث أحياناً على المريض وأحياناً لا، وهذا يدل على الاستحباب لا الوجوب. أما القراءة وحدها فنافعة بإذن الله، وقد شُفي بها كثيرون دون نفث. والرقية المسجلة مثال جلي على ذلك، إذ لا نفث فيها وقد ثبت نفعها لآلاف المرضى. الجوهر في الرقية هو كلام الله والنية الصادقة والتوكل عليه سبحانه لا الطقوس الشكلية.',
          en: 'Yes, recitation without blowing is permissible. Blowing (nafth) is a recommended Sunnah, not a pillar or condition for the validity of Ruqyah. It is established that the Prophet ﷺ sometimes blew upon patients and sometimes did not, indicating its recommendation rather than obligation. Recitation alone is beneficial by Allah\'s permission, and many have been healed through it without blowing. Recorded Ruqyah is a clear example — it contains no blowing yet has proven beneficial to thousands of patients. The essence of Ruqyah is Allah\'s words, sincere intention, and reliance upon Him — not the outward formalities.',
        },
        highlight: HIGHLIGHT_VERSE,
      },
    ],
  },
  {
    id: 'healer',
    title: { ar: 'الراقي الشرعي', en: 'The Islamic Healer' },
    data: [
      {
        id: 'self-vs-healer',
        question: {
          ar: 'هل قراءة المريض على نفسه أنفع من الراقي الشرعي؟',
          en: 'Is self-Ruqyah more beneficial than having a healer perform it?',
        },
        answer: {
          ar: 'في كثير من الأحيان قراءة المريض على نفسه أنفع وأقوى من الراقي الخارجي، لأن المريض أصدق في إقباله على الله وأشد اضطراراً، والاضطرار يفتح باب الإجابة. وقد ورد: "أفضل الرقية رقية النفس". ولكن إذا كان المريض ضعيفاً أو مرهقاً أو لم يحسن الرقية، أو كانت الحالة شديدة تحتاج لراقٍ ذي خبرة، فالراقي الموثوق أنفع له حينئذ. والجمع بين الأمرين هو الأكمل: يرقي الراقي المريض جلسات منتظمة، ثم يواصل المريض رقية نفسه بالأذكار والأدعية والاستماع المنتظم.',
          en: 'In many cases, self-Ruqyah is more powerful than having an external healer, because the patient is most sincere in their turning to Allah and most desperately in need — and desperation opens the door to answered supplication. It is narrated: "The best Ruqyah is self-Ruqyah." However, when the patient is weak, exhausted, or unfamiliar with Ruqyah, or when the condition is severe and requires an experienced healer, a trusted healer is more beneficial at that point. The most complete approach combines both: the healer conducts regular sessions, while the patient continues self-Ruqyah through adhkar, supplications, and regular listening.',
        },
        highlight: HIGHLIGHT_VERSE,
      },
      {
        id: 'previous-ruqyah-no-effect',
        question: {
          ar: 'قرأ عليَّ رقاة من قبل ولم أتأثر. فلماذا أستمع الآن لرقية مسجلة؟',
          en: 'A healer recited Ruqyah on me before with no effect. Why should I listen to recorded Ruqyah?',
        },
        answer: {
          ar: 'عدم التأثر بالرقاة السابقين قد يعود لعدة أسباب: ضعف الراقي نفسه أو قصوره في العلم والتخصص، أو اختيار الوقت والبيئة غير المناسبين، أو عدم الاستعداد النفسي والقلبي من المريض. والرقية المسجلة تختلف في أنك تتحكم في وقتها وظروفها: تستطيع الاستماع في حالة هدوء ذهني وخشوع قلبي، في الليل أو السحر، وبصوت مناسب، وبتكرار منتظم يومي. كما أن المداومة على الاستماع لفترة كافية قد تُعوض ما قد يفتقر إليه الراقي من حيث القوة الروحية. جرّب وواظب لمدة لا تقل عن أربعين يوماً ولا تيأس.',
          en: 'Lack of effect from previous healers may stem from several causes: the healer\'s own weakness or insufficient knowledge and specialization, choosing an unsuitable time or environment, or the patient\'s own insufficient mental and spiritual preparation. Recorded Ruqyah differs in that you control the timing and conditions: you can listen in mental calm and heart-felt humility, at night or the pre-dawn hour, at an appropriate volume, with regular daily repetition. Sustained daily listening over a sufficient period can also compensate for what a healer may lack in spiritual strength. Try it consistently for no less than forty days before drawing any conclusions, and do not despair.',
        },
        highlight: HIGHLIGHT_VERSE,
      },
      {
        id: 'identify-sorcerer',
        question: {
          ar: 'هل يمكن معرفة الساحر؟',
          en: 'Can the sorcerer be identified?',
        },
        answer: {
          ar: 'يصعب جداً التحقق من هوية الساحر بطرق شرعية موثوقة، وما يدّعيه بعض من يُسمّون أنفسهم رقاة من معرفة الساحر باسمه أو صفته هو في الغالب ضرب من الكذب أو التخمين أو استعانة بجن محرمة. وادعاء معرفة الساحر يفتح باباً خطيراً للاتهام الظالم وتفريق الأسر وإيقاع العداوات بين الناس. السنة النبوية لم تُرشد المريض إلى البحث عن الساحر بل إلى التداوي والتحصين والتوكل على الله. الأجدى هو التركيز على العلاج الشرعي والتحصين وإصلاح القلب، لا استنزاف الطاقة والمال في البحث عمن أصابك.',
          en: 'Identifying a sorcerer through reliable Islamic means is extremely difficult. What some self-proclaimed healers claim — knowing the sorcerer by name or description — is mostly fabrication, guesswork, or involvement of forbidden jinn. Claiming to identify the sorcerer opens a dangerous door to unjust accusations, family separations, and deep enmities between people. The Prophetic tradition did not guide the patient to search for the sorcerer but to seek treatment, fortification, and reliance on Allah. The wiser course is to focus entirely on Islamic treatment, protective adhkar, and purification of the heart — not to exhaust one\'s energy and wealth searching for whoever caused the affliction.',
        },
        highlight: HIGHLIGHT_VERSE,
      },
      {
        id: 'identify-evil-eye',
        question: {
          ar: 'هل يمكن معرفة العائن؟',
          en: 'Can the one who cast the evil eye be identified?',
        },
        answer: {
          ar: 'معرفة العائن أقل تعقيداً من معرفة الساحر من الناحية العلمية، إذ قد تظهر القرينة واضحة حين تبدأ الأعراض فور اللقاء بشخص بعينه. لكن ينبغي توخي الحذر الشديد في إطلاق الاتهام، والأصل في المسلم حسن الظن. إذا تحقق الظن المعقول بأن شخصاً ما أصاب بالعين، يُطلب منه الوضوء أو الاغتسال ليُصَبَّ ماؤه على المصاب، كما ورد في السنة النبوية الصحيحة. وفي أغلب الحالات يكفي الاكتفاء بالرقية الشرعية وأذكار التحصين دون الاضطرار لتحديد هوية العائن، لأن العلاج لا يستلزم معرفته.',
          en: 'Identifying the person who cast the evil eye is less complicated than identifying a sorcerer, as the indication may be clear when symptoms begin immediately after meeting a specific person. However, extreme caution is required before making accusations, and the default toward a Muslim is to think well of them. If there is reasonable certainty that someone cast the evil eye, they may be asked to perform ablution or bathing whose water is then poured over the afflicted person, as mentioned in authentic prophetic narrations. In most cases, Ruqyah and protective adhkar suffice without needing to identify the person who cast the evil eye, since the treatment does not require knowing them.',
        },
        highlight: HIGHLIGHT_VERSE,
      },
    ],
  },
  {
    id: 'qareen',
    title: { ar: 'القرين', en: 'The Qareen' },
    data: [
      {
        id: 'what-is-qareen',
        question: {
          ar: 'ما هو القرين؟',
          en: 'What is the Qareen (companion jinn)?',
        },
        answer: {
          ar: 'القرين هو الجني القرين المصاحب لكل إنسان منذ ولادته، وقد ثبت وجوده في السنة النبوية الصحيحة. قال النبي صلى الله عليه وسلم: "ما منكم من أحد إلا وقد وُكّل به قرينه من الجن". وقرين النبي صلى الله عليه وسلم أسلم فلم يأمره إلا بخير. أثر القرين يختلف من شخص لآخر تبعاً لقوة إيمانه وتحصينه بالأذكار، فكلما قوي إيمان المرء وأكثر من ذكر الله ضعف تأثير قرينه عليه وانحسرت وسوسته. القرين يعلم نقاط الضعف في صاحبه ويستغلها، مما يجعل التحصين الدائم بالأذكار أمراً بالغ الأهمية.',
          en: "The Qareen is the companion jinn assigned to every human from birth, confirmed by authentic prophetic narrations. The Prophet ﷺ said: 'There is not one of you who does not have a companion from the jinn assigned to him.' The Prophet's own Qareen embraced Islam and would only command him to good. The Qareen's influence varies from person to person based on the strength of their faith and protection through adhkar — the stronger one's faith and the more one remembers Allah, the weaker the Qareen's influence and the more its whispering recedes. The Qareen knows its companion's weaknesses and exploits them, making continuous protective dhikr of paramount importance.",
        },
        highlight: HIGHLIGHT_VERSE,
      },
      {
        id: 'qareen-effect',
        question: {
          ar: 'هل هناك من أثر للقرين؟',
          en: 'Does the Qareen have any effect?',
        },
        answer: {
          ar: 'نعم، للقرين أثر حقيقي على الإنسان يتمثل في الوسوسة بالمعاصي والشهوات، وتزيين السوء في النفس، وإثارة الشكوك والخواطر الفاسدة، وقد يُضخّم القرين المشاعر السلبية كالخوف والحزن والغضب والقلق. والتحصين بأذكار الصباح والمساء وآية الكرسي وسورتَي البقرة والملك يُضعف هذا الأثر تضعيفاً كبيراً. كما أن إدامة الوضوء والإكثار من الذكر وتلاوة القرآن يُفقد القرين قدرته على التأثير تدريجياً. والمؤمن القوي يأنس بذكر الله ويبتعد عن الغفلة التي هي مدخل القرين ومنفذه للنفس.',
          en: "Yes, the Qareen has a real effect on the human, manifesting through whispering toward sins and desires, beautifying evil within the soul, stirring doubts and corrupt thoughts. The Qareen may also amplify negative emotions such as fear, sadness, anger, and anxiety. Regular recitation of the morning and evening adhkar, Ayat al-Kursi, and Surahs Al-Baqarah and Al-Mulk significantly weakens this influence. Maintaining wudhu, frequent dhikr, and Quran recitation gradually diminishes the Qareen's ability to affect its companion. The strong believer finds comfort in the remembrance of Allah and distances themselves from heedlessness — the very entry point through which the Qareen reaches the soul.",
        },
        highlight: HIGHLIGHT_VERSE,
      },
    ],
  },
  {
    id: 'clinic',
    title: { ar: 'المشفى القرآني', en: 'The Quranic Clinic' },
    data: [
      {
        id: 'youtube-availability',
        question: {
          ar: 'هل توجد هذه الرقى على يوتيوب؟',
          en: 'Are these ruqyah recordings available on YouTube?',
        },
        answer: {
          ar: 'قد تتوفر بعض الرقى على منصة يوتيوب، غير أن المشفى القرآني يُقدم تجربة مختلفة تماماً لا تتوفر في المنصات العامة. ففيه تصنيف دقيق للرقى وفقاً للمرض والحالة، وبروتوكولات علاجية منهجية متكاملة، وإمكانية الاستماع بدون إنترنت، وتتبع مستوى التقدم، وتنبيهات تذكيرية تُساعد على المواظبة، وكذلك محتوى خاضع للمراجعة الشرعية والعلمية. المشفى القرآني يُحوّل الرقية من تجربة عشوائية متفرقة إلى برنامج علاجي منظم محترف، بعيداً عن الفوضى الرقمية والمحتوى المشكوك فيه.',
          en: 'Some recordings may be available on YouTube, but the Quranic Clinic offers a fundamentally different experience unavailable on public platforms: precise classification of Ruqyah by disease and condition, comprehensive systematic treatment protocols, offline listening capability, progress tracking, reminder notifications that help maintain consistency, and content subject to scholarly Islamic review. The Quranic Clinic transforms Ruqyah from a scattered, random experience into a professional, organized treatment program — far from the digital chaos and questionable content that populate open platforms.',
        },
        highlight: HIGHLIGHT_VERSE,
      },
      {
        id: 'repetition-count',
        question: {
          ar: 'هل تحديد عدد لقراءة الآيات عليه دليل شرعي؟',
          en: 'Is there religious evidence for a specific number of verse repetitions?',
        },
        answer: {
          ar: 'لا يوجد نص شرعي ثابت يُحدد عدداً معيناً لتكرار الآيات القرآنية في الرقية. وعليه فإن الأعداد المحددة في التطبيق مستندة إلى الاجتهاد العلمي والتجربة العملية المتراكمة من حالات كثيرة، وليست حكماً شرعياً ثابتاً لا يجوز تجاوزه. ولا حرج في تجاوز هذه الأعداد أو تقليصها حسب حاجة المريض وطاقته وظروفه. الأهم من العدد هو المواظبة والاستمرار والحضور القلبي، فلا يُبالَغ في الالتزام بعدد معين على حساب جودة الاستماع وخشوع القلب الذي هو روح الرقية ومفتاح الشفاء.',
          en: 'There is no established religious text specifying a particular number of repetitions for Quranic verses in Ruqyah. Therefore, the numbers specified in the app are based on scholarly reasoning and accumulated practical experience from many cases — they are not fixed religious rulings that cannot be exceeded. There is no harm in exceeding or reducing them based on the patient\'s need, capacity, and circumstances. More important than any number is consistency, continuity, and heart-presence. One should not become so rigidly bound to a specific count that it comes at the expense of the quality of listening and humility of heart — which is the soul of Ruqyah and the key to healing.',
        },
        highlight: HIGHLIGHT_VERSE,
      },
      {
        id: 'disease-classification',
        question: {
          ar: 'هل طريقة تصنيف الرقى على حسب الأمراض لها أصل؟',
          en: 'Does classifying Ruqyah by disease type have religious basis?',
        },
        answer: {
          ar: 'التصنيف بحسب الأمراض اجتهاد علمي مقبول يُيسّر على المريض الانتفاع من الرقية دون الحاجة لخبرة مسبقة. وهذا المنهج له شواهد في الموروث العلمي الإسلامي؛ إذ أشار ابن القيم رحمه الله في زاد المعاد إلى أن آيات وأدعية بعينها أجدى لأمراض بعينها استناداً للتجربة والممارسة. ولا حرج في هذا التصنيف ما دام الأساس قرآناً وسنة صحيحة، وما دام لا يُصوَّر على أنه حكم شرعي قاطع مُلزم. وهو في جوهره خدمة للمريض وتسهيل للانتفاع من كتاب الله الذي جعله الله شفاءً ورحمةً للمؤمنين.',
          en: 'Classifying Ruqyah by disease type is an acceptable scholarly endeavor that enables patients to benefit without needing prior expertise. This approach has precedents in Islamic scholarly heritage — Ibn al-Qayyim noted in Zad al-Ma\'ad that certain verses and supplications are particularly effective for certain conditions based on experience and practice. There is no objection to this classification as long as it is grounded in the Quran and authentic Sunnah, and not presented as a definitive, binding religious ruling. At its core, it is a service to the patient and a means of facilitating benefit from Allah\'s Book — which He made a healing and mercy for the believers.',
        },
        highlight: HIGHLIGHT_VERSE,
      },
      {
        id: 'why-quranic-clinic',
        question: {
          ar: 'لماذا المشفى القرآني؟',
          en: 'Why the Quranic Clinic?',
        },
        answer: {
          ar: 'المشفى القرآني جاء استجابةً لحاجة حقيقية لدى ملايين المسلمين الذين يُعانون من أمراض السحر والعين والمس ولا يجدون طريقاً صحيحاً للعلاج، أو يقعون ضحية الدجالين والمشعوذين. يجمع المشفى بين العلم الشرعي الموثوق والتقنية الحديثة لتقديم تجربة علاجية متكاملة وميسّرة في متناول الجميع. يحرص على سلامة العقيدة وصحة الرقية، ويُوفّر بيئة آمنة نظيفة بعيدة عن الشعوذة والبدعة والاستغلال المادي، ليكون المرجع الأمين الذي يستطيع كل مسلم الوثوق به في رحلته نحو الشفاء.',
          en: 'The Quranic Clinic was established in response to a genuine need among millions of Muslims who suffer from afflictions of sorcery, evil eye, and jinn possession but cannot find a correct path to treatment, or fall victim to charlatans and sorcerers. It combines reliable Islamic knowledge with modern technology to provide a comprehensive, accessible healing experience within everyone\'s reach. It safeguards creedal integrity and authentic Ruqyah, offering a clean, safe environment free from witchcraft, religious innovation, and financial exploitation — to be the trusted reference every Muslim can rely on in their journey toward healing.',
        },
        highlight: HIGHLIGHT_VERSE,
      },
      {
        id: 'why-app-not-social',
        question: {
          ar: 'لماذا تطبيق المشفى القرآني؟ لماذا لا يكون صفحة على الفيس بوك أو حساب على أي موقع تواصل أو موقع إلكتروني؟',
          en: 'Why a Quranic Clinic app? Why not a Facebook page or social media account?',
        },
        answer: {
          ar: 'التطبيق يوفر ما لا تستطيع تقديمه منصات التواصل الاجتماعي: الاستماع بدون إنترنت ضروري للمريض في الليل والأماكن ذات الاتصال الضعيف، وتتبع التقدم والجلسات يُعين على الانتظام، والتنبيهات التذكيرية تُحافظ على المواظبة التي هي شرط النجاح، والخصوصية التامة التي يفتقر إليها الفيس بوك، وكذلك منع الاشتتات والمحتوى الدخيل الذي يقطع تجربة الاستماع. التطبيق يُحوّل الرقية من محتوى متناثر في فيد متقطع إلى تجربة علاجية منهجية متكاملة. إنه الفرق بين قراءة وصفة طبية على فيس بوك وبين مستشفى حقيقي متكامل الخدمات.',
          en: "The app provides what social media platforms cannot: offline listening essential for patients at night or in areas with poor connectivity; session tracking and history to help maintain regularity; reminder notifications that preserve consistency — the key to success; complete privacy that Facebook lacks; and freedom from distraction and unrelated content that interrupts the listening experience. The app transforms Ruqyah from scattered content in a fragmented feed into a comprehensive, systematic healing experience with a dedicated interface. It is the difference between reading a medical prescription on Facebook and actually visiting a fully equipped, professional hospital.",
        },
        highlight: HIGHLIGHT_VERSE,
      },
    ],
  },
];
