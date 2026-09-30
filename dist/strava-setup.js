const form = document.querySelector('#strava-setup');
const fragment = location.hash.slice(1);
if (fragment) { form.elements.setupKey.value = fragment; history.replaceState(null, '', location.pathname); }
form.addEventListener('submit', async event => {
  event.preventDefault();
  const status = document.querySelector('#status');
  const button = form.querySelector('button');
  button.disabled = true;
  status.textContent = 'Connecting…';
  try {
    const response = await fetch('/strava/connect', {method: 'POST', headers: {'content-type': 'application/json'}, body: JSON.stringify(Object.fromEntries(new FormData(form)))});
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Could not connect. Please try again.');
    const target = new URL(data.url);
    if (target.origin !== 'https://www.strava.com') throw new Error('Invalid authorization destination.');
    form.reset();
    location.assign(target.href);
  } catch (error) { status.textContent = error.message; button.disabled = false; }
});
