import {test,expect,type Page} from '@playwright/test';
async function readyForCapture(page:Page){
 await page.waitForLoadState('networkidle');
 await page.evaluate(async()=>{
  await Promise.all(Array.from(document.images).map(image=>image.decode()));
  const text=document.body.innerText;
  await Promise.all([document.fonts.load('400 16px "Noto Sans SC"',text),document.fonts.load('700 24px "Noto Sans SC"',text)]);
  await document.fonts.ready;
 });
 await page.waitForFunction(()=>document.getAnimations().every(animation=>animation.playState!=='running'));
 await page.evaluate(()=>new Promise<void>(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>resolve()))));
 expect(await page.locator('img').evaluateAll(images=>images.every(image=>(image as HTMLImageElement).complete&&(image as HTMLImageElement).naturalWidth>0))).toBe(true);
}
test('手机浏览器：5款展示、首次/重复、刷新、分享卡匹配、清除',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/#/atlas');await expect(page.locator('.figure')).toHaveCount(5);
 await expect(page.getByText('本设备已体验 0 / 5 款')).toBeVisible();
 // 固定随机数仅用于验收：0.70 对应抱糖巧巧，不改变生产代码。
 await page.evaluate(()=>{Math.random=()=>.70;});
 await page.goto('/#/');await page.getByRole('button',{name:'点击拆盒'}).click();
 await expect(page.getByText('这次遇见的是：抱糖巧巧')).toBeVisible();
 await expect(page.getByText('首次遇见',{exact:true})).toBeVisible();
 await page.getByRole('link',{name:'再体验一次'}).click();await page.getByRole('button',{name:'点击拆盒'}).click();
 await expect(page.getByText('又遇见你啦',{exact:true})).toBeVisible();
 await page.reload();await expect(page.getByText('这次遇见的是：抱糖巧巧')).toBeVisible();
 await page.evaluate(()=>{
  const w=window as unknown as {cardTexts:string[];cardImages:string[]};w.cardTexts=[];w.cardImages=[];
  const fill=CanvasRenderingContext2D.prototype.fillText;
  CanvasRenderingContext2D.prototype.fillText=function(text,x,y,max){w.cardTexts.push(text);if(max===undefined)fill.call(this,text,x,y);else fill.call(this,text,x,y,max);};
  const original=CanvasRenderingContext2D.prototype.drawImage;
  CanvasRenderingContext2D.prototype.drawImage=function(...args:unknown[]){const image=args[0];if(image instanceof HTMLImageElement)w.cardImages.push(image.src);return Reflect.apply(original,this,args);};
 });
 const download=page.waitForEvent('download');await page.getByRole('button',{name:'保存这份甜 · 分享卡'}).click();
 const shared=await download;expect(shared.suggestedFilename()).toBe('wanqiaoqiao-figure-hug.png');await shared.saveAs('test-results/share-card-example.png');await shared.saveAs('test-results/share-hug.png');
 await expect(page.locator('.share-preview')).toBeVisible();await readyForCapture(page);await page.screenshot({path:'test-results/mobile-result.png',fullPage:true});
 const capture=await page.evaluate(()=>({texts:(window as any).cardTexts,images:(window as any).cardImages}));
 expect(capture.texts).toContain('万华巧家小碗红糖');expect(capture.texts).toContain('线上盲盒模拟体验');expect(capture.texts).toContain('原味小粒红糖');expect(capture.texts).toContain('给忙碌的你，留一杯甜。');expect(capture.texts).toContain('这次遇见的是：抱糖巧巧');expect(capture.images.some((s:string)=>s.endsWith('/assets/figures.png'))).toBe(true);expect(capture.texts).toContain('正式网站地址待配置 · 暂不生成二维码');
 await page.getByRole('link',{name:'萌粒图鉴',exact:true}).click();await expect(page.getByText('本设备已体验 1 / 5 款')).toBeVisible();await expect(page.getByText('已体验',{exact:true})).toHaveCount(1);
 await page.reload();await expect(page.getByText('本设备已体验 1 / 5 款')).toBeVisible();
 await readyForCapture(page);await page.screenshot({path:'test-results/mobile-collection.png',fullPage:true});
 page.once('dialog',dialog=>dialog.accept());await page.getByRole('button',{name:'清除记录'}).click();await expect(page.getByText('本设备已体验 0 / 5 款')).toBeVisible();await page.reload();await expect(page.getByText('本设备已体验 0 / 5 款')).toBeVisible();
 await page.goto('/#/result');await expect(page.getByText('还没有拆盒记录')).toBeVisible();expect(errors).toEqual([]);
});
test('哈希直达、移动布局与无权限点击体验',async({page})=>{
 await page.goto('/#/contents');await expect(page.getByRole('heading',{name:'组合概率',exact:true})).toBeVisible();await expect(page.locator('tbody tr')).toHaveCount(24);await page.reload();await expect(page.locator('tbody tr')).toHaveCount(24);await readyForCapture(page);await page.screenshot({path:'test-results/mobile-contents.png',fullPage:true});
 for(const route of ['/#/','/#/atlas','/#/contents']){await page.goto(route);await readyForCapture(page);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);}
 await page.goto('/#/');await readyForCapture(page);await page.screenshot({path:'test-results/mobile-home.png',fullPage:true});await page.getByRole('button',{name:'点击拆盒'}).click();await expect(page.locator('.result')).toBeVisible();
});
test('点击盒子先摇动再打开，连点仅生成一次，不申请传感器权限',async({page})=>{
 await page.addInitScript(()=>{(window as any).permissionCalls=0;Object.defineProperty(window,'DeviceMotionEvent',{value:class{static async requestPermission(){(window as any).permissionCalls++;return 'denied';}},configurable:true});});
 await page.goto('/#/');const box=page.getByRole('button',{name:'点击盲盒',exact:true});await box.click();
 await expect(page.locator('.box-stage')).toHaveClass(/shaking/);await expect(page.locator('.box-trigger')).toBeDisabled();await expect(page.getByRole('button',{name:'正在拆开这份甜…'})).toBeDisabled();
 await expect(page.locator('.box-stage')).toHaveClass(/revealing/);await expect(page.locator('.box-art img')).toHaveAttribute('data-cell','5');
 await expect(page.locator('.result')).toBeVisible();expect(await page.evaluate(()=>(window as any).permissionCalls)).toBe(0);
});
test('五款概念图正确映射到分享卡图块，资源来自本站',async({page})=>{
 await page.goto('/#/atlas');for(let i=0;i<5;i++){const image=page.locator('.figure .artwork img').nth(i);await expect(image).toHaveAttribute('data-cell',String(i));expect(await image.evaluate((img:HTMLImageElement)=>img.complete&&img.naturalWidth>0)).toBe(true);}
 for(let i=0;i<5;i++){
  await page.evaluate(({i})=>{localStorage.setItem('wanqiaoqiao-experience-v1',JSON.stringify({seen:[],latest:{combinationId:['box-figure-wave','box-figure-hug','box-figure-stir','box-figure-cup','box-figure-sit'][i],mood:'慢慢搅，慢慢甜。',at:new Date().toISOString(),first:true}}));},{i});
  await page.goto('/#/result');await page.reload();
  await page.evaluate(()=>{(window as any).crops=[];const original=CanvasRenderingContext2D.prototype.drawImage;CanvasRenderingContext2D.prototype.drawImage=function(...args:unknown[]){if(args[0] instanceof HTMLImageElement&&(args[0] as HTMLImageElement).src.endsWith('/assets/figures.png'))(window as any).crops.push(args.slice(1,5));return Reflect.apply(original,this,args);};});
  const download=page.waitForEvent('download');await page.getByRole('button',{name:'保存这份甜 · 分享卡'}).click();await download;
  expect(await page.evaluate(()=>(window as any).crops[0])).toEqual([i%3*512,Math.floor(i/3)*512,512,512]);
 }
});
test('正式构建素材可解码，所有图块非空，图片和中文字体均为本站资源',async({page})=>{
 const failures:string[]=[];const external:string[]=[];
 page.on('response',response=>{if(response.status()>=400)failures.push(`${response.status()} ${response.url()}`);});
 page.on('requestfailed',request=>failures.push(request.url()));
 page.on('request',request=>{const url=request.url();if(/^https?:/.test(url)&&new URL(url).origin!=='http://127.0.0.1:4173')external.push(url);});
 for(const route of ['/#/','/#/contents','/#/atlas']){await page.goto(route);await readyForCapture(page);}
 const assets=await page.evaluate(async()=>{
  const paths=['/assets/figures.png','/assets/gift-kit.png','/assets/sugar-original.jpg','/assets/sugar-family.jpg'];
  const out=[];
  for(const path of paths){
   const response=await fetch(path);if(!response.ok)throw new Error(`素材请求失败 ${path}`);
   const blob=await response.blob();const bitmap=await createImageBitmap(blob);
   const canvas=document.createElement('canvas');const ctx=canvas.getContext('2d')!;
   const sprite=path.endsWith('.png');const cells=sprite?6:1;
   for(let cell=0;cell<cells;cell++){
    canvas.width=64;canvas.height=64;
    const w=bitmap.width/(sprite?3:1),h=bitmap.height/(sprite?2:1);
    ctx.drawImage(bitmap,(sprite?cell%3:0)*w,(sprite?Math.floor(cell/3):0)*h,w,h,0,0,64,64);
    const pixels=ctx.getImageData(0,0,64,64).data;const colors=new Set<number>();let opaque=0;
    for(let i=0;i<pixels.length;i+=4){colors.add((pixels[i]<<16)|(pixels[i+1]<<8)|pixels[i+2]);if(pixels[i+3]>0)opaque++;}
    if(opaque<3000||colors.size<300)throw new Error(`空白或透明图块 ${path} ${cell}`);
   }
   out.push({path,bytes:blob.size,width:bitmap.width,height:bitmap.height});bitmap.close();
  }
  return out;
 });
 expect(assets).toHaveLength(4);expect(assets.every(asset=>asset.bytes>0&&asset.width>0&&asset.height>0)).toBe(true);expect(failures).toEqual([]);expect(external).toEqual([]);
});
test('完整体验交付：从首页拆盒、查看图鉴，再生成并打开下载分享卡',async({page})=>{
 await page.addInitScript(()=>{Math.random=()=>.70;});
 await page.goto('/#/');await readyForCapture(page);await page.screenshot({path:'test-results/mobile-home.png',fullPage:true});
 await page.getByRole('button',{name:'点击盲盒',exact:true}).click();await expect(page.locator('.box-stage')).toHaveClass(/shaking/);
 await expect(page.getByText('这次遇见的是：抱糖巧巧')).toBeVisible();await readyForCapture(page);
 await expect(page.locator('.result-products')).toContainText('原味小粒红糖');await expect(page.locator('.result-products')).toContainText('抱糖巧巧');
 await page.screenshot({path:'test-results/mobile-result.png',fullPage:true});
 await page.getByRole('link',{name:'萌粒图鉴',exact:true}).click();await readyForCapture(page);await expect(page.locator('.figure')).toHaveCount(5);
 await page.screenshot({path:'test-results/mobile-collection.png',fullPage:true});
 await page.goto('/#/result');await readyForCapture(page);
 const download=page.waitForEvent('download');await page.getByRole('button',{name:'保存这份甜 · 分享卡'}).click();const file=await download;
 expect(file.suggestedFilename()).toBe('wanqiaoqiao-figure-hug.png');await file.saveAs('test-results/share-card-example.png');await file.saveAs('test-results/share-hug.png');
 await expect(page.locator('.share-preview')).toBeVisible();await readyForCapture(page);
 const dimensions=await page.locator('.share-preview').evaluate((image:HTMLImageElement)=>({width:image.naturalWidth,height:image.naturalHeight}));expect(dimensions).toEqual({width:1080,height:1750});
});
