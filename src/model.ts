export type Artwork = { image: string; cell?: number };
export const packaging: Artwork = { image: '/assets/gift-kit.png', cell: 3 };
export const openedPackaging: Artwork = { image: '/assets/gift-kit.png', cell: 5 };
export const moodArtwork: Artwork = { image: '/assets/gift-kit.png', cell: 4 };
export const heroArtwork: Artwork = { image: '/assets/figures.png', cell: 5 };
export type Gift = Artwork & { id: string; name: string; image: string; copy: string; category: 'figure' | 'accessory'; action: string };
export const figures: Gift[] = [
 ['wave','招手巧巧','微笑、举手招呼。','今天，和甜打个招呼。'],
 ['hug','抱糖巧巧','抱着一颗迷你小碗红糖。','把一点甜抱在怀里。'],
 ['stir','搅糖巧巧','拿着小搅拌棒。','慢慢搅，慢慢甜。'],
 ['cup','捧杯巧巧','双手捧着一杯红糖饮品。','给忙碌的你，留一杯甜。'],
 ['sit','坐坐巧巧','坐着，小脚向前伸。','歇一会儿，也很好。'],
].map(([id,name,action,copy],cell) => ({id:`figure-${id}`,name,action,copy,category:'figure',image:'/assets/figures.png',cell}));
export const gifts: Gift[] = [
 {id:'stirrer',name:'万巧巧搅拌棒',image:'/assets/gift-kit.png',cell:0,copy:'搅开今天的一点甜。',action:'根据万巧巧IP生成的赠品设计概念。',category:'accessory'},
 {id:'coaster',name:'万巧巧杯垫',image:'/assets/gift-kit.png',cell:1,copy:'给温暖留一个位置。',action:'根据万巧巧IP生成的赠品设计概念。',category:'accessory'},
 {id:'sticker',name:'万巧巧杯身贴纸',image:'/assets/gift-kit.png',cell:2,copy:'把甜贴在日常里。',action:'根据万巧巧IP生成的赠品设计概念。',category:'accessory'},
 ...figures,
];
export const sugars = [
 {id:'bowl-sugar',name:'原味小粒红糖',image:'/assets/sugar-original.jpg',series:'家庭装橙色系列',brand:'金沙、唐韵',flavor:'原味',sourcePage:13,weight:5,description:'独立装小粒红糖；资料原销售规格为250克/袋。'},
 {id:'ginger-sugar',name:'老姜小粒红糖',image:'/assets/sugar-family.jpg',series:'家庭经济实惠装',brand:'金沙、唐韵',flavor:'老姜（配料包）',sourcePage:9,weight:3,description:'独立装小粒红糖；老姜为资料列出的配料包口味，原销售规格为500克/袋。'},
 {id:'rose-sugar',name:'玫瑰小粒红糖',image:'/assets/sugar-family.jpg',series:'家庭经济实惠装',brand:'金沙、唐韵',flavor:'玫瑰（配料包）',sourcePage:9,weight:2,description:'独立装小粒红糖；玫瑰为资料列出的配料包口味，原销售规格为500克/袋。'},
];
// 每个组合只有一份独立包装红糖和一件赠品。固定权重不读取体验记录。
// 保留原味组合旧ID，已有浏览器记录仍可解析。红糖权重5:3:2。
export const combinations = gifts.flatMap((gift,i) => sugars.map((sugar,j) => ({
 id:j===0?`box-${gift.id}`:`box-${gift.id}-${sugar.id}`,
 sugarId:sugar.id,giftId:gift.id,weight:[24,20,16,8,8,8,8,8][i]*sugar.weight,
})));
export const productImageNotice='产品照片为资料中的系列展示图，图中整袋、饮品及其他物品不属于本次单份盲盒内容；单份克重与实物组合待确认。';
export const moods = ['今天，和甜打个招呼。','把一点甜抱在怀里。','慢慢搅，慢慢甜。','给忙碌的你，留一杯甜。','歇一会儿，也很好。'];
export const totalWeight = combinations.reduce((sum,c)=>sum+c.weight,0);
export const giftProbability = (id:string) => combinations.filter(c=>c.giftId===id).reduce((sum,c)=>sum+c.weight,0)/totalWeight;
export function draw(random = Math.random) {
 const value=random();
 if (!Number.isFinite(value) || value<0 || value>=1) throw new Error('随机值必须在 [0,1) 内');
 let ticket=value*totalWeight;
 for(const combination of combinations){ticket-=combination.weight; if(ticket<0)return combination;}
 return combinations[combinations.length-1];
}
export type Result = { combinationId:string; mood:string; at:string; first:boolean };
export type RecordState = { seen:string[]; latest:Result|null };
export const STORAGE_KEY='wanqiaoqiao-experience-v1';
export const emptyRecord = ():RecordState=>({seen:[],latest:null});
export function parseRecord(raw:string|null):RecordState {
 try {
  const data=JSON.parse(raw||'null');
  if(!data || !Array.isArray(data.seen))return emptyRecord();
  const seen=[...new Set<string>(data.seen.filter((id:unknown)=>typeof id==='string' && figures.some(f=>f.id===id)))];
  const r=data.latest;
  const latest = r && combinations.some(c=>c.id===r.combinationId) && moods.includes(r.mood) && typeof r.at==='string' && Number.isFinite(Date.parse(r.at)) && typeof r.first==='boolean' ? r as Result : null;
  return {seen,latest};
 }catch{return emptyRecord();}
}
export function encounter(state:RecordState, combinationId:string, mood:string, at=new Date().toISOString()):RecordState {
 const c=combinations.find(c=>c.id===combinationId);
 if(!c)throw new Error('未知组合');
 const figure=figures.some(f=>f.id===c.giftId);
 const first=figure && !state.seen.includes(c.giftId);
 return {seen:first?[...state.seen,c.giftId]:state.seen,latest:{combinationId,mood,at,first}};
}
export function resolveResult(result:Result) {
 const combination=combinations.find(c=>c.id===result.combinationId)!;
 return {gift:gifts.find(g=>g.id===combination.giftId)!,sugar:sugars.find(s=>s.id===combination.sugarId)!};
}
export const recordNotice='这是本设备的线上体验记录，不代表拥有、购买或可领取实物。';
export function officialUrl(value:string|undefined):string|null {
 try{const u=new URL(value||'');if(u.protocol!=='https:'||u.username||u.password||u.port||u.hostname==='localhost'||u.hostname.endsWith('.localhost')||u.hostname.endsWith('.example')||u.hostname==='example.com'||/^\d+\.\d+\.\d+\.\d+$/.test(u.hostname)||u.hostname.includes(':'))return null;return u.origin+u.pathname.replace(/\/$/,'');}catch{return null;}
}
