import axios from 'axios';

export default async function handler(req, res) {
  try {
    const { data } = await axios.get('https://zenquotes.io/api/random');
    res.status(200).json(data[0]);
  } catch (e) {
    res.status(500).json({ error: e.toString() });
  }
}
