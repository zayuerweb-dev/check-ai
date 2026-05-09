const $ = (id) => document.getElementById(id);
const zh = {
  brandName: '查找.AI', brandSubtitle: '会员、API、模型与跑分', search: '搜索', compare: '比较',
  all: '全部', mainstream: '主流', modelLab: '自研', openSource: '开源', aggregator: '供应商', cloud: '云平台', hasMembership: '有会员',
  showMore: '展开', functionFilter: '功能', functionCode: '写代码', functionWeb: '联网', functionWriting: '写作', functionVision: '图像', functionLongContext: '长文档', functionLocal: '本地部署',
  eyebrow: 'AI 平台模型数据库', language: '语言', companyWebsite: '公司官网', subscription: '订阅', apiPricing: 'API 价格',
  overview: '总览', models: '模型', pricing: '官网套餐', bestFor: '使用案例', plainConclusion: '摘要', capabilities: '能力',
  model: '模型', inputPrice: '输入/$1M', outputPrice: '输出/$1M', context: '上下文', releaseDate: '发布日期', lmArena: 'LMArena', sixDimChart: '六维示意图',
  consumerPlans: '会员套餐', officialPricing: '官方价格', estimatedScores: '估算分数', compareModels: '模型比较', company: '公司', selectedModels: '已选模型', clear: '清空',
  noSelection: '未选择模型时显示当前范围内全部模型。', selectAllModels: '全选当前公司', curatedPlans: '实时模型数据 + 人工整理套餐', seedData: '种子数据', liveUnavailable: '实时数据暂不可用', updatedToday: '今天更新', average: '6轴平均'
};
const en = {
  brandName: 'Check.AI', brandSubtitle: 'Plans, APIs, models, scores', search: 'Search', compare: 'Compare',
  all: 'All', mainstream: 'Mainstream', modelLab: 'Owned', openSource: 'Open Source', aggregator: 'Providers', cloud: 'Cloud', hasMembership: 'Plans',
  showMore: 'Show more', functionFilter: 'Functions', functionCode: 'Coding', functionWeb: 'Web', functionWriting: 'Writing', functionVision: 'Vision', functionLongContext: 'Long docs', functionLocal: 'Local',
  eyebrow: 'AI platform model database', language: 'Language', companyWebsite: 'Company website', subscription: 'Subscription', apiPricing: 'API pricing',
  overview: 'Overview', models: 'Models', pricing: 'Official Plans', bestFor: 'Use cases', plainConclusion: 'Plain conclusion', capabilities: 'Capabilities',
  model: 'Model', inputPrice: 'Input/$1M', outputPrice: 'Output/$1M', context: 'Context', releaseDate: 'Release date', lmArena: 'LMArena', sixDimChart: 'Six-axis visual',
  consumerPlans: 'Consumer plans', officialPricing: 'Official pricing', estimatedScores: 'Estimated scores', compareModels: 'Model comparison', company: 'Company', selectedModels: 'Selected models', clear: 'Clear',
  noSelection: 'Without selected models, all models in the current scope are shown.', selectAllModels: 'Select current company', curatedPlans: 'Live model data + curated plans', seedData: 'Seed data', liveUnavailable: 'Live data unavailable', updatedToday: 'Updated today', average: 'Six-axis avg'
};
const ja = { ...en,
  brandSubtitle: 'プラン、API、モデル、スコア', search: '検索', compare: '比較', all: 'すべて', mainstream: '主流', modelLab: '自社開発', openSource: 'オープンソース', aggregator: 'プロバイダー', cloud: 'クラウド', hasMembership: '有料プラン',
  showMore: 'もっと見る', functionFilter: '機能', functionCode: 'コーディング', functionWeb: 'Web 接続', functionWriting: '文章作成', functionVision: '画像', functionLongContext: '長文書', functionLocal: 'ローカル',
  eyebrow: 'AI プラットフォームモデルデータベース', language: '言語', companyWebsite: '公式サイト', subscription: 'サブスク', apiPricing: 'API 価格', overview: '概要', models: 'モデル', pricing: '公式プラン',
  bestFor: '用途', plainConclusion: '要約', capabilities: '能力', model: 'モデル', inputPrice: '入力/$1M', outputPrice: '出力/$1M', context: 'コンテキスト', releaseDate: '公開日', sixDimChart: '6軸表示',
  consumerPlans: '会員プラン', officialPricing: '公式価格', estimatedScores: '推定スコア', compareModels: 'モデル比較', company: '会社', selectedModels: '選択済みモデル', clear: 'クリア',
  noSelection: 'モデル未選択時は現在の範囲の全モデルを表示します。', selectAllModels: '現在の会社を全選択', curatedPlans: 'ライブモデルデータ + 整理済みプラン', seedData: '初期データ', liveUnavailable: 'ライブデータ利用不可', updatedToday: '本日更新', average: '6軸平均'
};
const ko = { ...en,
  brandSubtitle: '요금제, API, 모델, 점수', search: '검색', compare: '비교', all: '전체', mainstream: '주류', modelLab: '자체 개발', openSource: '오픈소스', aggregator: '공급자', cloud: '클라우드', hasMembership: '멤버십',
  showMore: '더 보기', functionFilter: '기능', functionCode: '코딩', functionWeb: '웹 연결', functionWriting: '글쓰기', functionVision: '이미지', functionLongContext: '긴 문서', functionLocal: '로컬 배포',
  eyebrow: 'AI 플랫폼 모델 데이터베이스', language: '언어', companyWebsite: '공식 사이트', subscription: '구독', apiPricing: 'API 가격', overview: '개요', models: '모델', pricing: '공식 요금제',
  bestFor: '사용 사례', plainConclusion: '요약', capabilities: '기능', model: '모델', inputPrice: '입력/$1M', outputPrice: '출력/$1M', context: '컨텍스트', releaseDate: '출시일', sixDimChart: '6축 시각화',
  consumerPlans: '멤버십 요금제', officialPricing: '공식 가격', estimatedScores: '추정 점수', compareModels: '모델 비교', company: '회사', selectedModels: '선택한 모델', clear: '지우기',
  noSelection: '선택한 모델이 없으면 현재 범위의 모든 모델을 표시합니다.', selectAllModels: '현재 회사 전체 선택', curatedPlans: '실시간 모델 데이터 + 정리된 요금제', seedData: '초기 데이터', liveUnavailable: '실시간 데이터 사용 불가', updatedToday: '오늘 업데이트', average: '6축 평균'
};
const es = { ...en,
  brandSubtitle: 'Planes, API, modelos y puntajes', search: 'Buscar', compare: 'Comparar', all: 'Todo', mainstream: 'Principales', modelLab: 'Propios', openSource: 'Código abierto', aggregator: 'Proveedores', cloud: 'Nube', hasMembership: 'Planes',
  showMore: 'Ver más', functionFilter: 'Funciones', functionCode: 'Código', functionWeb: 'Web', functionWriting: 'Escritura', functionVision: 'Imagen', functionLongContext: 'Documentos largos', functionLocal: 'Local',
  eyebrow: 'Base de datos de modelos de IA', language: 'Idioma', companyWebsite: 'Sitio oficial', subscription: 'Suscripción', apiPricing: 'Precio API', overview: 'Resumen', models: 'Modelos', pricing: 'Planes oficiales',
  bestFor: 'Casos de uso', plainConclusion: 'Resumen', capabilities: 'Capacidades', model: 'Modelo', inputPrice: 'Entrada/$1M', outputPrice: 'Salida/$1M', context: 'Contexto', releaseDate: 'Lanzamiento', sixDimChart: 'Vista de 6 ejes',
  consumerPlans: 'Planes de consumo', officialPricing: 'Precio oficial', estimatedScores: 'Puntajes estimados', compareModels: 'Comparación de modelos', company: 'Empresa', selectedModels: 'Modelos elegidos', clear: 'Limpiar',
  noSelection: 'Sin modelos elegidos, se muestran todos los modelos del alcance actual.', selectAllModels: 'Elegir empresa actual', curatedPlans: 'Datos en vivo + planes curados', seedData: 'Datos iniciales', liveUnavailable: 'Datos en vivo no disponibles', updatedToday: 'Actualizado hoy', average: 'Promedio 6 ejes'
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
let lang = 'zh', activePlatform = 'openai', platformFilter = '', functionFilter = '', modelCap = '', sortKey = 'releaseDate', sortDir = 'desc', compareCompany = 'openai';
let selectedModels = new Set(), compareCaps = new Set(), dataState = { kind: 'seed', count: 0 };
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
function score(m) {
  const cost = m.input + m.output, speed = Math.max(45, Math.min(96, Math.round(95 - cost * .75))), eff = Math.max(35, Math.min(98, Math.round(100 - cost)));
  const coding = m.capabilities.includes('code') ? Math.min(100, m.quality + 4) : m.quality - 8;
  const reasoning = m.capabilities.includes('reasoning') ? Math.min(100, m.quality + 3) : m.quality - 6;
  const multimodal = m.capabilities.includes('vision') ? Math.min(100, m.quality + 1) : Math.max(45, m.quality - 18);
  return { lmArena: m.quality, aa: m.quality, coding, reasoning, multimodal, speed, efficiency: eff, average: Math.round((m.quality + coding + reasoning + multimodal + speed + eff) / 6) };
}
function radar(s, big = false) {
  const vals = [s.aa,s.coding,s.reasoning,s.multimodal,s.speed,s.efficiency], labels = [tx('aaIndex'),tx('coding'),tx('reasoning'),tx('multimodal'),tx('speed'),tx('costEfficiency')];
  const r = big ? 28 : 36, pt = (i,v) => [50 + Math.cos(-Math.PI / 2 + i * Math.PI / 3) * r * v / 100, 50 + Math.sin(-Math.PI / 2 + i * Math.PI / 3) * r * v / 100];
  const poly = vals.map((v,i) => pt(i,v).join(',')).join(' '), grid = [100,66].map((v) => vals.map((_,i) => pt(i,v).join(',')).join(' '));
  const label = big ? labels.map((l,i) => { const [x,y] = pt(i,128); return `<text x='${x}' y='${y}' text-anchor='middle'>${l} ${vals[i]}</text>`; }).join('') : '';
  return `<button class='six-axis-button' type='button'><svg class='${big ? 'large-radar' : ''}' viewBox='0 0 100 100'><polygon class='radar-grid' points='${grid[0]}'/><polygon class='radar-grid' points='${grid[1]}'/><polygon class='radar-fill' points='${poly}'/><polygon class='radar-line' points='${poly}'/>${label}</svg></button>`;
}
function platformModels(id = activePlatform) { return models.filter((m) => m.platform === id).sort((a,b) => Date.parse(b.releaseDate || 0) - Date.parse(a.releaseDate || 0) || b.quality - a.quality); }
function addProvider(id, raw, rawModels) {
  if (platforms.some((p) => p.id === id)) return;
  const text = `${id} ${raw?.name || ''}`.toLowerCase(), open = rawModels.some((m) => m.open_weights || m.weights === 'Open');
  const lab = /(cohere|meta|llama|microsoft|nvidia|stability|moonshot|baidu|zhipu|reka|writer|perplexity|groq)/.test(text), cloud = /(aws|azure|vertex|cloudflare|oracle|bedrock)/.test(text);
  platforms.push({ id, name: raw?.name || id, logo: `https://models.dev/logos/${id}.svg`, website: raw?.website || raw?.url || '', planUrl: raw?.pricing || '', types: [lab && 'modelLab', open && 'open', cloud && 'cloud', (!lab || /openrouter|together|replicate|fireworks|vercel|github|nano|gateway/.test(text)) && 'aggregator'].filter(Boolean), category: ['api', open && 'open'].filter(Boolean), functions: ['code','writing'], description: `${raw?.name || id} 的公开模型/API 数据。`, descriptionEn: `${raw?.name || id} public model/API data.`, strengths: ['模型数据','API'], strengthsEn: ['Model data','API'] });
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
async function loadLive() {
  try {
    const json = await (await fetch('https://models.dev/api.json', { cache: 'no-store' })).json(), live = [];
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
    dataState = { kind: 'live', count: live.length };
    render();
  } catch { dataState = { kind: 'unavailable', count: 0 }; updateText(); }
}
function filteredPlatforms() {
  const q = $('platformSearch').value.toLowerCase();
  return platforms.filter((p) => (!platformFilter || p.types.includes(platformFilter) || platformFilter === 'consumer' && p.category.includes('consumer')) && (!functionFilter || p.functions.includes(functionFilter))).filter((p) => !q || [p.name,p.description,p.descriptionEn,platformDesc(p),p.strengths.join(' '),p.strengthsEn.join(' '),platformStrengths(p).join(' '),...platformModels(p.id).map((m) => `${m.name} ${m.id} ${m.capabilities.map(capText).join(' ')} ${m.capabilities.join(' ')}`)].join(' ').toLowerCase().includes(q)).sort((a,b) => (b.types.includes('mainstream') - a.types.includes('mainstream')) || platformModels(b.id).length - platformModels(a.id).length);
}
function renderList() {
  $('platformList').innerHTML = filteredPlatforms().map((p) => { const ms = platformModels(p.id), best = ms[0]; return `<button class='platform-card ${p.id === activePlatform ? 'active' : ''}' data-id='${p.id}'><div class='platform-card-top'><img src='${p.logo}' alt=''><div><strong>${p.name}</strong><span>${platformDesc(p)}</span></div></div><div class='feature-icons'><span class='feature-icon ${p.category.includes('consumer') ? 'on' : ''}'>$</span><span class='feature-icon ${p.types.includes('open') ? 'on' : ''}'>OS</span></div><div class='mini-stats'><span>${tx('lowestApi')} <b>${money(Math.min(...ms.map((m) => m.input), 0))}</b></span><span>${tx('bestModel')} <b>${best?.name || '-'}</b></span></div></button>`; }).join('');
  document.querySelectorAll('.platform-card').forEach((b) => b.onclick = () => { activePlatform = b.dataset.id; render(); });
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
function row(m, company = false) { const s = score(m); return `<tr class='model-row' data-key='${keyOf(m)}'><td><div class='model-name'>${m.name}</div><div class='model-id'>${m.id}</div></td>${company ? `<td>${pName(m.platform)}</td>` : ''}<td>${money(m.input)}</td><td>${money(m.output)}</td><td>${compact(m.context)}</td><td>${m.releaseDate || tx('unknown')}</td><td><div class='capability-list'>${m.capabilities.map(cap).join('')}</div></td><td><b>${s.lmArena}</b></td><td>${radar(s)}</td></tr>`; }
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
  $('compareRows').innerHTML = (picked.length ? picked : scoped).map((m) => row(m, true)).join('');
  document.querySelectorAll('#companyFilters button').forEach((b) => b.onclick = () => { compareCompany = b.dataset.id; renderCompare(); });
  document.querySelectorAll('#compareCapabilityFilters button').forEach((b) => b.onclick = () => { const c = b.dataset.cap; c ? (compareCaps.has(c) ? compareCaps.delete(c) : compareCaps.add(c)) : compareCaps.clear(); renderCompare(); });
  document.querySelectorAll('#modelFilters button').forEach((b) => b.onclick = () => { selectedModels.has(b.dataset.key) ? selectedModels.delete(b.dataset.key) : selectedModels.add(b.dataset.key); renderCompare(); });
  document.querySelectorAll('.selected-model-pill').forEach((b) => b.onclick = () => { selectedModels.delete(b.dataset.key); renderCompare(); });
  bindRows($('compareModal'));
}
function bindRows(root) { root.querySelectorAll('.model-row').forEach((tr) => tr.onclick = () => openModel(tr.dataset.key)); }
function openModel(k) {
  const m = models.find((x) => keyOf(x) === k); if (!m) return;
  const s = score(m); $('modelDetailProvider').textContent = pName(m.platform); $('modelDetailTitle').textContent = m.name;
  $('modelDetailContent').innerHTML = `<div class='model-detail-grid'><div><span>${tx('inputPrice')}</span><strong>${money(m.input)}</strong></div><div><span>${tx('outputPrice')}</span><strong>${money(m.output)}</strong></div><div><span>${tx('context')}</span><strong>${compact(m.context)}</strong></div><div><span>${tx('releaseDate')}</span><strong>${m.releaseDate || '-'}</strong></div><div><span>${tx('lmArena')}</span><strong>${s.lmArena}</strong></div><div><span>${tx('average')}</span><strong>${s.average}</strong></div></div><div class='model-detail-section'><h3>${tx('sixDimChart')}</h3>${radar(s, true)}</div><div class='ad-slot ad-slot-detail'></div>`;
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
$('platformSearch').oninput = renderList; $('languageSelect').onchange = (e) => { lang = e.target.value; render(); };
$('platformFilterToggle').onclick = () => document.querySelector('.quick-filters').classList.toggle('expanded');
$('globalCompareButton').onclick = () => { $('compareModal').classList.add('open'); renderCompare(); };
$('closeCompareButton').onclick = () => $('compareModal').classList.remove('open');
$('clearSelectedModels').onclick = () => { selectedModels.clear(); renderCompare(); };
$('selectScopedModels').onclick = () => { platformModels(compareCompany).forEach((m) => selectedModels.add(keyOf(m))); renderCompare(); };
document.querySelector('.compare-backdrop').onclick = $('closeCompareButton').onclick;
$('closeModelDetailButton').onclick = () => $('modelDetailModal').classList.remove('open');
document.querySelector('.model-detail-backdrop').onclick = $('closeModelDetailButton').onclick;
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { $('compareModal').classList.remove('open'); $('modelDetailModal').classList.remove('open'); } });
render(); loadLive();
