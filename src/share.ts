import QRCode from 'qrcode';
import {resolveResult,type Result,officialUrl,recordNotice,type Artwork,moodArtwork,productImageNotice} from './model';
const loadImage=(url:string)=>new Promise<HTMLImageElement>((resolve,reject)=>{const i=new Image();i.onload=()=>resolve(i);i.onerror=()=>reject(new Error('本地图片加载失败'));i.src=url;});
export function paintArtwork(ctx:CanvasRenderingContext2D,image:HTMLImageElement,asset:Artwork,x:number,y:number,size:number){
 if(asset.cell!==undefined){const w=image.naturalWidth/3,h=image.naturalHeight/2;ctx.drawImage(image,asset.cell%3*w,Math.floor(asset.cell/3)*h,w,h,x,y,size,size);}
 else{const scale=Math.min(size/image.naturalWidth,size/image.naturalHeight);const w=image.naturalWidth*scale,h=image.naturalHeight*scale;ctx.drawImage(image,x+(size-w)/2,y+(size-h)/2,w,h);}
}
export async function shareCard(result:Result,siteUrl?:string):Promise<Blob> {
 const {gift,sugar}=resolveResult(result);
 await document.fonts.load('34px "Noto Sans SC"','万巧巧万华巧家小碗红糖线上盲盒模拟体验'+gift.name+sugar.name+gift.copy+result.mood+sugar.series+recordNotice+productImageNotice);
 await document.fonts.load('700 34px "Noto Sans SC"','万巧巧万华巧家小碗红糖线上盲盒模拟体验'+gift.name+sugar.name);
 await document.fonts.ready;
 const canvas=document.createElement('canvas');canvas.width=1080;canvas.height=1750;
 const ctx=canvas.getContext('2d');if(!ctx)throw new Error('当前浏览器不支持生成分享卡');
 ctx.fillStyle='#fbf7ee';ctx.fillRect(0,0,1080,1750);ctx.textAlign='center';ctx.fillStyle='#543723';
 ctx.font='bold 54px "Noto Sans SC", sans-serif';ctx.fillText('万巧巧 · 摇出一碗甜',540,110);
 ctx.font='28px "Noto Sans SC", sans-serif';ctx.fillText('万华巧家小碗红糖',540,160);
 ctx.font='24px "Noto Sans SC", sans-serif';ctx.fillText('线上盲盒模拟体验',540,198);
 const [sugarImage,giftImage,moodImage]=await Promise.all([loadImage(sugar.image),loadImage(gift.image),loadImage(moodArtwork.image)]);
 paintArtwork(ctx,sugarImage,sugar,65,215,440);paintArtwork(ctx,giftImage,gift,575,215,440);
 ctx.font='bold 34px "Noto Sans SC", sans-serif';ctx.fillText(sugar.name,285,710);ctx.fillText(gift.name,795,710);
 ctx.font='22px "Noto Sans SC", sans-serif';ctx.fillText('1份独立包装 · 系列展示图',285,755);ctx.fillText('1件赠品 · 设计概念',795,755);
 ctx.font='36px "Noto Sans SC", sans-serif';ctx.fillText(`这次遇见的是：${gift.name}`,540,835);
 ctx.font='30px "Noto Sans SC", sans-serif';ctx.fillText(gift.copy,540,895);
 ctx.fillStyle='#f2e5cf';ctx.fillRect(60,940,960,230);paintArtwork(ctx,moodImage,moodArtwork,770,960,200);
 // 在卡片概念图上覆盖装饰字，清晰标示本次实际抽中的心情文案。
 ctx.fillStyle='#fcf1dc';ctx.fillRect(782,1002,147,29);ctx.fillStyle='#a75234';ctx.font='10px "Noto Sans SC", sans-serif';ctx.fillText(result.mood,855,1020);
 ctx.fillStyle='#a75234';ctx.font='bold 26px "Noto Sans SC", sans-serif';ctx.fillText('你的心情卡',420,1010);
 ctx.fillStyle='#543723';ctx.font='30px "Noto Sans SC", sans-serif';ctx.fillText(result.mood,420,1085);
 ctx.font='23px "Noto Sans SC", sans-serif';ctx.fillText('公仔设计概念，实物以最终打样为准',540,1220);
 ctx.fillText('赠品、包装、卡片为设计概念；产品图来自用户资料',540,1260);
 const url=officialUrl(siteUrl);
 if(url){const qr=await loadImage(await QRCode.toDataURL(url+'/#/atlas',{width:180,margin:2}));ctx.drawImage(qr,450,1290,180,180);ctx.font='22px "Noto Sans SC", sans-serif';ctx.fillText('扫描打开萌粒图鉴',540,1505);}
 else{ctx.font='26px "Noto Sans SC", sans-serif';ctx.fillText('正式网站地址待配置 · 暂不生成二维码',540,1400);}
 ctx.font='20px "Noto Sans SC", sans-serif';ctx.fillText('产品照片为系列展示图，整袋及图中其他物品不属于单份盲盒内容',540,1560);
 ctx.fillText('单份克重与实物组合待确认',540,1600);ctx.fillText(recordNotice,540,1640);ctx.fillText('线上模拟概率不代表未来实物装盒概率',540,1680);
 return new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error('分享卡生成失败')),'image/png'));
}
