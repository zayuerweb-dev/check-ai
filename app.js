const $ = (id) => document.getElementById(id);
const zh = {
  brandName: '查找.AI', brandSubtitle: '会员、API、模型与跑分', search: '搜索', compare: '比较',
  all: '全部', mainstream: '主流', modelLab: '自研', openSource: '开源', aggregator: '供应商', cloud: '云平台', hasMembership: '有会员',
  showMore: '展开', functionFilter: '功能', functionCode: '写代码', functionWeb: '联网', functionWriting: '写作', functionVision: '图像', functionLongContext: '长文档', functionLocal: '本地部署',
  home: '主页', homeTitle: '挑 AI 模型，先来 Check 一下', homeLead: '对比 60+ 平台、1700+ 模型的能力、价格与上下文。用左侧搜索，或选一家公司开始。', homeLatest: '最新动态', homePopular: '热门模型', homeScenario: '按场景选模型', homeArticles: '深度文章',
  eyebrow: 'AI 平台模型数据库', language: '语言', companyWebsite: '公司官网', subscription: '订阅', apiPricing: 'API 价格',
  overview: '总览', models: '模型', pricing: '官网套餐', bestFor: '使用案例', plainConclusion: '摘要', capabilities: '能力',
  model: '模型', inputPrice: '输入/$1M', outputPrice: '输出/$1M', context: '上下文', releaseDate: '发布日期', lmArena: 'LMArena', sixDimChart: '六维示意图',
  consumerPlans: '会员套餐', officialPricing: '官方价格', estimatedScores: '估算分数', compareModels: '模型比较', company: '公司', selectedModels: '已选模型', clear: '清空',
  noSelection: '未选择模型时显示当前范围内全部模型。', selectAllModels: '全选当前公司', curatedPlans: '实时模型数据 + 人工整理套餐', seedData: '种子数据', liveUnavailable: '实时数据暂不可用', updatedToday: '今天更新', average: '6轴平均', backToList: '平台列表', verdict: '综合评价', verdictTier1: '前沿旗舰', verdictTier2: '主流可用', verdictTier3: '入门级别', tokens: 'token', outputInputRatio: '输出/输入比', outputCostMultiple: '输出贵几倍', released: '已发布', arenaRank: '榜单分数', capabilityProfile: '能力画像', officialDocs: '官方文档', viewFullPage: '查看完整页', compareThisModel: '加入对比', noResults: '暂无匹配结果', noResultsFor: '没有匹配「{q}」的平台', noResultsHint: '试试换个关键词，或清除筛选条件重新浏览。', clearSearch: '清除搜索和筛选', compareEmptyTitle: '选择 2-6 个模型开始对比', compareEmptyHint: '在左侧选公司、能力筛选后，点击模型名加入对比表。'
};
const en = {
  brandName: 'Check.AI', brandSubtitle: 'Plans, APIs, models, scores', search: 'Search', compare: 'Compare',
  all: 'All', mainstream: 'Mainstream', modelLab: 'Owned', openSource: 'Open Source', aggregator: 'Providers', cloud: 'Cloud', hasMembership: 'Plans',
  showMore: 'Show more', functionFilter: 'Functions', functionCode: 'Coding', functionWeb: 'Web', functionWriting: 'Writing', functionVision: 'Vision', functionLongContext: 'Long docs', functionLocal: 'Local',
  home: 'Home', homeTitle: 'Pick an AI model — Check first', homeLead: 'Compare capabilities, price and context across 60+ platforms and 1700+ models. Search on the left, or pick a company.', homeLatest: 'Latest', homePopular: 'Popular', homeScenario: 'Pick by scenario', homeArticles: 'Articles',
  eyebrow: 'AI platform model database', language: 'Language', companyWebsite: 'Company website', subscription: 'Subscription', apiPricing: 'API pricing',
  overview: 'Overview', models: 'Models', pricing: 'Official Plans', bestFor: 'Use cases', plainConclusion: 'Plain conclusion', capabilities: 'Capabilities',
  model: 'Model', inputPrice: 'Input/$1M', outputPrice: 'Output/$1M', context: 'Context', releaseDate: 'Release date', lmArena: 'LMArena', sixDimChart: 'Six-axis visual',
  consumerPlans: 'Consumer plans', officialPricing: 'Official pricing', estimatedScores: 'Estimated scores', compareModels: 'Model comparison', company: 'Company', selectedModels: 'Selected models', clear: 'Clear',
  noSelection: 'Without selected models, all models in the current scope are shown.', selectAllModels: 'Select current company', curatedPlans: 'Live model data + curated plans', seedData: 'Seed data', liveUnavailable: 'Live data unavailable', updatedToday: 'Updated today', average: 'Six-axis avg', backToList: 'Platforms', verdict: 'Verdict', verdictTier1: 'Frontier', verdictTier2: 'Mainstream', verdictTier3: 'Entry tier', tokens: 'tokens', outputInputRatio: 'Out/In ratio', outputCostMultiple: 'Output cost multiple', released: 'released', arenaRank: 'Arena rank', capabilityProfile: 'Capability profile', officialDocs: 'Official docs', viewFullPage: 'Full page', compareThisModel: 'Compare this', noResults: 'No matching platforms', noResultsFor: 'No platforms match "{q}"', noResultsHint: 'Try a different keyword, or clear filters to start fresh.', clearSearch: 'Clear search and filters', compareEmptyTitle: 'Pick 2–6 models to compare', compareEmptyHint: 'Choose a company and capability filter on the left, then click model names to add them to the comparison.'
};
const ja = { ...en,
  brandSubtitle: 'プラン、API、モデル、スコア', search: '検索', compare: '比較', all: 'すべて', mainstream: '主流', modelLab: '自社開発', openSource: 'オープンソース', aggregator: 'プロバイダー', cloud: 'クラウド', hasMembership: '有料プラン',
  showMore: 'もっと見る', functionFilter: '機能', functionCode: 'コーディング', functionWeb: 'Web 接続', functionWriting: '文章作成', functionVision: '画像', functionLongContext: '長文書', functionLocal: 'ローカル',
  eyebrow: 'AI プラットフォームモデルデータベース', language: '言語', companyWebsite: '公式サイト', subscription: 'サブスク', apiPricing: 'API 価格', overview: '概要', models: 'モデル', pricing: '公式プラン',
  bestFor: '用途', plainConclusion: '要約', capabilities: '能力', model: 'モデル', inputPrice: '入力/$1M', outputPrice: '出力/$1M', context: 'コンテキスト', releaseDate: '公開日', sixDimChart: '6軸表示',
  consumerPlans: '会員プラン', officialPricing: '公式価格', estimatedScores: '推定スコア', compareModels: 'モデル比較', company: '会社', selectedModels: '選択済みモデル', clear: 'クリア',
  noSelection: 'モデル未選択時は現在の範囲の全モデルを表示します。', selectAllModels: '現在の会社を全選択', curatedPlans: 'ライブモデルデータ + 整理済みプラン', seedData: '初期データ', liveUnavailable: 'ライブデータ利用不可', updatedToday: '本日更新', average: '6軸平均', backToList: 'プラットフォーム', verdict: '評価', verdictTier1: 'フロンティア', verdictTier2: '主流', verdictTier3: 'エントリー', tokens: 'トークン', outputInputRatio: '出力/入力比', outputCostMultiple: '出力倍率', released: 'リリース済', arenaRank: 'アリーナ', capabilityProfile: '能力プロファイル', officialDocs: '公式ドキュメント', viewFullPage: '詳細ページ', compareThisModel: '比較に追加', noResults: '一致するプラットフォームなし', noResultsFor: '「{q}」に一致するプラットフォームなし', noResultsHint: 'キーワードを変えるか、フィルターをクリアして再度参照してください。', clearSearch: '検索とフィルターをクリア', compareEmptyTitle: '2〜6個のモデルを選択して比較', compareEmptyHint: '左で会社と機能を選び、モデル名をクリックして比較に追加。'
};
const ko = { ...en,
  brandSubtitle: '요금제, API, 모델, 점수', search: '검색', compare: '비교', all: '전체', mainstream: '주류', modelLab: '자체 개발', openSource: '오픈소스', aggregator: '공급자', cloud: '클라우드', hasMembership: '멤버십',
  showMore: '더 보기', functionFilter: '기능', functionCode: '코딩', functionWeb: '웹 연결', functionWriting: '글쓰기', functionVision: '이미지', functionLongContext: '긴 문서', functionLocal: '로컬 배포',
  eyebrow: 'AI 플랫폼 모델 데이터베이스', language: '언어', companyWebsite: '공식 사이트', subscription: '구독', apiPricing: 'API 가격', overview: '개요', models: '모델', pricing: '공식 요금제',
  bestFor: '사용 사례', plainConclusion: '요약', capabilities: '기능', model: '모델', inputPrice: '입력/$1M', outputPrice: '출력/$1M', context: '컨텍스트', releaseDate: '출시일', sixDimChart: '6축 시각화',
  consumerPlans: '멤버십 요금제', officialPricing: '공식 가격', estimatedScores: '추정 점수', compareModels: '모델 비교', company: '회사', selectedModels: '선택한 모델', clear: '지우기',
  noSelection: '선택한 모델이 없으면 현재 범위의 모든 모델을 표시합니다.', selectAllModels: '현재 회사 전체 선택', curatedPlans: '실시간 모델 데이터 + 정리된 요금제', seedData: '초기 데이터', liveUnavailable: '실시간 데이터 사용 불가', updatedToday: '오늘 업데이트', average: '6축 평균', backToList: '플랫폼', verdict: '평가', verdictTier1: '프론티어', verdictTier2: '주류', verdictTier3: '입문', tokens: '토큰', outputInputRatio: '출력/입력 비율', outputCostMultiple: '출력 비용 배수', released: '출시됨', arenaRank: '아레나 순위', capabilityProfile: '능력 프로필', officialDocs: '공식 문서', viewFullPage: '전체 페이지', compareThisModel: '비교 추가', noResults: '일치하는 플랫폼 없음', noResultsFor: '「{q}」와 일치하는 플랫폼 없음', noResultsHint: '다른 키워드를 시도하거나 필터를 초기화하세요.', clearSearch: '검색 및 필터 지우기', compareEmptyTitle: '2-6개 모델 선택', compareEmptyHint: '왼쪽에서 회사와 기능을 선택하고 모델 이름을 클릭하세요.'
};
const es = { ...en,
  brandSubtitle: 'Planes, API, modelos y puntajes', search: 'Buscar', compare: 'Comparar', all: 'Todo', mainstream: 'Principales', modelLab: 'Propios', openSource: 'Código abierto', aggregator: 'Proveedores', cloud: 'Nube', hasMembership: 'Planes',
  showMore: 'Ver más', functionFilter: 'Funciones', functionCode: 'Código', functionWeb: 'Web', functionWriting: 'Escritura', functionVision: 'Imagen', functionLongContext: 'Documentos largos', functionLocal: 'Local',
  eyebrow: 'Base de datos de modelos de IA', language: 'Idioma', companyWebsite: 'Sitio oficial', subscription: 'Suscripción', apiPricing: 'Precio API', overview: 'Resumen', models: 'Modelos', pricing: 'Planes oficiales',
  bestFor: 'Casos de uso', plainConclusion: 'Resumen', capabilities: 'Capacidades', model: 'Modelo', inputPrice: 'Entrada/$1M', outputPrice: 'Salida/$1M', context: 'Contexto', releaseDate: 'Lanzamiento', sixDimChart: 'Vista de 6 ejes',
  consumerPlans: 'Planes de consumo', officialPricing: 'Precio oficial', estimatedScores: 'Puntajes estimados', compareModels: 'Comparación de modelos', company: 'Empresa', selectedModels: 'Modelos elegidos', clear: 'Limpiar',
  noSelection: 'Sin modelos elegidos, se muestran todos los modelos del alcance actual.', selectAllModels: 'Elegir empresa actual', curatedPlans: 'Datos en vivo + planes curados', seedData: 'Datos iniciales', liveUnavailable: 'Datos en vivo no disponibles', updatedToday: 'Actualizado hoy', average: 'Promedio 6 ejes', backToList: 'Plataformas', verdict: 'Veredicto', verdictTier1: 'Frontera', verdictTier2: 'Principal', verdictTier3: 'Entrada', tokens: 'tokens', outputInputRatio: 'Salida/Entrada', outputCostMultiple: 'Múltiplo de costo', released: 'lanzado', arenaRank: 'Rango arena', capabilityProfile: 'Perfil de capacidad', officialDocs: 'Docs oficiales', viewFullPage: 'Página completa', compareThisModel: 'Comparar', noResults: 'Sin coincidencias', noResultsFor: 'No hay plataformas que coincidan con "{q}"', noResultsHint: 'Prueba con otra palabra clave o limpia los filtros.', clearSearch: 'Limpiar búsqueda y filtros', compareEmptyTitle: 'Elige 2-6 modelos para comparar', compareEmptyHint: 'Selecciona empresa y capacidad a la izquierda, luego haz clic en los nombres.'
};
const i18n = { zh, en, ja, ko, es };
Object.assign(zh, {
  advantage: '优势', openStatus: '开放', closedStatus: '闭源', freeMultiple: '免费 · 多种方案', seeOfficialSite: '官网为准',
  inputShort: '输入', outputShort: '输出', lowestApi: '最低 API 输入', bestModel: '最高模型', unknown: '未公开', freePlan: '免费',
  allModels: '全部模型', coding: '编程', lowCost: '低成本', vision: '图像', reasoning: '推理', openCap: '开放', longContext: '长上下文',
  speed: '速度', costEfficiency: '性价比', aaIndex: 'AA Index', benchmarks: '第三方跑分',
  multimodal: '多模态', companies: '家公司', decisionNote: '决策备注',
  defaultSummary: '这是人工整理的第一版描述，后续会继续对照官网和公开资料校准。',
  publicModelData: '公开模型/API 数据。', usefulCapability: '适合围绕这个能力做选型和比较。',
  apiPlatform: 'API/平台', usageOrOfficial: '按量或官网为准', apiPlatformNote: '这个平台主要是 API 或模型供应入口，不一定有面向消费者的会员套餐。',
  paid: '付费', paidOfficialNote: '付费方案、团队方案和地区价格以官网为准。', freeOfficialNote: '保留免费入口和官方套餐链接，具体额度以后继续补齐。'
});
Object.assign(en, {
  advantage: 'Advantages', openStatus: 'Open', closedStatus: 'Closed', freeMultiple: 'Free · multiple plans', seeOfficialSite: 'See official site',
  inputShort: 'input', outputShort: 'output', lowestApi: 'Lowest API', bestModel: 'Best', unknown: 'Unknown', freePlan: 'Free',
  allModels: 'All models', coding: 'Coding', lowCost: 'Low cost', vision: 'Vision', reasoning: 'Reasoning', openCap: 'Open', longContext: 'Long context',
  speed: 'Speed', costEfficiency: 'Cost', aaIndex: 'AA Index', benchmarks: 'Benchmarks',
  multimodal: 'Multimodal', companies: 'companies', decisionNote: 'Decision note',
  defaultSummary: 'This is a first curated description and should continue to be checked against official and public sources.',
  publicModelData: 'public model/API data.', usefulCapability: 'Useful when this capability matters in selection.',
  apiPlatform: 'API/platform', usageOrOfficial: 'usage or official site', apiPlatformNote: 'This provider is mainly an API or model access platform, so consumer memberships may not apply.',
  paid: 'Paid', paidOfficialNote: 'Paid, team, and regional prices should be checked on the official site.', freeOfficialNote: 'Free access and official plan links are kept here. Exact limits will be expanded later.'
});
Object.assign(ja, {
  advantage: '強み', openStatus: 'オープン', closedStatus: 'クローズド', freeMultiple: '無料 · 複数プラン', seeOfficialSite: '公式サイト参照',
  inputShort: '入力', outputShort: '出力', lowestApi: '最低 API', bestModel: '上位モデル', unknown: '未公開', freePlan: '無料',
  allModels: 'すべてのモデル', coding: 'コーディング', lowCost: '低コスト', vision: '画像', reasoning: '推論', openCap: 'オープン', longContext: '長文脈',
  speed: '速度', costEfficiency: '費用効率', aaIndex: 'AA Index', benchmarks: 'ベンチマーク',
  multimodal: '多モーダル', companies: '社', decisionNote: '判断メモ',
  defaultSummary: 'これは手作業で整理した初版の説明です。今後も公式情報と公開情報で確認していきます。',
  publicModelData: '公開モデル/API データ。', usefulCapability: 'この能力を重視する選定と比較に向いています。',
  apiPlatform: 'API/プラットフォーム', usageOrOfficial: '従量課金または公式サイト', apiPlatformNote: 'この提供元は主に API またはモデル提供基盤で、消費者向け会員プランがない場合があります。',
  paid: '有料', paidOfficialNote: '有料、チーム、地域別価格は公式サイトで確認してください。', freeOfficialNote: '無料入口と公式プランへのリンクを保持しています。詳細な上限は今後補完します。'
});
Object.assign(ko, {
  advantage: '강점', openStatus: '오픈', closedStatus: '폐쇄형', freeMultiple: '무료 · 여러 요금제', seeOfficialSite: '공식 사이트 기준',
  inputShort: '입력', outputShort: '출력', lowestApi: '최저 API', bestModel: '상위 모델', unknown: '미공개', freePlan: '무료',
  allModels: '전체 모델', coding: '코딩', lowCost: '저비용', vision: '이미지', reasoning: '추론', openCap: '오픈', longContext: '긴 컨텍스트',
  speed: '속도', costEfficiency: '비용 효율', aaIndex: 'AA Index', benchmarks: '벤치마크',
  multimodal: '멀티모달', companies: '개 회사', decisionNote: '판단 메모',
  defaultSummary: '이 설명은 사람이 정리한 첫 버전이며, 이후 공식 자료와 공개 자료로 계속 검증합니다.',
  publicModelData: '공개 모델/API 데이터입니다.', usefulCapability: '이 기능이 중요한 선택과 비교에 적합합니다.',
  apiPlatform: 'API/플랫폼', usageOrOfficial: '사용량 기반 또는 공식 사이트', apiPlatformNote: '이 제공자는 주로 API 또는 모델 접근 플랫폼이므로 소비자용 멤버십이 없을 수 있습니다.',
  paid: '유료', paidOfficialNote: '유료, 팀, 지역별 가격은 공식 사이트에서 확인하세요.', freeOfficialNote: '무료 접근과 공식 요금제 링크를 유지합니다. 정확한 한도는 추후 보강합니다.'
});
Object.assign(es, {
  advantage: 'Ventajas', openStatus: 'Abierto', closedStatus: 'Cerrado', freeMultiple: 'Gratis · varios planes', seeOfficialSite: 'Ver sitio oficial',
  inputShort: 'entrada', outputShort: 'salida', lowestApi: 'API mínimo', bestModel: 'Mejor modelo', unknown: 'No publicado', freePlan: 'Gratis',
  allModels: 'Todos los modelos', coding: 'Programación', lowCost: 'Bajo costo', vision: 'Imagen', reasoning: 'Razonamiento', openCap: 'Abierto', longContext: 'Contexto largo',
  speed: 'Velocidad', costEfficiency: 'Eficiencia de costo', aaIndex: 'AA Index', benchmarks: 'Benchmarks',
  multimodal: 'Multimodal', companies: 'empresas', decisionNote: 'Nota de decisión',
  defaultSummary: 'Esta es una primera descripción curada y debe seguir contrastándose con fuentes oficiales y públicas.',
  publicModelData: 'datos públicos de modelos/API.', usefulCapability: 'Útil cuando esta capacidad importa para elegir y comparar.',
  apiPlatform: 'API/plataforma', usageOrOfficial: 'uso o sitio oficial', apiPlatformNote: 'Este proveedor es principalmente una API o plataforma de modelos, por lo que puede no tener membresías de consumo.',
  paid: 'De pago', paidOfficialNote: 'Los planes de pago, equipo y precios regionales deben revisarse en el sitio oficial.', freeOfficialNote: 'Se conserva el acceso gratuito y el enlace oficial. Los límites exactos se ampliarán después.'
});
const supportedLangs = ['zh','en','ja','ko','es'];
function initialLang() {
  try {
    const urlLang = new URLSearchParams(window.location.search).get('lang');
    if (supportedLangs.includes(urlLang)) {
      localStorage.setItem('checkai.lang', urlLang);
      return urlLang;
    }
  } catch (_) {}
  const saved = localStorage.getItem('checkai.lang');
  if (supportedLangs.includes(saved)) return saved;
  const browserLang = (navigator.language || navigator.userLanguage || '').toLowerCase();
  const matched = supportedLangs.find((x) => browserLang === x || browserLang.startsWith(`${x}-`));
  return matched || 'en';
}
let lang = initialLang(), activePlatform = 'openai', platformFilter = '', functionFilter = '', modelCap = '', sortKey = 'releaseDate', sortDir = 'desc', compareCompany = 'openai';
let selectedModels = new Set(), compareCaps = new Set(), dataState = { kind: 'seed', count: 0 };
let modelSlugSet = new Set();
function canonSlug(name) {
  return String(name).toLowerCase().trim()
    .replace(/[\s\-_./]+/g, '-')
    .replace(/-(latest|preview|chat|instruct|001|002|003|exp|experimental)$/i, '')
    .replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-').replace(/^-|-$/g, '');
}
async function loadModelSlugs() {
  try {
    const r = await fetch('/data/model-slugs.json', { cache: 'no-cache' });
    if (r.ok) modelSlugSet = new Set((await r.json()).map((m) => m.slug));
  } catch (_) { /* manifest optional */ }
}
const basePlatforms = [
  ['openai','OpenAI','https://models.dev/logos/openai.svg','https://openai.com/','https://openai.com/chatgpt/pricing/',['mainstream','modelLab'],['consumer','api'],['code','writing','vision','longContext','web'],'覆盖普通用户、开发者和企业的通用 AI 平台，强项是综合能力、工具生态、代码和多模态产品化。','A general-purpose AI platform for consumers, developers, and enterprises.',['综合能力','代码','多模态','生态'],['General','Code','Multimodal','Ecosystem']],
  ['anthropic','Anthropic Claude','https://models.dev/logos/anthropic.svg','https://www.anthropic.com/','https://www.anthropic.com/pricing',['mainstream','modelLab'],['consumer','api'],['code','writing','vision','longContext'],'Claude 以长文理解、写作、代码和安全稳健的交互体验著称。','Claude is known for long-context understanding, writing, and coding.',['长文','代码','写作','推理'],['Long context','Code','Writing','Reasoning']],
  ['google','Google Gemini','https://models.dev/logos/google.svg','https://gemini.google.com/','https://one.google.com/about/google-ai-plans/',['mainstream','modelLab','cloud'],['consumer','api'],['code','writing','vision','longContext','web'],'Gemini 强在超长上下文、多模态和 Google 生态整合。','Gemini is strong in long context, multimodal input, and Google ecosystem integration.',['长上下文','多模态','Google 生态','性价比'],['Long context','Multimodal','Google ecosystem','Value']],
  ['xai','xAI Grok','https://models.dev/logos/xai.svg','https://x.ai/','https://x.ai/grok',['mainstream','modelLab'],['consumer','api'],['web','writing','code'],'Grok 与 X 平台结合紧密，适合关注实时信息和社交内容。','Grok is tied to X and useful for real-time and social content.',['实时信息','推理','X 生态'],['Real-time','Reasoning','X ecosystem']],
  ['deepseek','DeepSeek','https://models.dev/logos/deepseek.svg','https://www.deepseek.com/','https://chat.deepseek.com/',['mainstream','modelLab','open'],['api','open'],['code','writing','local'],'DeepSeek 以高性价比和开放模型影响力出圈。','DeepSeek stands out for cost efficiency and open-model influence.',['低成本','推理','代码','开放生态'],['Low cost','Reasoning','Code','Open ecosystem']],
  ['alibaba','Alibaba Qwen','https://models.dev/logos/alibaba.svg','https://qwen.ai/','https://chat.qwen.ai/',['mainstream','modelLab','open','cloud'],['api','open'],['code','writing','vision','local'],'通义千问覆盖闭源 API 和开放权重模型，中文和企业云场景完整。','Qwen covers hosted APIs and open-weight models.',['中文','开源','企业云','代码'],['Chinese','Open source','Cloud','Code']],
  ['mistral','Mistral','https://models.dev/logos/mistral.svg','https://mistral.ai/','https://mistral.ai/products/la-plateforme',['mainstream','modelLab','open'],['api','open'],['code','writing','local'],'Mistral 同时提供高性能托管模型和开放权重模型。','Mistral offers hosted and open-weight models.',['开放模型','欧洲合规','代码','速度'],['Open models','EU compliance','Code','Speed']],
  ['openrouter','OpenRouter','https://models.dev/logos/openrouter.svg','https://openrouter.ai/','https://openrouter.ai/pricing',['aggregator'],['api'],['code','writing','vision','web'],'OpenRouter 是多模型 API 平台，适合模型路由、成本比较和快速试验。','OpenRouter is a multi-model API marketplace.',['模型聚合','价格对比','快速试验','路由'],['Aggregation','Price comparison','Testing','Routing']]
];
let platforms = basePlatforms.map(([id,name,logo,website,planUrl,types,category,functions,description,descriptionEn,strengths,strengthsEn]) => ({ id,name,logo,website,planUrl,types,category,functions,description,descriptionEn,strengths,strengthsEn }));
const platformLocales = {
  openai: {
    ja: { desc: '一般ユーザー、開発者、企業向けの汎用 AI プラットフォーム。総合力、ツール連携、コード、多モーダルが強みです。', strengths: ['総合力','コード','多モーダル','エコシステム'] },
    ko: { desc: '일반 사용자, 개발자, 기업을 위한 범용 AI 플랫폼입니다. 종합 성능, 도구 생태계, 코드, 멀티모달 제품화가 강점입니다.', strengths: ['종합 능력','코드','멀티모달','생태계'] },
    es: { desc: 'Plataforma general de IA para usuarios, desarrolladores y empresas, fuerte en capacidad general, herramientas, código y multimodalidad.', strengths: ['General','Código','Multimodal','Ecosistema'] }
  },
  anthropic: {
    ja: { desc: 'Claude は長文理解、文章作成、コード、安全で安定した対話体験に強いモデル群です。', strengths: ['長文','コード','文章作成','推論'] },
    ko: { desc: 'Claude는 긴 문서 이해, 글쓰기, 코드, 안정적인 대화 경험에 강한 모델 제품군입니다.', strengths: ['긴 문서','코드','글쓰기','추론'] },
    es: { desc: 'Claude destaca en documentos largos, escritura, código y una experiencia de conversación estable.', strengths: ['Contexto largo','Código','Escritura','Razonamiento'] }
  },
  google: {
    ja: { desc: 'Gemini は超長文脈、多モーダル入力、Google エコシステム連携が強みです。', strengths: ['長文脈','多モーダル','Google 連携','価値'] },
    ko: { desc: 'Gemini는 긴 컨텍스트, 멀티모달 입력, Google 생태계 연동이 강점입니다.', strengths: ['긴 컨텍스트','멀티모달','Google 생태계','가성비'] },
    es: { desc: 'Gemini es fuerte en contexto largo, entrada multimodal e integración con el ecosistema de Google.', strengths: ['Contexto largo','Multimodal','Google','Valor'] }
  },
  xai: {
    ja: { desc: 'Grok は X と結びつきが強く、リアルタイム情報やソーシャル動向の確認に向いています。', strengths: ['リアルタイム','推論','X 連携'] },
    ko: { desc: 'Grok은 X 플랫폼과 긴밀하게 연결되어 실시간 정보와 소셜 트렌드에 적합합니다.', strengths: ['실시간 정보','추론','X 생태계'] },
    es: { desc: 'Grok está ligado a X y resulta útil para información en tiempo real, tendencias sociales y razonamiento.', strengths: ['Tiempo real','Razonamiento','Ecosistema X'] }
  },
  deepseek: {
    ja: { desc: 'DeepSeek は低コスト、推論能力、オープンモデルの影響力で注目されています。', strengths: ['低コスト','推論','コード','オープン'] },
    ko: { desc: 'DeepSeek는 낮은 비용, 추론 능력, 오픈 모델 생태계로 주목받고 있습니다.', strengths: ['저비용','추론','코드','오픈 생태계'] },
    es: { desc: 'DeepSeek destaca por bajo costo, razonamiento y una presencia importante en modelos abiertos.', strengths: ['Bajo costo','Razonamiento','Código','Abierto'] }
  },
  alibaba: {
    ja: { desc: 'Qwen はホスト型 API とオープンウェイトモデルを幅広く提供し、中国語と企業クラウドに強いです。', strengths: ['中国語','オープンソース','クラウド','コード'] },
    ko: { desc: 'Qwen은 호스팅 API와 오픈 가중치 모델을 폭넓게 제공하며 중국어와 기업 클라우드에 강합니다.', strengths: ['중국어','오픈소스','기업 클라우드','코드'] },
    es: { desc: 'Qwen ofrece APIs alojadas y modelos abiertos, con fortaleza en chino y escenarios de nube empresarial.', strengths: ['Chino','Código abierto','Nube','Código'] }
  },
  mistral: {
    ja: { desc: 'Mistral は高性能なホスト型モデルとオープンウェイトモデルの両方を提供します。', strengths: ['オープンモデル','EU コンプライアンス','コード','速度'] },
    ko: { desc: 'Mistral은 고성능 호스팅 모델과 오픈 가중치 모델을 모두 제공합니다.', strengths: ['오픈 모델','유럽 규정','코드','속도'] },
    es: { desc: 'Mistral ofrece modelos alojados de alto rendimiento y modelos de pesos abiertos.', strengths: ['Modelos abiertos','Cumplimiento UE','Código','Velocidad'] }
  },
  openrouter: {
    ja: { desc: 'OpenRouter は複数モデルの API マーケットで、ルーティング、価格比較、素早い実験に向いています。', strengths: ['モデル集約','価格比較','実験','ルーティング'] },
    ko: { desc: 'OpenRouter는 다중 모델 API 플랫폼으로 라우팅, 가격 비교, 빠른 실험에 적합합니다.', strengths: ['모델 집계','가격 비교','빠른 실험','라우팅'] },
    es: { desc: 'OpenRouter es una plataforma API multimodelo útil para enrutamiento, comparación de precios y pruebas rápidas.', strengths: ['Agregación','Precios','Pruebas','Ruteo'] }
  }
};
const detailCopy = {
  openai: {
    zhPlain: 'OpenAI 适合做通用起点：API 文档、工具调用、结构化输出、多模态和 ChatGPT 产品生态都成熟。缺点是不一定最便宜，选型时要同时看成本和额度。',
    enPlain: 'OpenAI is a strong default starting point: docs, tool calling, structured output, multimodal support, and ChatGPT ecosystem are mature. It is not always the cheapest.',
    zhCases: [['做产品','API、工具调用、结构化输出和多模态能力比较完整。'],['写代码','旗舰模型和 Codex 系列适合复杂工程任务。'],['个人助手','ChatGPT 生态成熟，适合日常写作、学习和文件处理。']],
    enCases: [['Building products','APIs, tool calling, structured output, and multimodal capabilities are mature.'],['Coding','Flagship and Codex models fit complex engineering work.'],['Personal assistant','ChatGPT works well for writing, learning, and file workflows.']]
  },
  anthropic: {
    zhPlain: 'Claude 更像耐心的高级协作者，适合长文档、代码审查、写作润色和需要稳定语气的知识工作。',
    enPlain: 'Claude feels like a patient senior collaborator, especially useful for long documents, code review, writing, and steady knowledge work.',
    zhCases: [['长文档分析','适合合同、论文、项目资料和复杂上下文。'],['代码协作','Sonnet 系列常用于工程开发和代码审查。'],['自然写作','语气、结构和编辑质量很突出。']],
    enCases: [['Long documents','Useful for contracts, papers, project materials, and complex context.'],['Code collaboration','Sonnet models are commonly used for engineering and code review.'],['Natural writing','Strong at tone, structure, and editing quality.']]
  },
  google: {
    zhPlain: 'Gemini 的亮点是超长上下文、多模态和 Google 生态。做长文档、视频理解或 Workspace 工作流时值得重点比较。',
    enPlain: 'Gemini stands out for long context, multimodal work, and Google ecosystem integration.',
    zhCases: [['超长资料','百万级上下文适合一次性输入大量材料。'],['多模态','图片、视频和文档理解是核心优势。'],['办公场景','和 Gmail、Docs、Drive 等生态整合自然。']],
    enCases: [['Long context','Million-token context is useful for large document batches.'],['Multimodal','Image, video, and document understanding are core strengths.'],['Workspace','Integrates naturally with Gmail, Docs, and Drive.']]
  },
  xai: {
    zhPlain: 'Grok 的核心价值在实时信息和 X 生态，适合关注新闻、社交趋势和快速变化内容的用户。',
    enPlain: 'Grok is most interesting for real-time information and the X ecosystem.',
    zhCases: [['实时内容','适合跟踪 X 上的热门讨论和新闻趋势。'],['社交写作','适合短内容、观点草稿和热点总结。'],['模型尝鲜','xAI 迭代快，适合关注新模型表现。']],
    enCases: [['Real-time content','Useful for following X discussions and fast-moving topics.'],['Social writing','Good for drafts, short posts, and trend summaries.'],['Model watching','xAI moves quickly and is worth tracking.']]
  },
  deepseek: {
    zhPlain: 'DeepSeek 的卖点是价格和开放生态，适合成本敏感、批量调用、中文场景和自部署研究。',
    enPlain: 'DeepSeek is compelling for cost-sensitive API usage, Chinese products, and open-model experiments.',
    zhCases: [['低成本调用','适合摘要、分类、批处理等高调用量任务。'],['中文应用','中文理解和本地生态适配度较高。'],['研究自部署','开放模型方便二次开发和本地实验。']],
    enCases: [['Low-cost calls','Good for high-volume summarization, classification, and batch processing.'],['Chinese products','Strong fit for Chinese-language applications.'],['Self-hosting','Open models support local experiments and customization.']]
  },
  alibaba: {
    zhPlain: 'Qwen 的优势是模型矩阵完整，既有 API，也有大量开放权重版本。做中文产品或国内云生态时很值得比较。',
    enPlain: 'Qwen has a broad lineup with hosted APIs and many open-weight models, especially relevant for Chinese products.',
    zhCases: [['中文助手','中文理解、写作和办公场景覆盖完整。'],['企业落地','阿里云生态方便企业接入。'],['开源替代','Qwen 开放模型选择丰富。']],
    enCases: [['Chinese assistants','Strong Chinese writing and productivity coverage.'],['Enterprise deployment','Alibaba Cloud integration helps adoption.'],['Open alternatives','Qwen has a rich open-model lineup.']]
  },
  mistral: {
    zhPlain: 'Mistral 适合重视开放模型、欧洲供应商、企业合规和自部署的团队。',
    enPlain: 'Mistral fits teams that care about open models, European suppliers, enterprise compliance, or self-hosting.',
    zhCases: [['自部署','开放权重模型方便私有化。'],['企业合规','欧洲供应商对部分客户更有吸引力。'],['开发者 API','模型矩阵适合产品集成。']],
    enCases: [['Self-hosting','Open-weight models are useful for private deployment.'],['Enterprise compliance','A European supplier can matter for some customers.'],['Developer APIs','The model lineup fits product integration.']]
  },
  openrouter: {
    zhPlain: 'OpenRouter 的价值不是单个模型，而是把不同供应商放进一个 API 和价格体系，适合模型路由和快速试验。',
    enPlain: 'OpenRouter matters because it puts many providers behind one API and price table.',
    zhCases: [['模型路由','根据价格、可用性和质量切换模型。'],['快速比较','同一接口试多个模型更方便。'],['备用方案','供应商故障时可以切换备选模型。']],
    enCases: [['Model routing','Switch models by price, availability, and quality.'],['Fast comparison','Try many models through one interface.'],['Fallbacks','Use alternate models when a provider is unavailable.']]
  }
};
const planCopy = {
  openai: {
    zh: [['Free','$0','轻量体验 ChatGPT，额度和模型访问会随产品策略调整。'],['Plus','$20/月','适合个人高频使用，通常包含更高额度和更好的模型访问。'],['Pro','$200/月','适合需要更高额度、更强模型和深度研究能力的个人用户。'],['Team','按席位','适合小团队协作、管理和数据控制。']],
    en: [['Free','$0','Light ChatGPT access. Limits and model access can change.'],['Plus','$20/mo','For frequent personal use with higher limits and better model access.'],['Pro','$200/mo','For heavier individual use, stronger models, and advanced workflows.'],['Team','per seat','For team collaboration, admin controls, and shared workspaces.']]
  },
  anthropic: {
    zh: [['Free','$0','轻量体验 Claude，适合偶尔使用和基础写作。'],['Pro','$20/月','适合个人高频写作、长文档和代码协作。'],['Max','多档价格','适合需要更高使用额度的重度个人用户。'],['Team','按席位','适合团队共享、管理和企业协作。']],
    en: [['Free','$0','Light Claude access for occasional use and basic writing.'],['Pro','$20/mo','For frequent writing, long documents, and code collaboration.'],['Max','tiered','For heavier individual usage with higher limits.'],['Team','per seat','For team sharing, administration, and collaboration.']]
  },
  google: {
    zh: [['Free','$0','基础 Gemini 体验，适合轻量问答和日常使用。'],['Google AI Pro','$19.99/月','适合高频使用、长上下文和 Google 生态工作流。'],['Google AI Ultra','$249.99/月','适合更高额度和更强模型访问需求。'],['Workspace AI','按方案','适合企业办公、Gmail、Docs 和 Drive 场景。']],
    en: [['Free','$0','Basic Gemini access for light everyday use.'],['Google AI Pro','$19.99/mo','For frequent use, long context, and Google workflows.'],['Google AI Ultra','$249.99/mo','For higher limits and stronger model access.'],['Workspace AI','plan based','For Gmail, Docs, Drive, and business workflows.']]
  },
  xai: {
    zh: [['Free/基础','官网为准','Grok 可用额度和入口会随地区与 X 产品变化。'],['SuperGrok','官网为准','适合更高频使用 Grok 和实时信息能力。'],['X Premium+','官网为准','适合同时需要 X 平台权益和 Grok 访问的用户。']],
    en: [['Free/basic','official site','Grok access depends on region and X product changes.'],['SuperGrok','official site','For heavier Grok use and real-time information workflows.'],['X Premium+','official site','For users who want X benefits plus Grok access.']]
  },
  openrouter: {
    zh: [['API 账户','按量计费','没有传统会员套餐，重点是多模型 API 调用和余额计费。'],['模型价格','按模型变化','不同供应商、不同模型价格不同，适合做路由和成本比较。']],
    en: [['API account','usage based','No traditional subscription plan; pricing is centered on multi-model API usage.'],['Model pricing','varies by model','Prices vary by provider and model, useful for routing and cost comparison.']]
  }
};
let models = [
  ['openai','GPT-5.5','gpt-5.5',5,30,1100000,'2026-04-23',['reasoning','code','vision'],98],
  ['openai','GPT-5.5 Pro','gpt-5.5-pro',30,180,1100000,'2026-04-23',['reasoning','code','vision'],98],
  ['anthropic','Claude Sonnet 4.6','claude-sonnet-4.6',3,15,1000000,'2026-03-12',['reasoning','code','vision'],98],
  ['google','Gemini 2.5 Pro','gemini-2.5-pro',1.25,10,1000000,'2025-06-17',['reasoning','code','vision'],96],
  ['xai','Grok 4','grok-4',3,15,256000,'2025-07-09',['reasoning','web'],95],
  ['deepseek','DeepSeek R1','deepseek-r1',0.55,2.19,128000,'2025-01-20',['reasoning','code','cheap'],94],
  ['alibaba','Qwen3 Max','qwen3-max',1,4,1000000,'2025-09-05',['reasoning','code','vision'],94],
  ['mistral','Mistral Large','mistral-large',2,6,128000,'2025-02-01',['code'],91]
].map(([platform,name,id,input,output,context,releaseDate,capabilities,quality]) => ({ platform,name,id,input,output,context,releaseDate,capabilities,quality }));
const tx = (key) => (i18n[lang] || en)[key] || key;
const pName = (id) => platforms.find((p) => p.id === id)?.name || id;
const keyOf = (m) => `${m.platform}:${m.id}`;
const money = (n) => n === 0 ? '$0' : n ? `$${Number(n).toLocaleString('en-US')}` : '-';
const compact = (n) => n >= 1e6 ? `${Number((n / 1e6).toFixed(1))}M` : n >= 1e3 ? `${Math.round(n / 1e3)}K` : n || '-';
const isZh = () => lang === 'zh';
const platformDesc = (p) => lang === 'zh' ? p.description : lang === 'en' ? p.descriptionEn : platformLocales[p.id]?.[lang]?.desc || `${p.name} ${tx('publicModelData')}`;
const platformStrengths = (p) => lang === 'zh' ? p.strengths : lang === 'en' ? p.strengthsEn : platformLocales[p.id]?.[lang]?.strengths || [tx('models'), 'API'];
const capText = (c) => ({ code: tx('coding'), cheap: tx('lowCost'), vision: tx('vision'), reasoning: tx('reasoning'), open: tx('openCap'), longContext: tx('longContext'), web: tx('functionWeb'), writing: tx('functionWriting') })[c] || c;
const capabilityFilterOptions = () => [['', tx('allModels')], ['code', tx('coding')], ['cheap', tx('lowCost')], ['vision', tx('vision')], ['reasoning', tx('reasoning')]];
const localJoin = (items) => lang === 'zh' || lang === 'ja' ? items.join('、') : lang === 'ko' ? items.join(', ') : items.join(', ');
function localizedCases(p, d) {
  if (lang === 'zh' && d.zhCases) return d.zhCases;
  if (lang === 'en' && d.enCases) return d.enCases;
  return platformStrengths(p).slice(0, 3).map((x) => [x, tx('usefulCapability')]);
}
function localizedSummary(p, d) {
  if (lang === 'zh') return d.zhPlain || tx('defaultSummary');
  if (lang === 'en') return d.enPlain || tx('defaultSummary');
  return tx('defaultSummary');
}
function localizedFallbackPlans(p) {
  if (p.category.includes('consumer')) return [
    [tx('freePlan'), tx('seeOfficialSite'), tx('freeOfficialNote')],
    [tx('paid'), tx('seeOfficialSite'), tx('paidOfficialNote')]
  ];
  return [[tx('apiPlatform'), tx('usageOrOfficial'), tx('apiPlatformNote')]];
}
function localizedPlans(p) {
  const copy = planCopy[p.id];
  if (copy?.[lang]) return copy[lang];
  if (lang === 'zh' || lang === 'en') return copy?.[lang] || localizedFallbackPlans(p);
  if (copy?.en) return copy.en.map(([name, price]) => [name, price, name.toLowerCase().includes('free') ? tx('freeOfficialNote') : tx('paidOfficialNote')]);
  return localizedFallbackPlans(p);
}
function planDisplayName(name) {
  if (String(name).toLowerCase() === 'free') return tx('freePlan');
  if (String(name).toLowerCase() === 'paid') return tx('paid');
  return name;
}
function dynamicProviderCopy(id, name, text, open, cloud, lab) {
  const provider = name || id;
  const make = (description, descriptionEn, strengths, strengthsEn, zhPlain, enPlain, zhCases, enCases, functions = ['code','writing']) => ({
    description, descriptionEn, strengths, strengthsEn, functions,
    detail: { zhPlain, enPlain, zhCases, enCases }
  });
  if (/vercel|ai gateway/.test(text)) return make(
    `${provider} 是面向开发者的多模型网关，把不同模型供应商接到统一 API、监控和部署工作流里。`,
    `${provider} is a developer-focused AI gateway that connects multiple model providers behind one API, monitoring, and deployment workflow.`,
    ['统一 API','模型路由','成本控制','部署生态'], ['Unified API','Routing','Cost control','Deployment'],
    `${provider} 更适合已经在 Vercel 或现代前端栈里做产品的团队，用来统一接入多个模型、做路由、观测和成本管理。`,
    `${provider} is best for product teams already using Vercel or modern web stacks who want unified model access, routing, observability, and cost control.`,
    [['统一接入','把多个模型供应商放到一个调用入口下，减少切换成本。'],['线上产品','适合需要监控、限流、回退和部署协同的 Web 应用。'],['成本实验','可以在不同模型之间比较价格、速度和效果。']],
    [['Unified access','Put several model providers behind one call path.'],['Production apps','Useful for monitoring, rate limits, fallbacks, and web deployment workflows.'],['Cost experiments','Compare price, speed, and quality across models.']]
  );
  if (/nano/.test(text)) return make(
    `${provider} 是模型市场/中转平台，重点是低门槛试用、按量接入和快速比较不同供应商模型。`,
    `${provider} is a model marketplace and routing platform focused on low-friction trials, usage-based access, and quick provider comparison.`,
    ['模型市场','低门槛','快速试验','按量接入'], ['Marketplace','Low friction','Testing','Usage based'],
    `${provider} 适合想快速尝试不同模型、比较价格或找免费/低价入口的个人和小团队。`,
    `${provider} is useful for individuals and small teams who want to try many models quickly and compare price or free/low-cost options.`,
    [['快速尝鲜','不用逐个注册供应商，也能试多个模型。'],['价格比较','适合先看成本区间，再决定是否接官方 API。'],['轻量项目','适合原型、脚本和小规模自动化。']],
    [['Fast trials','Try many models without setting up every provider separately.'],['Price comparison','Check cost ranges before moving to official APIs.'],['Light projects','Good for prototypes, scripts, and small automations.']]
  );
  if (/kilo/.test(text)) return make(
    `${provider} 是偏开发者和 AI 编程工具的模型网关，适合在代码助手、代理和工程自动化里切换模型。`,
    `${provider} is a model gateway oriented around developer tools, coding assistants, agents, and engineering automation.`,
    ['编程工具','模型网关','代理工作流','快速切换'], ['Coding tools','Gateway','Agent workflows','Switching'],
    `${provider} 的价值在工程工作流：让代码助手或 agent 可以接入多家模型，并按任务在速度、价格和能力之间切换。`,
    `${provider} is valuable in engineering workflows where coding assistants or agents need access to multiple models and task-based routing.`,
    [['代码助手','适合编辑器、CLI 或 agent 工具接入多模型。'],['任务路由','不同代码任务可切到不同价格和能力的模型。'],['实验环境','适合团队比较模型在工程任务中的表现。']],
    [['Coding assistants','Connect editor, CLI, or agent tools to multiple models.'],['Task routing','Route coding tasks by price and capability.'],['Experimentation','Compare model behavior on engineering tasks.']]
  );
  if (/llm gateway|gateway/.test(text)) return make(
    `${provider} 是通用 LLM 网关，核心是统一模型接入、路由和供应商管理。`,
    `${provider} is a general LLM gateway for unified model access, routing, and provider management.`,
    ['统一接入','路由','供应商管理','API'], ['Unified access','Routing','Provider management','API'],
    `${provider} 适合已经有应用但不想被单一模型供应商绑定的团队，用来做模型切换、成本控制和可用性备份。`,
    `${provider} helps teams avoid lock-in by centralizing model switching, cost control, and availability fallbacks.`,
    [['供应商抽象','把不同模型放进同一层接口。'],['备份策略','某个供应商不可用时可以切到替代模型。'],['成本治理','适合跟踪不同模型的价格和调用量。']],
    [['Provider abstraction','Put different models behind one interface.'],['Fallbacks','Switch when a provider is unavailable.'],['Cost governance','Track model pricing and usage.']]
  );
  if (/poe/.test(text)) return make(
    `${provider} 是面向消费者和创作者的多机器人平台，适合快速使用不同聊天机器人和分享自定义 bot。`,
    `${provider} is a consumer and creator platform for using many chatbots and sharing custom bots.`,
    ['多机器人','消费产品','自定义 Bot','发现'], ['Multi-bot','Consumer app','Custom bots','Discovery'],
    `${provider} 更像 AI 应用商店，适合想直接体验模型、创建 bot 或比较不同聊天体验的用户。`,
    `${provider} is closer to an AI app store for trying models, building bots, and comparing chatbot experiences.`,
    [['直接体验','不需要写代码即可试多个模型和 bot。'],['Bot 分享','适合制作面向用户的轻量 bot。'],['模型发现','适合发现不同模型的交互风格。']],
    [['Direct use','Try many models and bots without coding.'],['Bot sharing','Create lightweight user-facing bots.'],['Discovery','Compare model interaction styles.']],
    ['writing','web']
  );
  if (/azure|microsoft/.test(text)) return make(
    `${provider} 是微软云上的 AI 模型/API 平台，适合企业合规、Azure 生态和生产级集成。`,
    `${provider} is Microsoft Azure's AI model/API platform for enterprise compliance, Azure ecosystem integration, and production use.`,
    ['企业云','合规','Azure 生态','生产部署'], ['Enterprise cloud','Compliance','Azure ecosystem','Production'],
    `${provider} 适合已经使用 Azure 的企业，把模型能力接入现有身份、网络、安全和运维体系。`,
    `${provider} fits organizations already on Azure that need models connected to identity, networking, security, and operations.`,
    [['企业接入','适合和 Azure 权限、网络和监控结合。'],['合规采购','企业采购和区域合规通常更顺。'],['生产系统','适合稳定 API、治理和 SLA 诉求。']],
    [['Enterprise integration','Works with Azure identity, networking, and monitoring.'],['Procurement','Can fit enterprise purchasing and regional compliance.'],['Production systems','Good for governance, APIs, and SLA needs.']]
  );
  if (/aws|bedrock|amazon/.test(text)) return make(
    `${provider} 是 AWS 生态里的模型平台，适合企业把多家基础模型接入云上应用和数据系统。`,
    `${provider} is an AWS model platform for connecting foundation models to cloud applications and data systems.`,
    ['AWS 生态','企业云','多模型','安全治理'], ['AWS ecosystem','Enterprise cloud','Multi-model','Governance'],
    `${provider} 适合 AWS 用户在现有云架构里使用多家模型，同时保留企业安全、权限和数据治理能力。`,
    `${provider} fits AWS users who want multiple models inside existing cloud architecture with security and governance controls.`,
    [['云上应用','适合和 AWS 数据、函数和权限体系集成。'],['多模型采购','同一云平台里接入不同模型供应商。'],['企业治理','适合重视安全、日志和权限控制的团队。']],
    [['Cloud apps','Integrate with AWS data, compute, and identity.'],['Multi-model access','Use several model providers in one cloud platform.'],['Governance','Useful for security, logs, and access control.']]
  );
  if (/vertex|google cloud/.test(text)) return make(
    `${provider} 是 Google Cloud 的 AI 平台，适合在企业云、数据分析和 Gemini 模型之间做生产级集成。`,
    `${provider} is Google Cloud's AI platform for production integration across enterprise cloud, data analytics, and Gemini models.`,
    ['Google Cloud','企业云','Gemini','数据集成'], ['Google Cloud','Enterprise cloud','Gemini','Data integration'],
    `${provider} 适合 Google Cloud 用户，把 Gemini 和模型工具接到数据、权限和云上生产流程里。`,
    `${provider} fits Google Cloud users who need Gemini and model tooling connected to data, identity, and production workflows.`,
    [['云端部署','适合和 Google Cloud 项目、权限和监控绑定。'],['数据工作流','适合围绕 BigQuery、文档和多模态数据构建。'],['企业应用','适合要求治理和生产环境的团队。']],
    [['Cloud deployment','Works with Google Cloud projects, identity, and monitoring.'],['Data workflows','Good around BigQuery, documents, and multimodal data.'],['Enterprise apps','Useful when governance and production controls matter.']]
  );
  if (/github/.test(text)) return make(
    `${provider} 把模型能力接入 GitHub 开发生态，适合代码生成、评审、自动化和开发者工作流。`,
    `${provider} brings model access into the GitHub developer ecosystem for code generation, review, automation, and engineering workflows.`,
    ['开发者生态','代码','工作流','GitHub'], ['Developer ecosystem','Code','Workflows','GitHub'],
    `${provider} 更适合围绕仓库、Issue、PR 和代码自动化使用模型，而不是普通聊天入口。`,
    `${provider} is better for repository, issue, pull request, and code automation workflows than general chat.`,
    [['代码工作流','适合围绕仓库和 PR 使用模型。'],['开发自动化','适合脚本、CI 和工程助手。'],['模型试验','方便开发者在熟悉的平台比较模型。']],
    [['Code workflows','Use models around repositories and pull requests.'],['Developer automation','Good for scripts, CI, and engineering assistants.'],['Model trials','Compare models inside a familiar developer platform.']]
  );
  if (/cloudflare/.test(text)) return make(
    `${provider} 适合在边缘网络和 Workers 生态里接入模型，强调低延迟、部署便利和平台集成。`,
    `${provider} connects models into the Cloudflare edge and Workers ecosystem, emphasizing low latency, deployment, and platform integration.`,
    ['边缘部署','Workers','低延迟','平台集成'], ['Edge','Workers','Low latency','Platform integration'],
    `${provider} 适合已经使用 Cloudflare 的网站和应用，把 AI 调用放进边缘函数、网关和安全体系里。`,
    `${provider} fits Cloudflare users who want AI calls inside edge functions, gateways, and security workflows.`,
    [['边缘应用','适合靠近用户执行 AI 逻辑。'],['站点集成','适合和现有 Cloudflare 域名、Workers、缓存结合。'],['轻量后端','适合不用重后端也能接模型。']],
    [['Edge apps','Run AI logic close to users.'],['Site integration','Works with Cloudflare domains, Workers, and caching.'],['Light backends','Use models without a heavy backend.']]
  );
  if (/together|replicate|fireworks|novita/.test(text)) return make(
    `${provider} 是模型推理/托管平台，适合调用开源模型、做批量推理和寻找官方 API 之外的部署选择。`,
    `${provider} is an inference and hosting platform for open models, batch inference, and deployment alternatives beyond official APIs.`,
    ['推理平台','开源模型','托管 API','批量调用'], ['Inference','Open models','Hosted API','Batch calls'],
    `${provider} 适合需要大量调用开源模型、快速部署模型 API 或比较不同推理后端的团队。`,
    `${provider} fits teams that need open-model inference, quick hosted APIs, or comparison across inference backends.`,
    [['开源模型','适合调用 Llama、Qwen、Mistral 等开放模型。'],['批量推理','适合大批量文本或图像任务。'],['部署替代','可作为官方 API 之外的选择。']],
    [['Open models','Use Llama, Qwen, Mistral, and similar models.'],['Batch inference','Good for high-volume text or image tasks.'],['Deployment alternative','A route beyond official APIs.']]
  );
  if (/perplexity/.test(text)) return make(
    `${provider} 以联网搜索和答案产品为核心，适合资料检索、事实核查和带来源的问答。`,
    `${provider} centers on web search and answer products for research, fact checking, and cited answers.`,
    ['联网搜索','答案引擎','引用来源','研究'], ['Web search','Answer engine','Citations','Research'],
    `${provider} 适合需要实时资料、引用来源和快速研究总结的用户，而不是单纯写作或代码模型。`,
    `${provider} is useful when current information, citations, and fast research summaries matter more than pure writing or coding.`,
    [['资料检索','适合找最新信息和来源。'],['事实核查','适合带引用地验证观点。'],['研究摘要','适合快速整理主题资料。']],
    [['Research','Find current information and sources.'],['Fact checks','Verify claims with citations.'],['Summaries','Quickly organize topic research.']],
    ['web','writing']
  );
  if (/cohere/.test(text)) return make(
    `${provider} 面向企业 NLP、检索增强和文本理解，适合 RAG、搜索、分类和内部知识库。`,
    `${provider} focuses on enterprise NLP, retrieval, and text understanding for RAG, search, classification, and knowledge bases.`,
    ['企业 NLP','RAG','检索','分类'], ['Enterprise NLP','RAG','Retrieval','Classification'],
    `${provider} 适合做企业知识库、语义搜索、重排序和文本分类，不只是通用聊天。`,
    `${provider} fits enterprise knowledge bases, semantic search, reranking, and text classification beyond general chat.`,
    [['知识库','适合 RAG 和内部文档检索。'],['搜索排序','适合 embedding、rerank 和语义匹配。'],['企业文本','适合分类、抽取和分析。']],
    [['Knowledge bases','Useful for RAG and internal document retrieval.'],['Search ranking','Good for embeddings, reranking, and semantic match.'],['Enterprise text','Useful for classification, extraction, and analysis.']]
  );
  if (/meta|llama/.test(text)) return make(
    `${provider} 主要围绕开放模型生态，适合自部署、研究和基于 Llama 系列的二次开发。`,
    `${provider} is centered on open-model ecosystems, self-hosting, research, and development around Llama-style models.`,
    ['开放模型','自部署','研究','生态'], ['Open models','Self-hosting','Research','Ecosystem'],
    `${provider} 适合需要可控部署、开放权重和生态兼容的团队。`,
    `${provider} fits teams that need controllable deployment, open weights, and ecosystem compatibility.`,
    [['自部署','适合私有化和本地实验。'],['生态兼容','围绕开放模型有丰富工具链。'],['研究开发','适合微调、评测和二次开发。']],
    [['Self-hosting','Good for private deployment and local experiments.'],['Ecosystem','Open models have broad tooling.'],['Research','Useful for fine-tuning, evaluation, and customization.']]
  );
  const kind = cloud ? '云平台' : lab ? '自研模型平台' : open ? '开放模型供应商' : '模型供应商';
  const kindEn = cloud ? 'cloud platform' : lab ? 'model lab' : open ? 'open-model provider' : 'model provider';
  return make(
    `${provider} 是${kind}，这里汇总它在公开数据中的模型、价格区间和能力标签。`,
    `${provider} is a ${kindEn}; this page summarizes its public models, pricing ranges, and capability tags.`,
    cloud ? ['云平台','模型接入','企业集成'] : open ? ['开放模型','API','模型数据'] : ['模型供应','API','价格比较'],
    cloud ? ['Cloud','Model access','Enterprise integration'] : open ? ['Open models','API','Model data'] : ['Model access','API','Price comparison'],
    `${provider} 适合用来比较公开模型、API 成本和能力覆盖。更具体的套餐和限制应继续以官网为准。`,
    `${provider} is useful for comparing public models, API costs, and capability coverage. Exact plans and limits should still be checked on the official site.`,
    [['模型筛选','先看模型数量、能力标签和价格范围。'],['API 比较','适合和其他供应商一起比较调用成本。'],['官网核验','生产使用前继续查看官方文档和价格页。']],
    [['Model screening','Start with model count, capability tags, and price ranges.'],['API comparison','Compare calling costs against other providers.'],['Official check','Review official docs and pricing before production use.']]
  );
}
function score(m) {
  const cost = m.input + m.output, speed = Math.max(45, Math.min(96, Math.round(95 - cost * .75))), eff = Math.max(35, Math.min(98, Math.round(100 - cost)));
  const coding = m.capabilities.includes('code') ? Math.min(100, m.quality + 4) : m.quality - 8;
  const reasoning = m.capabilities.includes('reasoning') ? Math.min(100, m.quality + 3) : m.quality - 6;
  const multimodal = m.capabilities.includes('vision') ? Math.min(100, m.quality + 1) : Math.max(45, m.quality - 18);
  return { lmArena: m.quality, aa: m.quality, coding, reasoning, multimodal, speed, efficiency: eff, average: Math.round((m.quality + coding + reasoning + multimodal + speed + eff) / 6) };
}
function radar(s, big = false) {
  const vals = [s.aa,s.coding,s.reasoning,s.multimodal,s.speed,s.efficiency];
  const labels = [tx('aaIndex'),tx('coding'),tx('reasoning'),tx('multimodal'),tx('speed'),tx('costEfficiency')];
  const shortLabels = ['AA','CODE','REAS','MULTI','SPEED','COST'];
  const r = big ? 32 : 38;
  const pt = (i, v) => [50 + Math.cos(-Math.PI / 2 + i * Math.PI / 3) * r * v / 100, 50 + Math.sin(-Math.PI / 2 + i * Math.PI / 3) * r * v / 100];
  const poly = vals.map((v,i) => pt(i,v).join(',')).join(' ');
  // 4 concentric grid rings: 25/50/75/100%
  const rings = [25,50,75,100].map((v) => vals.map((_,i) => pt(i,v).join(',')).join(' '));
  // 6 spokes from center to perimeter
  const spokes = vals.map((_,i) => { const [x,y] = pt(i,100); return `<line class='radar-spoke' x1='50' y1='50' x2='${x}' y2='${y}'/>`; }).join('');
  // Value dots at each vertex
  const dots = vals.map((v,i) => { const [x,y] = pt(i,v); return `<circle class='radar-dot' cx='${x}' cy='${y}' r='${big ? 1.6 : 1.2}'/>`; }).join('');
  // Labels: full text on big, short on small (or none if too tiny)
  const lbl = labels.map((l,i) => {
    const radius = big ? r + 14 : r + 9;
    const [x,y] = [50 + Math.cos(-Math.PI/2 + i*Math.PI/3) * radius, 50 + Math.sin(-Math.PI/2 + i*Math.PI/3) * radius];
    const txt = big ? `${l} ${vals[i]}` : shortLabels[i];
    return `<text class='radar-label' x='${x}' y='${y}' text-anchor='middle' dominant-baseline='central'>${txt}</text>`;
  }).join('');
  const gradId = `rg-${Math.random().toString(36).slice(2,8)}`;
  return `<button class='six-axis-button' type='button'><svg class='radar-svg ${big ? 'large-radar' : ''}' viewBox="${big ? '-22 -16 144 132' : '-14 -12 128 124'}" aria-hidden='true'><defs><radialGradient id='${gradId}' cx='50%' cy='50%' r='50%'><stop offset='0%' stop-color='var(--accent)' stop-opacity='.35'/><stop offset='100%' stop-color='var(--accent)' stop-opacity='.08'/></radialGradient></defs><polygon class='radar-grid radar-grid-outer' points='${rings[3]}'/><polygon class='radar-grid' points='${rings[2]}'/><polygon class='radar-grid' points='${rings[1]}'/><polygon class='radar-grid radar-grid-inner' points='${rings[0]}'/>${spokes}<polygon class='radar-fill' fill='url(#${gradId})' points='${poly}'/><polygon class='radar-line' points='${poly}'/>${dots}${lbl}</svg></button>`;
}
function platformModels(id = activePlatform) { return models.filter((m) => m.platform === id).sort((a,b) => Date.parse(b.releaseDate || 0) - Date.parse(a.releaseDate || 0) || b.quality - a.quality); }
function addProvider(id, raw, rawModels) {
  if (platforms.some((p) => p.id === id)) return;
  const name = raw?.name || id;
  const text = `${id} ${name}`.toLowerCase(), open = rawModels.some((m) => m.open_weights || m.weights === 'Open');
  const lab = /(cohere|meta|llama|microsoft|nvidia|stability|moonshot|baidu|zhipu|reka|writer|perplexity|groq)/.test(text), cloud = /(aws|azure|vertex|cloudflare|oracle|bedrock)/.test(text);
  const copy = dynamicProviderCopy(id, name, text, open, cloud, lab);
  platforms.push({ id, name, logo: `https://models.dev/logos/${id}.svg`, website: raw?.website || raw?.url || '', planUrl: raw?.pricing || '', types: [lab && 'modelLab', open && 'open', cloud && 'cloud', (!lab || /openrouter|together|replicate|fireworks|vercel|github|nano|gateway/.test(text)) && 'aggregator'].filter(Boolean), category: ['api', open && 'open'].filter(Boolean), functions: copy.functions, description: copy.description, descriptionEn: copy.descriptionEn, strengths: copy.strengths, strengthsEn: copy.strengthsEn });
  detailCopy[id] = detailCopy[id] || copy.detail;
}
function caps(item, input, context) {
  const text = `${item.name} ${item.id}`.toLowerCase(), list = [];
  if (item.reasoning || /reason|thinking|r1|o[0-9]/.test(text)) list.push('reasoning');
  if (item.tool_call || /code|coder|codex/.test(text)) list.push('code');
  if (input > 0 && input <= .5) list.push('cheap');
  if (context >= 5e5) list.push('longContext');
  if ((item.modalities?.input || []).some((x) => ['image','video','pdf'].includes(x))) list.push('vision');
  if (item.open_weights || item.weights === 'Open') list.push('open');
  return [...new Set(list)];
}
async function fetchModelsData() {
  // Prefer the locally-synced snapshot (reviewed via PR by the daily Action).
  // Fall back to the upstream API if the snapshot is missing (first-run case).
  try {
    const local = await fetch('/data/models-dev.json', { cache: 'no-cache' });
    if (local.ok) return { json: await local.json(), source: 'synced' };
  } catch (_) {}
  const upstream = await fetch('https://models.dev/api.json', { cache: 'no-store' });
  return { json: await upstream.json(), source: 'upstream' };
}
async function loadLive() {
  try {
    const { json, source } = await fetchModelsData(), live = [];
    Object.entries(json).forEach(([pid,p]) => {
      const list = Array.isArray(p?.models) ? p.models : Object.values(p?.models || {});
      addProvider(pid, p, list);
      list.forEach((m) => {
        const context = Number(m.context_limit ?? m.context ?? m.limit?.context ?? 0), input = Number(m.input_cost ?? m.cost?.input ?? m.pricing?.input ?? 0), output = Number(m.output_cost ?? m.cost?.output ?? m.pricing?.output ?? 0);
        if (!m.name || !context) return;
        const c = caps(m, input, context), q = Math.max(60, Math.min(98, 70 + Math.min(12, Math.round(Math.log10(context) * 2)) + (m.reasoning ? 6 : 0) + (m.tool_call ? 3 : 0)));
        live.push({ platform: pid, name: m.name, id: m.id || m.model_id || m.name, input, output, context, releaseDate: m.release_date || m.releaseDate || '', capabilities: c, quality: q });
      });
    });
    models = [...new Map([...models, ...live].map((m) => [keyOf(m), m])).values()];
    dataState = { kind: 'live', count: live.length, source };
    render();
  } catch { dataState = { kind: 'unavailable', count: 0 }; updateText(); }
}
function filteredPlatforms() {
  // Normalize away separators so "gpt 5.5", "gpt-5.5" and "gpt5.5" all match.
  // Provider listings disagree on separators (OpenAI lists "gpt-5.5", Vercel
  // lists "gpt 5.5 pro"), so a raw substring test missed the real provider.
  const norm = (s) => s.toLowerCase().replace(/[\s\-_]+/g, '');
  const q = norm($('platformSearch').value);
  return platforms.filter((p) => (!platformFilter || p.types.includes(platformFilter) || platformFilter === 'consumer' && p.category.includes('consumer')) && (!functionFilter || p.functions.includes(functionFilter))).filter((p) => !q || norm([p.name,p.description,p.descriptionEn,platformDesc(p),p.strengths.join(' '),p.strengthsEn.join(' '),platformStrengths(p).join(' '),...platformModels(p.id).map((m) => `${m.name} ${m.id} ${m.capabilities.map(capText).join(' ')} ${m.capabilities.join(' ')}`)].join(' ')).includes(q)).sort((a,b) => (b.types.includes('mainstream') - a.types.includes('mainstream')) || platformModels(b.id).length - platformModels(a.id).length);
}
function filteredModels() {
  const norm = (s) => s.toLowerCase().replace(/[\s\-_]+/g, '');
  const q = norm($('platformSearch').value);
  if (!q) return [];
  return models
    .filter((m) => norm(`${m.name} ${m.id} ${m.platform} ${m.capabilities.map(capText).join(' ')}`).includes(q))
    .sort((a, b) => score(b).average - score(a).average)
    .slice(0, 12);
}
function renderList() {
  const list = filteredPlatforms();
  const q = ($('platformSearch').value || '').trim();
  if (!list.length) {
    $('platformList').innerHTML = `<div class='empty-results'><p class='empty-results-icon'>○</p><p class='empty-results-title'>${q ? tx('noResultsFor').replace('{q}', q) : tx('noResults')}</p><p class='empty-results-hint'>${tx('noResultsHint')}</p><button class='empty-results-clear' type='button' id='emptyClearBtn'>${tx('clearSearch')}</button></div>`;
    const cb = document.getElementById('emptyClearBtn');
    if (cb) cb.onclick = () => { $('platformSearch').value=''; platformFilter=''; functionFilter=''; document.querySelectorAll('.filter-chip,.function-chip').forEach((x)=>x.classList.remove('active')); document.querySelector('.filter-chip[data-filter=""]').classList.add('active'); renderList(); };
    const mr = $('modelResults'); if (mr) mr.innerHTML = '';
    return;
  }
  $('platformList').innerHTML = list.map((p) => { const ms = platformModels(p.id), best = ms[0]; return `<button class='platform-card ${p.id === activePlatform ? 'active' : ''}' data-id='${p.id}'><div class='platform-card-top'><img src='${p.logo}' alt=''><div><strong>${p.name}</strong><span>${platformDesc(p)}</span></div></div><div class='feature-icons'><span class='feature-icon ${p.category.includes('consumer') ? 'on' : ''}'>$</span><span class='feature-icon ${p.types.includes('open') ? 'on' : ''}'>OS</span></div><div class='mini-stats'><span>${tx('lowestApi')} <b>${money(Math.min(...ms.map((m) => m.input), 0))}</b></span><span>${tx('bestModel')} <b>${best?.name || '-'}</b></span></div></button>`; }).join('');
  const mResults = filteredModels();
  const mr = $('modelResults');
  if (mr) {
    mr.innerHTML = mResults.length
      ? `<p class="results-group-label">${tx('models')}</p>` + mResults.map((m) =>
          `<button class="model-result" data-key="${keyOf(m)}"><strong>${m.name}</strong><span>${pName(m.platform)} · ${money(m.input)} · ${m.capabilities.map(capText).join(' ')}</span></button>`).join('')
      : '';
    mr.querySelectorAll('.model-result').forEach((b) => b.onclick = () => openModel(b.dataset.key));
  }
  document.querySelectorAll('.platform-card').forEach((b) => b.onclick = () => {
    activePlatform = b.dataset.id;
    // Mobile list→detail nav: remember scroll, open workspace overlay
    if (window.innerWidth <= 760) {
      window._mobileListScrollY = window.scrollY;
      document.body.classList.add('mobile-workspace-open');
      window.scrollTo(0, 0);
    }
    render();
  });
}
function renderDetail() {
  const p = platforms.find((x) => x.id === activePlatform) || platforms[0], ms = platformModels(p.id), min = Math.min(...ms.map((m) => m.input), 0), maxIn = Math.max(...ms.map((m) => m.input), 0), maxOut = Math.max(...ms.map((m) => m.output), 0);
  const d = detailCopy[p.id] || {};
  $('platformTitle').textContent = p.name; $('platformName').textContent = p.name; $('platformDescription').textContent = platformDesc(p); $('providerLogo').src = p.logo; $('websiteLink').href = p.website || '#';
  $('strengthTags').innerHTML = platformStrengths(p).map((x) => `<span>${x}</span>`).join('');
  $('platformTypeBlock').innerHTML = `<span>${tx('advantage')}</span><strong>${p.types.map((x) => tx(x === 'open' ? 'openSource' : x)).join(' + ')}</strong><p>${ms.length} ${tx('models')} · ${p.types.includes('open') ? tx('openStatus') : tx('closedStatus')}</p>`;
  $('lowestPlan').textContent = p.category.includes('consumer') ? tx('freeMultiple') : tx('seeOfficialSite');
  $('apiPricing').textContent = `${money(min)}-${money(maxIn)} ${tx('inputShort')} / $0-${money(maxOut)} ${tx('outputShort')}`;
  $('bestForLabel').textContent = localJoin(platformStrengths(p));
  $('plainSummary').textContent = localizedSummary(p, d);
  $('sourceBadges').innerHTML = [tx('officialPricing'),'models.dev',tx('benchmarks')].map((x) => `<span class='source-badge'>${x}</span>`).join('');
  $('useCases').innerHTML = localizedCases(p, d).map(([title,note]) => `<article class='use-case'><h4>${title}</h4><p>${note}</p></article>`).join('');
}
function row(m, company = false) { const s = score(m); return `<tr class='model-row' data-key='${keyOf(m)}'><td data-label='${tx('model')}' class='td-name'><div class='model-name'>${m.name}${modelSlugSet.has(canonSlug(m.name)) ? ` <a class="row-page-link" href="/models/${canonSlug(m.name)}/" onclick="event.stopPropagation()" title="${tx('viewFullPage')}">↗</a>` : ''}</div><div class='model-id'>${m.id}</div></td>${company ? `<td data-label='${tx('company')}'>${pName(m.platform)}</td>` : ''}<td data-label='${tx('inputPrice')}'>${money(m.input)}</td><td data-label='${tx('outputPrice')}'>${money(m.output)}</td><td data-label='${tx('context')}'>${compact(m.context)}</td><td data-label='${tx('releaseDate')}'>${m.releaseDate || tx('unknown')}</td><td data-label='${tx('capabilities')}' class='td-capabilities'><div class='capability-list'>${m.capabilities.map(cap).join('')}</div></td><td data-label='${tx('lmArena')}' class='td-lmarena'><b>${s.lmArena}</b></td><td data-label='${tx('sixDimChart')}' class='td-radar'>${radar(s)}</td></tr>`; }
function cap(c) { return `<span class='capability-tag'>${capText(c)}</span>`; }
function renderModels() {
  const caps = capabilityFilterOptions();
  $('capabilityFilters').innerHTML = caps.map(([k,v]) => `<button class='capability-chip ${modelCap === k ? 'active' : ''}' data-cap='${k}'>${v}</button>`).join('');
  document.querySelectorAll('#capabilityFilters button').forEach((b) => b.onclick = () => { modelCap = b.dataset.cap; renderModels(); });
  const val = (m,k) => k === 'name' ? m.name : k === 'releaseDate' ? Date.parse(m.releaseDate || 0) : k === 'lmArena' ? m.quality : k === 'average' ? score(m).average : m[k] || 0;
  const rows = platformModels().filter((m) => !modelCap || m.capabilities.includes(modelCap)).sort((a,b) => (val(a,sortKey) > val(b,sortKey) ? 1 : -1) * (sortDir === 'asc' ? 1 : -1));
  $('modelRows').innerHTML = rows.map((m) => row(m)).join(''); bindRows(document);
}
function renderPlans() {
  const p = platforms.find((x) => x.id === activePlatform);
  $('planSourceLink').href = p.planUrl || p.website || '#';
  const plans = localizedPlans(p);
  $('planList').innerHTML = plans.map(([name,price,note]) => `<article class='plan-card'><h4>${planDisplayName(name)} · ${price}</h4><p>${note}</p></article>`).join('');
}
function renderCompare() {
  const companies = platforms.slice(0, 36);
  $('companyFilters').innerHTML = companies.map((p) => `<button class='company-chip ${compareCompany === p.id ? 'active' : ''}' data-id='${p.id}'>${p.name}</button>`).join('');
  const caps = capabilityFilterOptions();
  $('compareCapabilityFilters').innerHTML = caps.map(([k,v]) => `<button class='capability-chip ${(!k && !compareCaps.size) || compareCaps.has(k) ? 'active' : ''}' data-cap='${k}'>${v}</button>`).join('');
  const scoped = platformModels(compareCompany).filter((m) => !compareCaps.size || [...compareCaps].every((c) => m.capabilities.includes(c))).slice(0, 100);
  $('modelFilters').innerHTML = scoped.map((m) => `<button class='model-chip ${selectedModels.has(keyOf(m)) ? 'active' : ''}' data-key='${keyOf(m)}'>${m.name}</button>`).join('');
  const picked = [...selectedModels].map((k) => models.find((m) => keyOf(m) === k)).filter(Boolean);
  $('selectedModelList').innerHTML = picked.length ? picked.map((m) => `<button class='selected-model-pill' data-key='${keyOf(m)}'><strong>${m.name}</strong><span>${pName(m.platform)} · LMArena ${m.quality}</span></button>`).join('') : `<p class='empty-note'>${tx('noSelection')}</p>`;
  // Show onboarding placeholder when nothing picked; show table only after user selects models
  if (picked.length === 0) {
    $('compareRows').innerHTML = `<tr><td colspan='9'><div class='compare-empty'><div class='compare-empty-icon'>⊕</div><h3>${tx('compareEmptyTitle')}</h3><p>${tx('compareEmptyHint')}</p></div></td></tr>`;
  } else {
    $('compareRows').innerHTML = picked.map((m) => row(m, true)).join('');
  }
  document.querySelectorAll('#companyFilters button').forEach((b) => b.onclick = () => { compareCompany = b.dataset.id; renderCompare(); });
  document.querySelectorAll('#compareCapabilityFilters button').forEach((b) => b.onclick = () => { const c = b.dataset.cap; c ? (compareCaps.has(c) ? compareCaps.delete(c) : compareCaps.add(c)) : compareCaps.clear(); renderCompare(); });
  document.querySelectorAll('#modelFilters button').forEach((b) => b.onclick = () => { selectedModels.has(b.dataset.key) ? selectedModels.delete(b.dataset.key) : selectedModels.add(b.dataset.key); renderCompare(); });
  document.querySelectorAll('.selected-model-pill').forEach((b) => b.onclick = () => { selectedModels.delete(b.dataset.key); renderCompare(); });
  bindRows($('compareModal'));
}
function bindRows(root) { root.querySelectorAll('.model-row').forEach((tr) => tr.onclick = () => openModel(tr.dataset.key)); }
function openModel(k) {
  const m = models.find((x) => keyOf(x) === k); if (!m) return;
  const s = score(m), p = platforms.find((x) => x.id === m.platform) || {};
  $('modelDetailProvider').textContent = pName(m.platform); $('modelDetailTitle').textContent = m.name;
  const ratio = m.input > 0 ? (m.output / m.input).toFixed(1) : '-';
  const verdict = s.average >= 85 ? tx('verdictTier1') : s.average >= 70 ? tx('verdictTier2') : tx('verdictTier3');
  const dims = [
    ['aaIndex', s.aa, '#8c1e1e'],
    ['coding', s.coding, '#1d4a47'],
    ['reasoning', s.reasoning, '#8c1e1e'],
    ['multimodal', s.multimodal, '#1d4a47'],
    ['speed', s.speed, '#8c1e1e'],
    ['costEfficiency', s.efficiency, '#1d4a47']
  ];
  const dimBars = dims.map(([k,v,c]) => `<div class='dim-row'><span class='dim-name'>${tx(k)}</span><div class='dim-bar'><span class='dim-fill' style='width:${v}%;background:${c}'></span></div><b class='dim-val'>${v}</b></div>`).join('');
  const capBadges = m.capabilities.map((c) => `<span class='cap-badge cap-${c}'>${capText(c)}</span>`).join('');
  $('modelDetailContent').innerHTML = `
    <div class='detail-hero'>
      <div class='detail-hero-left'>
        <img class='detail-hero-logo' src='${p.logo || ''}' alt='' onerror="this.style.display='none'">
        <div>
          <p class='detail-hero-provider'>${pName(m.platform)}</p>
          <h2 class='detail-hero-name'>${m.name}</h2>
          <p class='detail-hero-id'><code>${m.id}</code></p>
        </div>
      </div>
      <div class='detail-hero-verdict'>
        <span>${tx('verdict')}</span>
        <strong>${verdict}</strong>
        <em>${tx('average')} ${s.average}/100</em>
      </div>
    </div>
    <div class='detail-stats'>
      <div class='stat-item'><span>${tx('inputPrice')}</span><strong>${money(m.input)}</strong><em>/1M ${tx('tokens')}</em></div>
      <div class='stat-item'><span>${tx('outputPrice')}</span><strong>${money(m.output)}</strong><em>/1M ${tx('tokens')}</em></div>
      <div class='stat-item'><span>${tx('outputInputRatio')}</span><strong>${ratio}×</strong><em>${tx('outputCostMultiple')}</em></div>
      <div class='stat-item'><span>${tx('context')}</span><strong>${compact(m.context)}</strong><em>${tx('tokens')}</em></div>
      <div class='stat-item'><span>${tx('releaseDate')}</span><strong>${m.releaseDate || '-'}</strong><em>${m.releaseDate ? tx('released') : ''}</em></div>
      <div class='stat-item'><span>${tx('lmArena')}</span><strong>${s.lmArena}</strong><em>${tx('arenaRank')}</em></div>
    </div>
    ${capBadges ? `<div class='detail-caps'>${capBadges}</div>` : ''}
    <div class='detail-radar-section'>
      <div class='detail-radar-chart'>${radar(s, true)}</div>
      <div class='detail-radar-table'>
        <p class='detail-section-eyebrow'>${tx('sixDimChart')}</p>
        <h3>${tx('capabilityProfile')}</h3>
        ${dimBars}
      </div>
    </div>
    <div class='detail-actions'>
      ${modelSlugSet.has(canonSlug(m.name)) ? `<a class='detail-cta detail-fullpage' href='/models/${canonSlug(m.name)}/'>${tx('viewFullPage')} →</a>` : ''}
      ${p.website ? `<a class='detail-cta' href='${p.website}' target='_blank' rel='noopener nofollow'>${tx('officialDocs')} ↗</a>` : ''}
      <button class='detail-cta detail-cta-compare' type='button' id='detailCompareBtn'>${tx('compareThisModel')} →</button>
    </div>
    <div class='ad-slot ad-slot-detail'></div>`;
  // Wire compare CTA: close detail, open compare with this model pre-selected
  const cmpBtn = document.getElementById('detailCompareBtn');
  if (cmpBtn) cmpBtn.onclick = () => {
    selectedModels.add(keyOf(m));
    $('modelDetailModal').classList.remove('open');
    $('compareModal').classList.add('open');
    renderCompare();
  };
  $('modelDetailModal').classList.add('open');
}
function updateText() {
  document.documentElement.lang = { zh: 'zh-CN', en: 'en', ja: 'ja', ko: 'ko', es: 'es' }[lang] || 'en';
  document.querySelectorAll('[data-i18n]').forEach((el) => el.textContent = tx(el.dataset.i18n));
  $('brandName').textContent = tx('brandName'); $('languageSelect').value = lang;
  $('dataSource').textContent = dataState.kind === 'live' ? tx('curatedPlans') : dataState.kind === 'unavailable' ? tx('liveUnavailable') : tx('seedData');
  $('updatedAt').textContent = dataState.kind === 'live' ? `${dataState.count} ${tx('models')} · ${platforms.length} ${tx('companies')} · ${new Date().toLocaleDateString(document.documentElement.lang)}` : tx('updatedToday');
}
function render() { updateText(); renderList(); renderDetail(); renderModels(); renderPlans(); if ($('compareModal').classList.contains('open')) renderCompare(); }
document.querySelectorAll('.filter-chip').forEach((b) => b.onclick = () => { platformFilter = platformFilter === b.dataset.filter ? '' : b.dataset.filter; document.querySelectorAll('.filter-chip').forEach((x) => x.classList.toggle('active', x.dataset.filter === platformFilter)); renderList(); });
document.querySelectorAll('.function-chip').forEach((b) => b.onclick = () => { functionFilter = functionFilter === b.dataset.function ? '' : b.dataset.function; document.querySelectorAll('.function-chip').forEach((x) => x.classList.toggle('active', x.dataset.function === functionFilter)); renderList(); });
document.querySelectorAll('.tab').forEach((b) => b.onclick = () => { document.querySelectorAll('.tab').forEach((x) => x.classList.toggle('active', x === b)); document.querySelectorAll('.panel').forEach((x) => x.classList.toggle('active', x.id === b.dataset.tab)); });
document.querySelectorAll('.sort-button').forEach((b) => b.onclick = () => { sortDir = sortKey === b.dataset.sort && sortDir === 'asc' ? 'desc' : 'asc'; sortKey = b.dataset.sort; renderModels(); });
$('platformSearch').oninput = renderList; $('languageSelect').onchange = (e) => { lang = e.target.value; localStorage.setItem('checkai.lang', lang); render(); };
$('platformFilterToggle').onclick = () => document.querySelector('.quick-filters').classList.toggle('expanded');
$('globalCompareButton').onclick = () => { $('compareModal').classList.add('open'); renderCompare(); };
$('closeCompareButton').onclick = () => $('compareModal').classList.remove('open');
$('clearSelectedModels').onclick = () => { selectedModels.clear(); renderCompare(); };
$('selectScopedModels').onclick = () => { platformModels(compareCompany).forEach((m) => selectedModels.add(keyOf(m))); renderCompare(); };
document.querySelector('.compare-backdrop').onclick = $('closeCompareButton').onclick;
$('closeModelDetailButton').onclick = () => $('modelDetailModal').classList.remove('open');
document.querySelector('.model-detail-backdrop').onclick = $('closeModelDetailButton').onclick;
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { $('compareModal').classList.remove('open'); $('modelDetailModal').classList.remove('open'); document.body.classList.remove('mobile-workspace-open'); } });
// Mobile back button: close workspace overlay + restore list scroll
$('mobileBackBtn').onclick = () => {
  document.body.classList.remove('mobile-workspace-open');
  window.scrollTo(0, window._mobileListScrollY || 0);
};
// Back-to-top floating button: show after 600px scroll, smooth scroll to top
const btt = $('backToTopBtn');
window.addEventListener('scroll', () => btt.classList.toggle('visible', window.scrollY > 600), { passive: true });
btt.onclick = () => window.scrollTo({ top: 0, behavior: 'smooth' });
const urlQ = new URLSearchParams(location.search).get('q');
if (urlQ) $('platformSearch').value = urlQ;
render(); loadLive(); loadModelSlugs();
