import { handleWorkstation } from './workstation/index.js';
import { githubContributions } from './github.js';
import { handleStrava } from './strava.js';
import { spotify } from './spotify.js';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    try {
      const workstation = await handleWorkstation(request, env);
      if (workstation) return workstation;
      if (url.pathname === '/api/github/contributions') return githubContributions(request, ctx);
      const strava = await handleStrava(request, env, ctx);
      if (strava) return strava;
      if (url.pathname === '/api/spotify') return await spotify(request, env);
      return env.ASSETS.fetch(request);
    } catch (error) {
      console.error(JSON.stringify({event:'api_unavailable'}));
      if (url.pathname.startsWith('/api/')) return Response.json({error: 'temporarily_unavailable'}, {status:503,headers:{'Cache-Control':'no-store'}});
      return new Response('Temporarily unavailable', {status: 503});
    }
  }
};
