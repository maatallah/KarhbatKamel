import { Language } from '../types';

export interface TranslationDictionary {
  appName: string;
  appSubtitle: string;
  cockpit: string;
  sdvsTab: string;
  ignitionTab: string;
  telemetryTab: string;
  libraryTab: string;
  blueprintTab: string;
  notificationDrawer: string;

  // Cockpit
  speedKmH: string;
  speedMph: string;
  speedometer: string;
  sdvsBoost: string;
  cabinNoise: string;
  baseVolume: string;
  effectiveVolume: string;
  nowPlaying: string;
  carMode: string;
  stealthMode: string;
  roadNoiseComp: string;
  drivingSimulator: string;
  throttle: string;
  presets: string;
  presetIdle: string;
  presetCity: string;
  presetHighway: string;
  presetAutobahn: string;

  // SDVS Tab
  sdvsTitle: string;
  sdvsSubtitle: string;
  sdvsEnable: string;
  curveType: string;
  curveLinear: string;
  curveExponential: string;
  curveSCurve: string;
  minSpeed: string;
  maxSpeed: string;
  maxBoost: string;
  smoothing: string;
  gpsStatus: string;
  gpsActive: string;
  gpsSimulated: string;
  gpsAccuracy: string;
  useLiveGps: string;
  useSimulator: string;

  // Ignition Tab
  ignitionTitle: string;
  ignitionSubtitle: string;
  keyState: string;
  engineOff: string;
  accPower: string;
  ignitionOn: string;
  engineRunning: string;
  autoPlayOnIgnition: string;
  autoPauseOnCutoff: string;
  crankDelay: string;
  cutoffCountdown: string;
  powerSource: string;
  batteryStatus: string;
  charging: string;
  discharging: string;
  simulateCutoff: string;
  simulateStart: string;

  // Telemetry Tab
  telemetryTitle: string;
  telemetrySubtitle: string;
  totalPlayTime: string;
  averageSpeed: string;
  topSpeed: string;
  peakBoostApplied: string;
  ignitionCycles: string;
  underrunEvents: string;
  soLoaderBenchmark: string;
  serviceStartupTime: string;
  eventLogs: string;
  exportJson: string;
  clearLogs: string;
  simulateCrash: string;
  crashRecovered: string;

  // Media Library
  mediaTitle: string;
  mediaSubtitle: string;
  importAudioFiles: string;
  dropFilesHere: string;
  builtInTracks: string;
  importedTracks: string;
  trackDuration: string;
  bitrateQuality: string;

  // Blueprint Tab
  blueprintTitle: string;
  blueprintSubtitle: string;
  copyCode: string;
  copied: string;
  downloadZip: string;

  // General
  active: string;
  inactive: string;
  seconds: string;
  decibels: string;
}

