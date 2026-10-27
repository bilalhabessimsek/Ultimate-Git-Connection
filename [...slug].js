module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,PATCH');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    return res.status(500).json({ error: "Sunucuda GITHUB_TOKEN bulunamadı!" });
  }

  try {
    const { slug } = req.query;
    const subPath = slug ? slug.join('/') : '';

    // Güncelleme (POST / PATCH) istekleri için
    if (req.method === 'POST' || req.method === 'PATCH') {
      const { username, repo, description } = req.body || {};
      const targetUser = username || 'bilalhabessimsek';
      const targetRepo = repo || slug?.[1];

      const githubRes = await fetch(`https://api.github.com/repos/${targetUser}/${targetRepo}`, {
        method: req.method,
        headers: {
          'Authorization': `token ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'Ultimate-Desktop-App'
        },
        body: JSON.stringify({ description })
      });

      const data = await githubRes.json();
      return res.status(githubRes.status).json(data);
    }

    // Veri çekme (GET) istekleri için
    const githubUrl = `https://api.github.com/${subPath}`;
    
    const githubRes = await fetch(githubUrl, {
      method: 'GET',
      headers: {
        'Authorization': `token ${token}`,
        'User-Agent': 'Ultimate-Desktop-App',
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    const data = await githubRes.json();
    return res.status(githubRes.status).json(data);

  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};
