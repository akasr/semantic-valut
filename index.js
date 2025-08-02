import app from './app.js';
import { info } from './utils/logger.js';

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  info(`Server is running on port ${PORT}`);
});