export const TRANSLATIONS: Record<Language, TranslationDictionary> = {
  en: {
    appName: 'Auto Music Player (AMP)',
    appSubtitle: 'Automotive Embedded Audio Engine • Android SDK 34 / API 30',
    cockpit: 'Infotainment Cockpit',
    sdvsTab: 'Speed Volume (SDVS)',
    ignitionTab: 'Ignition & Power',
    telemetryTab: 'Telemetry Blackbox',
    libraryTab: 'Media Packaging',
    blueprintTab: 'Native Architecture',
    notificationDrawer: 'Android Foreground Service',

    speedKmH: 'km/h',
    speedMph: 'mph',
    speedometer: 'SPEEDOMETER',
    sdvsBoost: 'SDVS BOOST',
    cabinNoise: 'EST. CABIN NOISE',
    baseVolume: 'Base User Volume',
    effectiveVolume: 'Effective Cabin Gain',
    nowPlaying: 'NOW PLAYING',
    carMode: 'High Contrast HUD',
    stealthMode: 'Night Drive Stealth',
    roadNoiseComp: 'Cabin Noise Acoustic Masking',
    drivingSimulator: 'Speed Simulation Loop',
    throttle: 'Throttle Accelerator',
    presets: 'Speed Presets',
    presetIdle: 'Idling (0 km/h)',
    presetCity: 'City (45 km/h)',
    presetHighway: 'Highway (105 km/h)',
    presetAutobahn: 'Autobahn (155 km/h)',

    sdvsTitle: 'Speed-Dependent Volume Scaling (SDVS)',
    sdvsSubtitle: 'Real-time automated audio output normalization reacting to physical automotive metrics to combat road/wind drag',
    sdvsEnable: 'Enable SDVS Dynamic DSP Gain',
    curveType: 'Acoustic Curve Model',
    curveLinear: 'Linear Stepping (+dB / km/h)',
    curveExponential: 'Exponential Loudness (Acoustic Noise Power)',
    curveSCurve: 'Sigmoid S-Curve (Gentle City / Highway Peak)',
    minSpeed: 'Activation Speed Threshold',
    maxSpeed: 'Max Gain Target Speed',
    maxBoost: 'Ceiling Gain Boost',
    smoothing: 'Low-Pass Filter Alpha (Anti-Shock)',
    gpsStatus: 'Speed Tracking Engine',
    gpsActive: 'Live Native GPS (LocationManager)',
    gpsSimulated: 'Vehicle Bus Simulator (OBD-II Loop)',
    gpsAccuracy: 'GPS Signal Accuracy',
    useLiveGps: 'Use Device Hardware GPS',
    useSimulator: 'Use Automotive Cruise Simulator',

    ignitionTitle: 'Ignition Power State Broadcast Receiver',
    ignitionSubtitle: 'Hardware integration monitoring ACTION_POWER_CONNECTED / DISCONNECTED and ignition key switches',
    keyState: 'Ignition Key Cylinder State',
    engineOff: 'LOCK / OFF',
    accPower: 'ACC (Accessory)',
    ignitionOn: 'ON (Ignition Contact)',
    engineRunning: 'START / RUN (Alternator)',
    autoPlayOnIgnition: 'Auto-Play on Engine Start',
    autoPauseOnCutoff: 'Auto-Pause on Engine Cutoff',
    crankDelay: 'Starter Motor Crank Delay',
    cutoffCountdown: 'Power-Loss Pause Countdown',
    powerSource: 'Vehicle Power Rail',
    batteryStatus: 'Alternator / Charging Status',
    charging: '12V Alternator Charging (Ignition Alive)',
    discharging: 'Battery Discharge (Engine Off)',
    simulateCutoff: 'Simulate Key Cutoff',
    simulateStart: 'Simulate Ignition Crank',

    telemetryTitle: 'Telemetry Statistics & Diagnostics Blackbox',
    telemetrySubtitle: 'Offline async persistence collecting runtime playback performance, SoLoader benchmarks, and JNI startup boundaries',
    totalPlayTime: 'Total Audio Playback Time',
    averageSpeed: 'Mean Cruising Velocity',
    topSpeed: 'Peak Velocity Recorded',
    peakBoostApplied: 'Max SDVS Gain Applied',
    ignitionCycles: 'Engine Ignition Cycles',
    underrunEvents: 'Audio Buffer Underruns',
    soLoaderBenchmark: 'SoLoader.init() JNI Bridge Time',
    serviceStartupTime: 'PlaybackService Foreground Init',
    eventLogs: 'Blackbox Event Stream',
    exportJson: 'Export Diagnostic JSON',
    clearLogs: 'Flush Local Storage',
    simulateCrash: 'Simulate System Kill & Recovery',
    crashRecovered: 'Crash Boundary Handled Safely - State Restored',

    mediaTitle: 'Offline Media Packaging & Asset Discovery',
    mediaSubtitle: 'Multi-threaded cataloging scanning sandboxed storage for standalone automotive audio packages',
    importAudioFiles: 'Import Offline Audio Files',
    dropFilesHere: 'Drag & drop MP3, WAV, FLAC, OGG files or click to browse',
    builtInTracks: 'Pre-Packaged Automotive Soundtracks',
    importedTracks: 'Locally Sandboxed Tracks (IndexedDB)',
    trackDuration: 'Duration',
    bitrateQuality: 'Stream Resolution',

    blueprintTitle: 'Native Android Architecture & Kotlin Blueprint',
    blueprintSubtitle: 'Complete implementation of Bridgeless TurboModules, SoLoader classloading, and Foreground Service lifecycle',
    copyCode: 'Copy Source Code',
    copied: 'Copied to Clipboard!',
    downloadZip: 'Download Codebase Blueprint (.zip)',

    active: 'ACTIVE',
    inactive: 'STANDBY',
    seconds: 'sec',
    decibels: 'dB',
  },

  ar: {
    appName: 'مشغل الموسيقى التلقائي (AMP)',
    appSubtitle: 'محرك الصوت المدمج للمركبات • أندرويد SDK 34 / API 30',
    cockpit: 'لوحة القيادة والمعلومات',
    sdvsTab: 'مستوى الصوت حسب السرعة (SDVS)',
    ignitionTab: 'حالة التشغيل والمحرك',
    telemetryTab: 'الصندوق الأسود وسجل القياس',
    libraryTab: 'إدارة الوسائط والتخزين',
    blueprintTab: 'المعمارية الأصلية لأندرويد',
    notificationDrawer: 'إشعار خدمة التشغيل في الخلفية',

    speedKmH: 'كم/س',
    speedMph: 'ميل/س',
    speedometer: 'مقياس السرعة',
    sdvsBoost: 'التعويض الصوتي للسرعة',
    cabinNoise: 'الضجيج المقدر لكابينة السيارة',
    baseVolume: 'مستوى الصوت الأساسي',
    effectiveVolume: 'مستوى الصوت الفعلي داخل الكابينة',
    nowPlaying: 'قيد التشغيل الآن',
    carMode: 'وضع القيادة عالي التباين',
    stealthMode: 'وضع التعتيم الليلي',
    roadNoiseComp: 'عزل صوتي متكيف لضجيج الإطارات والرياح',
    drivingSimulator: 'محاكي سرعة القيادة',
    throttle: 'دواسة التسارع',
    presets: 'إعدادات السرعة الجاهزة',
    presetIdle: 'توقف المحرك (0 كم/س)',
    presetCity: 'داخل المدينة (45 كم/س)',
    presetHighway: 'طريق سريع (105 كم/س)',
    presetAutobahn: 'سرعة قصوى (155 كم/س)',

    sdvsTitle: 'موازنة مستوى الصوت حسب السرعة (SDVS)',
    sdvsSubtitle: 'تعديل فوري وتلقائي لمستوى خرج الصوت يتفاعل مع ديناميكية حركة المركبة للتغلب على ضجيج الطريق والرياح',
    sdvsEnable: 'تفعيل التعويض الصوتي التلقائي (SDVS)',
    curveType: 'نموذج المنحنى الصوتي',
    curveLinear: 'تدرج خطي (+ديسيبل / كم/س)',
    curveExponential: 'لوغاريتمي سمعي (طاقة الضجيج الصوتي)',
    curveSCurve: 'منحنى جيبي S (انتقال سلس بين المدينة والطريق السريع)',
    minSpeed: 'حد أدنى لسرعة التفعيل',
    maxSpeed: 'سرعة أقصى تعويض صوتي',
    maxBoost: 'الحد الأقصى للزيادة بالديسيبل',
    smoothing: 'معامل التنعيم المرشح (لمنع القفزات المفاجئة)',
    gpsStatus: 'نظام تتبع السرعة',
    gpsActive: 'نظام تحديد المواقع GPS الفعلي',
    gpsSimulated: 'محاكي ناقل حركة المركبة (OBD-II)',
    gpsAccuracy: 'دقة إشارة الموقع',
    useLiveGps: 'استخدام مستشعر GPS للجهاز',
    useSimulator: 'استخدام محاكي سرعة القيادة',

    ignitionTitle: 'مستقبل إشارات تشغيل محرك المركبة',
    ignitionSubtitle: 'مراقبة إشارات انقطاع واتصال الطاقة ACTION_POWER_CONNECTED وتتبع مفتاح التشغيل',
    keyState: 'حالة أسطوانة مفتاح التشغيل',
    engineOff: 'إيقاف كامل / مغلق',
    accPower: 'وضع الملحقات (ACC)',
    ignitionOn: 'مفتاح التشغيل مفتوح (ON)',
    engineRunning: 'المحرك يعمل / دينامو الشحن نشط',
    autoPlayOnIgnition: 'تشغيل تلقائي عند بدء المحرك',
    autoPauseOnCutoff: 'إيقاف مؤقت تلقائي عند إطفاء المحرك',
    crankDelay: 'مهلة بدء تشغيل بادئ الحركة',
    cutoffCountdown: 'العد التنازلي قبل الإيقاف عند انقطاع الطاقة',
    powerSource: 'خط تغذية المركبة',
    batteryStatus: 'حالة الدينامو / البطارية',
    charging: 'دينامو 12V يشحن (المحرك نشط)',
    discharging: 'استهلاك البطارية (المحرك مطفأ)',
    simulateCutoff: 'محاكاة إطفاء المحرك',
    simulateStart: 'محاكاة تشغيل المحرك',

    telemetryTitle: 'إحصائيات القياس والصندوق الأسود للتشخيص',
    telemetrySubtitle: 'تخزين غير متزامن بدون إنترنت لجمع مقاييس الأداء وأوقات ربط SoLoader واستقرار الخدمة',
    totalPlayTime: 'إجمالي وقت الاستماع',
    averageSpeed: 'متوسط سرعة القيادة',
    topSpeed: 'أعلى سرعة مسجلة',
    peakBoostApplied: 'أقصى ديسيبل تعويض تم تطبيقه',
    ignitionCycles: 'دورات تشغيل المحرك',
    underrunEvents: 'انقطاعات ذاكرة الصوت المؤقتة',
    soLoaderBenchmark: 'زمن تهيئة مكتبة SoLoader عبر JNI',
    serviceStartupTime: 'زمن بدء خدمة PlaybackService في الواجهة',
    eventLogs: 'شريط أحداث الصندوق الأسود',
    exportJson: 'تصدير تقرير التشخيص بصيغة JSON',
    clearLogs: 'تفريغ الذاكرة المحلية',
    simulateCrash: 'محاكاة إغلاق النظام واستعادة الحالة',
    crashRecovered: 'تم معالجة استثناء النظام بنجاح واستعادة البيانات بأمان',

    mediaTitle: 'حزم الوسائط واستعراض الملفات المحلية',
    mediaSubtitle: 'فحص متعدد المسارات لذاكرة الجهاز والتخزين المحلي لملفات الصوت عالية الدقة',
    importAudioFiles: 'استيراد ملفات صوتية للسيارة',
    dropFilesHere: 'اسحب وأفلت ملفات MP3 أو WAV أو FLAC أو انقر للتصفح',
    builtInTracks: 'المسارات الصوتية المدمجة المخصصة للقيادة',
    importedTracks: 'المسارات المخزنة محلياً في المتصفح',
    trackDuration: 'المدة',
    bitrateQuality: 'دقة التدفق الصوتي',

    blueprintTitle: 'المعمارية الأصلية لأندرويد وشفرة كوتلن (Kotlin)',
    blueprintSubtitle: 'تطبيق متكامل لـ Bridgeless TurboModules وربط SoLoader وخدمة التشغيل المستمر',
    copyCode: 'نسخ الشفرة المصدرية',
    copied: 'تم النسخ إلى الحافظة!',
    downloadZip: 'تحميل حزمة الكود كاملة (.zip)',

    active: 'نشط',
    inactive: 'في الانتظار',
    seconds: 'ثانية',
    decibels: 'ديسيبل',
  },

  fr: {
    appName: 'Auto Music Player (AMP)',
    appSubtitle: 'Moteur Audio Embarqué Automobile • Android SDK 34 / API 30',
    cockpit: 'Cockpit Infodivertissement',
    sdvsTab: 'Volume Vitesse (SDVS)',
    ignitionTab: 'Contact & Allumage',
    telemetryTab: 'Boîte Noire Télémétrie',
    libraryTab: 'Gestion Médias',
    blueprintTab: 'Architecture Native',
    notificationDrawer: 'Service Premier Plan Android',

    speedKmH: 'km/h',
    speedMph: 'mph',
    speedometer: 'TACHYMÈTRE',
    sdvsBoost: 'AMPLIFICATION SDVS',
    cabinNoise: 'BRUIT HABITACLE ESTIMÉ',
    baseVolume: 'Volume Utilisateur de Base',
    effectiveVolume: 'Gain Effectif Habitacle',
    nowPlaying: 'EN LECTURE',
    carMode: 'HUD Haut Contraste',
    stealthMode: 'Mode Nuit Furtif',
    roadNoiseComp: 'Masquage Acoustique du Bruit de Roulement',
    drivingSimulator: 'Simulateur de Vitesse',
    throttle: 'Accélérateur',
    presets: 'Préréglages Vitesse',
    presetIdle: 'Ralenti (0 km/h)',
    presetCity: 'Ville (45 km/h)',
    presetHighway: 'Autoroute (105 km/h)',
    presetAutobahn: 'Grande Vitesse (155 km/h)',

    sdvsTitle: 'Mise à l\'échelle du Volume selon la Vitesse (SDVS)',
    sdvsSubtitle: 'Normalisation audio automatique en temps réel réagissant aux paramètres du véhicule',
    sdvsEnable: 'Activer l\'amplification dynamique SDVS',
    curveType: 'Modèle de Courbe Acoustique',
    curveLinear: 'Linéaire (+dB / km/h)',
    curveExponential: 'Exponentielle Acoustique',
    curveSCurve: 'Courbe Sigmoïde en S',
    minSpeed: 'Vitesse Minimale d\'Activation',
    maxSpeed: 'Vitesse d\'Amplification Maximale',
    maxBoost: 'Plafond d\'Amplification',
    smoothing: 'Filtre Passe-Bas Alpha (Anti-Choc)',
    gpsStatus: 'Moteur de Suivi de Vitesse',
    gpsActive: 'GPS Matériel Actif (LocationManager)',
    gpsSimulated: 'Simulateur Bus Véhicule (OBD-II)',
    gpsAccuracy: 'Précision du Signal GPS',
    useLiveGps: 'Utiliser le GPS de l\'appareil',
    useSimulator: 'Utiliser le Simulateur de Vitesse',

    ignitionTitle: 'Récepteur d\'État de Contact et Alimentation',
    ignitionSubtitle: 'Surveillance des intents ACTION_POWER_CONNECTED / DISCONNECTED',
    keyState: 'Position de la Clé de Contact',
    engineOff: 'ARRÊT / COUPÉ',
    accPower: 'ACC (Accessoires)',
    ignitionOn: 'CONTACT (Allumage)',
    engineRunning: 'MOTEUR TOURNANT (Alternateur)',
    autoPlayOnIgnition: 'Lecture Auto au Démarrage Moteur',
    autoPauseOnCutoff: 'Pause Auto à la Coupure Moteur',
    crankDelay: 'Délai Démarreur Moteur',
    cutoffCountdown: 'Compte à Rebours Coupure',
    powerSource: 'Alimentation Véhicule',
    batteryStatus: 'Statut Alternateur / Batterie',
    charging: 'Alternateur 12V en Charge (Moteur Actif)',
    discharging: 'Décharge Batterie (Moteur Coupé)',
    simulateCutoff: 'Simuler Coupure Contact',
    simulateStart: 'Simuler Démarrage Moteur',

    telemetryTitle: 'Statistiques & Boîte Noire Télémétrique',
    telemetrySubtitle: 'Stockage asynchrone hors ligne collectant les diagnostics de lecture et benchmarks',
    totalPlayTime: 'Temps Total d\'Écoute',
    averageSpeed: 'Vitesse Moyenne de Croisière',
    topSpeed: 'Vitesse Maximale Enregistrée',
    peakBoostApplied: 'Gain SDVS Max Appliqué',
    ignitionCycles: 'Cycles de Contact',
    underrunEvents: 'Incidents Tampon Audio',
    soLoaderBenchmark: 'Temps Initialisation SoLoader JNI',
    serviceStartupTime: 'Démarrage PlaybackService Foreground',
    eventLogs: 'Flux d\'Événements Boîte Noire',
    exportJson: 'Exporter Rapport Diagnostic JSON',
    clearLogs: 'Vider le Stockage',
    simulateCrash: 'Simuler Panne Système & Récupération',
    crashRecovered: 'Panne interceptée sans perte de données',

    mediaTitle: 'Gestion & Découverte de Médias Hors Ligne',
    mediaSubtitle: 'Indexation multi-threadée des fichiers audio locaux',
    importAudioFiles: 'Importer des Fichiers Audio',
    dropFilesHere: 'Glissez-déposez des fichiers MP3, WAV, FLAC ou cliquez pour parcourir',
    builtInTracks: 'Pistes Audio Automobiles Intégrées',
    importedTracks: 'Pistes Locales dans le Navigateur',
    trackDuration: 'Durée',
    bitrateQuality: 'Qualité du Flux',

    blueprintTitle: 'Architecture Native Android & Code Kotlin',
    blueprintSubtitle: 'Implémentation Bridgeless TurboModules, SoLoader et Foreground Service',
    copyCode: 'Copier le Code Source',
    copied: 'Copié dans le Presse-Papier !',
    downloadZip: 'Télécharger le Projet (.zip)',

    active: 'ACTIF',
    inactive: 'VEILLE',
    seconds: 'sec',
    decibels: 'dB',
  },

  de: {
    appName: 'Auto Music Player (AMP)',
    appSubtitle: 'Automotive Eingebettete Audio-Engine • Android SDK 34 / API 30',
    cockpit: 'Infotainment-Cockpit',
    sdvsTab: 'Geschwindigkeitslautstärke (SDVS)',
    ignitionTab: 'Zündung & Stromversorgung',
    telemetryTab: 'Telemetrie-Blackbox',
    libraryTab: 'Medienverwaltung',
    blueprintTab: 'Native Architektur',
    notificationDrawer: 'Android Vordergrunddienst',

    speedKmH: 'km/h',
    speedMph: 'mph',
    speedometer: 'TACHOMETER',
    sdvsBoost: 'SDVS-VERSTÄRKUNG',
    cabinNoise: 'GESCHÄTZTES FAHRZEUGGERÄUSCH',
    baseVolume: 'Basis-Lautstärke',
    effectiveVolume: 'Effektiver Kabinengewinn',
    nowPlaying: 'AKTUELLE WIEDERGABE',
    carMode: 'Kontrastreicher HUD-Modus',
    stealthMode: 'Nachtfahrt-Tarnmodus',
    roadNoiseComp: 'Akustische Kompensation von Fahrbahngeräuschen',
    drivingSimulator: 'Geschwindigkeitssimulator',
    throttle: 'Gaspedal',
    presets: 'Geschwindigkeits-Presets',
    presetIdle: 'Leerlauf (0 km/h)',
    presetCity: 'Stadt (45 km/h)',
    presetHighway: 'Autobahn (105 km/h)',
    presetAutobahn: 'Schnellfahrt (155 km/h)',

    sdvsTitle: 'Geschwindigkeitsabhängige Lautstärkeanpassung (SDVS)',
    sdvsSubtitle: 'Automatische Audiopegelanpassung in Echtzeit basierend auf Fahrzeuggeschwindigkeit',
    sdvsEnable: 'SDVS Dynamische DSP-Verstärkung aktivieren',
    curveType: 'Akustisches Kurvenmodell',
    curveLinear: 'Linear (+dB / km/h)',
    curveExponential: 'Exponentiell (Schallleistung)',
    curveSCurve: 'Sigmoid S-Kurve',
    minSpeed: 'Mindestgeschwindigkeit zur Aktivierung',
    maxSpeed: 'Zielgeschwindigkeit für maximale Verstärkung',
    maxBoost: 'Maximale Verstärkung',
    smoothing: 'Tiefpassfilter-Glättung',
    gpsStatus: 'Geschwindigkeitssensor',
    gpsActive: 'Echtes GPS (LocationManager)',
    gpsSimulated: 'Fahrzeugbus-Simulator (OBD-II)',
    gpsAccuracy: 'GPS-Signalgenauigkeit',
    useLiveGps: 'Geräte-GPS verwenden',
    useSimulator: 'Fahrsimulator verwenden',

    ignitionTitle: 'Zündungs- und Leistungsüberwachung',
    ignitionSubtitle: 'Erkennung von ACTION_POWER_CONNECTED / DISCONNECTED',
    keyState: 'Zündschloss-Zustand',
    engineOff: 'AUS / VERRIEGELT',
    accPower: 'ACC (Zubehör)',
    ignitionOn: 'EIN (Zündung aktiv)',
    engineRunning: 'MOTOR LÄUFT (Lichtmaschine aktiv)',
    autoPlayOnIgnition: 'Automatisches Abspielen bei Motorstart',
    autoPauseOnCutoff: 'Automatisches Pausieren beim Ausschalten',
    crankDelay: 'Anlasser-Verzögerung',
    cutoffCountdown: 'Ausschalt-Countdown',
    powerSource: 'Bordnetz',
    batteryStatus: 'Lichtmaschinen-/Batteriestatus',
    charging: '12V Lichtmaschine lädt (Motor läuft)',
    discharging: 'Batterieentladung (Motor aus)',
    simulateCutoff: 'Zündung ausschalten',
    simulateStart: 'Motor anlassen',

    telemetryTitle: 'Telemetriestatistik & Diagnose-Blackbox',
    telemetrySubtitle: 'Offline-Datenspeicherung für Wiedergabediagnosen und SoLoader-Laufzeiten',
    totalPlayTime: 'Gesamte Spielzeit',
    averageSpeed: 'Durchschnittsgeschwindigkeit',
    topSpeed: 'Höchstgeschwindigkeit',
    peakBoostApplied: 'Max. angewandter SDVS-Boost',
    ignitionCycles: 'Zündzyklen',
    underrunEvents: 'Pufferunterläufe',
    soLoaderBenchmark: 'SoLoader.init() JNI-Benchmark',
    serviceStartupTime: 'PlaybackService Startzeit',
    eventLogs: 'Ereignisprotokoll',
    exportJson: 'Diagnosebericht exportieren (JSON)',
    clearLogs: 'Speicher leeren',
    simulateCrash: 'Systemabsturz & Wiederherstellung simulieren',
    crashRecovered: 'Absturzsicher wiederhergestellt',

    mediaTitle: 'Lokale Medien & Dateiverwaltung',
    mediaSubtitle: 'Multi-Thread-Katalogisierung von Audiodateien',
    importAudioFiles: 'Audiodateien importieren',
    dropFilesHere: 'MP3-, WAV-, FLAC-Dateien hier ablegen',
    builtInTracks: 'Integrierte Fahrzeug-Soundtracks',
    importedTracks: 'Lokal im Browser gespeicherte Titel',
    trackDuration: 'Dauer',
    bitrateQuality: 'Stream-Qualität',

    blueprintTitle: 'Native Android-Architektur & Kotlin-Code',
    blueprintSubtitle: 'Vollständige Implementierung von Bridgeless TurboModules und Foreground Service',
    copyCode: 'Quellcode kopieren',
    copied: 'In die Zwischenablage kopiert!',
    downloadZip: 'Projektpaket herunterladen (.zip)',

    active: 'AKTIV',
    inactive: 'BEREIT',
    seconds: 'Sek.',
    decibels: 'dB',
  },

  es: {
    appName: 'Auto Music Player (AMP)',
    appSubtitle: 'Motor de Audio Automotriz Embebido • Android SDK 34 / API 30',
    cockpit: 'Cabina de Infoentretenimiento',
    sdvsTab: 'Volumen y Velocidad (SDVS)',
    ignitionTab: 'Encendido y Potencia',
    telemetryTab: 'Caja Negra de Telemetría',
    libraryTab: 'Gestión Multimedia',
    blueprintTab: 'Arquitectura Nativa',
    notificationDrawer: 'Servicio en Primer Plano Android',

    speedKmH: 'km/h',
    speedMph: 'mph',
    speedometer: 'VELOCÍMETRO',
    sdvsBoost: 'AUMENTO SDVS',
    cabinNoise: 'RUIDO DE CABINA ESTIMADO',
    baseVolume: 'Volumen Base de Usuario',
    effectiveVolume: 'Ganancia Efectiva en Cabina',
    nowPlaying: 'EN REPRODUCCIÓN',
    carMode: 'HUD Alto Contraste',
    stealthMode: 'Modo Nocturno Sigilo',
    roadNoiseComp: 'Compensación Acústica de Ruido de Rodadura',
    drivingSimulator: 'Simulador de Velocidad',
    throttle: 'Acelerador',
    presets: 'Ajustes de Velocidad',
    presetIdle: 'Ralentí (0 km/h)',
    presetCity: 'Ciudad (45 km/h)',
    presetHighway: 'Autovía (105 km/h)',
    presetAutobahn: 'Alta Velocidad (155 km/h)',

    sdvsTitle: 'Escalado de Volumen Dependiente de la Velocidad (SDVS)',
    sdvsSubtitle: 'Normalización automática en tiempo real que reacciona a las métricas del vehículo',
    sdvsEnable: 'Activar ganancia dinámica DSP de SDVS',
    curveType: 'Modelo de Curva Acústica',
    curveLinear: 'Lineal (+dB / km/h)',
    curveExponential: 'Exponencial Acústica',
    curveSCurve: 'Curva Sigmoidea en S',
    minSpeed: 'Velocidad Mínima de Activación',
    maxSpeed: 'Velocidad de Ganancia Máxima',
    maxBoost: 'Límite Máximo de Aumento',
    smoothing: 'Filtro Pasa-Bajos de Suavizado',
    gpsStatus: 'Sensor de Velocidad',
    gpsActive: 'GPS Físico Nativo (LocationManager)',
    gpsSimulated: 'Simulador de Bus de Vehículo (OBD-II)',
    gpsAccuracy: 'Precisión de Señal GPS',
    useLiveGps: 'Usar GPS del Dispositivo',
    useSimulator: 'Usar Simulador de Conducción',

    ignitionTitle: 'Receptor de Estado de Encendido y Batería',
    ignitionSubtitle: 'Monitoreo de eventos ACTION_POWER_CONNECTED / DISCONNECTED',
    keyState: 'Posición de la Llave de Contacto',
    engineOff: 'APAGADO / BLOQUEADO',
    accPower: 'ACC (Accesorios)',
    ignitionOn: 'ON (Contacto de Encendido)',
    engineRunning: 'MOTOR EN MARCHA (Alternador)',
    autoPlayOnIgnition: 'Reproducción Automática al Encender',
    autoPauseOnCutoff: 'Pausa Automática al Cortar el Motor',
    crankDelay: 'Retardo del Motor de Arranque',
    cutoffCountdown: 'Cuenta Regresiva de Corte',
    powerSource: 'Alimentación del Vehículo',
    batteryStatus: 'Estado del Alternador / Batería',
    charging: 'Alternador 12V Cargando (Motor Activo)',
    discharging: 'Descarga de Batería (Motor Apagado)',
    simulateCutoff: 'Simular Corte de Llave',
    simulateStart: 'Simular Arranque del Motor',

    telemetryTitle: 'Estadísticas y Caja Negra de Diagnóstico',
    telemetrySubtitle: 'Almacenamiento asíncrono sin conexión para métricas y benchmarks de SoLoader',
    totalPlayTime: 'Tiempo Total de Reproducción',
    averageSpeed: 'Velocidad Media de Crucero',
    topSpeed: 'Velocidad Máxima Registrada',
    peakBoostApplied: 'Aumento SDVS Máximo Aplicado',
    ignitionCycles: 'Ciclos de Encendido',
    underrunEvents: 'Incidentes de Búfer',
    soLoaderBenchmark: 'Tiempo de Inicio SoLoader JNI',
    serviceStartupTime: 'Tiempo de Inicio PlaybackService',
    eventLogs: 'Registro de Eventos',
    exportJson: 'Exportar Diagnóstico (JSON)',
    clearLogs: 'Limpiar Almacenamiento',
    simulateCrash: 'Simular Caída del Sistema y Recuperación',
    crashRecovered: 'Recuperado de forma segura sin pérdida de datos',

    mediaTitle: 'Empaquetado de Medios y Archivos Locales',
    mediaSubtitle: 'Escaneo multifilamento de archivos de audio locales',
    importAudioFiles: 'Importar Archivos de Audio',
    dropFilesHere: 'Arrastre archivos MP3, WAV, FLAC aquí o haga clic',
    builtInTracks: 'Pistas Integradas para Conducción',
    importedTracks: 'Pistas Almacenadas Localmente',
    trackDuration: 'Duración',
    bitrateQuality: 'Calidad de Transmisión',

    blueprintTitle: 'Arquitectura Nativa Android y Código Kotlin',
    blueprintSubtitle: 'Implementación completa de Bridgeless TurboModules y Foreground Service',
    copyCode: 'Copiar Código Fuente',
    copied: '¡Copiado al Portapapeles!',
    downloadZip: 'Descargar Proyecto Completo (.zip)',

    active: 'ACTIVO',
    inactive: 'ESPERA',
    seconds: 'seg',
    decibels: 'dB',
  },
};
