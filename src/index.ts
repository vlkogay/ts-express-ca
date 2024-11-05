import start from './app';
import getConfig from './config/config';

const config = getConfig();

start(config);
