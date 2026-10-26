module.exports = async (req, res) => {
  // CORS zırhı (Tüm origin ve metodlara izin ver)
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,PATCH');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Tarayıcı/Tauri ön kontrolüne anında onay ver
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    return res.status(500).json({ error: "Sunucuda GITHUB_TOKEN bulunamadı!" });
  }

  try {
    // 1. EĞER İSTEK GET İSE (Repo listeleme / Doğrulama için)
    if (req.method === 'GET') {
      const username = req.query.username || 'bilalhabessimsek';
      
      const githubRes = await fetch(`https://api.github.com/users/${username}/repos?per_page=100`, {
        method: 'GET',
        headers: {
          'Authorization': `token ${token}`,
          'User-Agent': 'Ultimate-Desktop-App',
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      if (!githubRes.ok) {
        const errText = await githubRes.text();
        throw new Error(`GitHub Hatası: ${errText}`);
      }

      const data = await githubRes.json();
      return res.status(200).json({ success: true, data });
    }

    // 2. EĞER İSTEK POST / PATCH İSE (Repo açıklama güncelleme için)
    if (req.method === 'POST' || req.method === 'PATCH') {
      const { username, repo, description } = req.body || {};
      
      const githubRes = await fetch(`https://api.github.com/repos/${username}/${repo}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `token ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'Ultimate-Desktop-App'
        },
        body: JSON.stringify({ description })
      });

      if (!githubRes.ok) {
        const errText = await githubRes.text();
        throw new Error(`GitHub Hatası: ${errText}`);
      }

      const data = await githubRes.json();
      return res.status(200).json({ success: true, data });
    }

    return res.status(405).json({ error: "Desteklenmeyen HTTP metodu." });

  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};