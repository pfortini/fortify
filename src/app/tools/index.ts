async function sleep(ms: number) {
  return new Promise<void>((resolve, reject) => {
    setTimeout(() => resolve(), ms)
  })
}

function generateRandomString(length: number) {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 0; i < length; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

function queryString(o) {
  const params = new URLSearchParams();
  for (const key in o) params.set(key, o[key]);

	return params.toString();
}

export { sleep, generateRandomString, queryString };
