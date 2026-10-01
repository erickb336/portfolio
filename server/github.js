// Public profile calendar only; no GitHub credentials or repository details.
export async function githubContributions(request, ctx) {
  let cache;
  const key = new Request(new URL('/api/github/contributions', request.url));
  try {
    cache = await globalThis.caches?.open("portfolio-github-contributions-v1");
    const cached = cache && await cache.match(key);
    if (cached) return cached;
  } catch { /* Cache availability must not prevent fetching the calendar. */ }
  try {
    const response = await fetch('https://github.com/users/erickb336/contributions', {headers:{'User-Agent':'ErickPortfolio','Accept':'text/html'}, signal:AbortSignal.timeout(8000)});
    if (!response.ok) throw new Error('Unavailable');
    const html = await response.text();
    const tips = new Map([...html.matchAll(/<tool-tip[^>]*for="([^"]+)"[^>]*>(.*?)<\/tool-tip>/gs)].map(m=>[m[1],m[2].replace(/<[^>]+>/g,'').trim()]));
    const days = [...html.matchAll(/<td[^>]*data-date[^>]*>/g)].map(([tag])=>{
      const attrs=Object.fromEntries([...tag.matchAll(/([\w-]+)="([^"]*)"/g)].map(m=>[m[1],m[2]]));
      const tip=tips.get(attrs.id);
      if(!tip) throw new Error('Incomplete calendar');
      const count=tip.match(/^([\d,]+) contribution/);
      return {date:attrs['data-date'],level:Number(attrs['data-level']),count:count?Number(count[1].replaceAll(',','')):0};
    }).sort((a,b)=>a.date.localeCompare(b.date));
    if(days.length<350 || days.length>380 || days.some(d=>!/^\d{4}-\d{2}-\d{2}$/.test(d.date)||!Number.isInteger(d.count)||d.level<0||d.level>4)) throw new Error('Invalid calendar');
    const result=Response.json({days,total:days.reduce((n,d)=>n+d.count,0),updated:new Date().toISOString().slice(0,10)},{headers:{'Cache-Control':'public, max-age=3600, s-maxage=21600'}});
    if(cache)ctx.waitUntil(Promise.resolve().then(() => cache.put(key,result.clone())).catch(() => {}));
    return result;
  }catch{return Response.json({error:'calendar_unavailable'},{status:503});}
}
