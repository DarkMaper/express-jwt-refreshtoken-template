import 'dotenv/config';
import '../database';
import { subDays } from 'date-fns';
import RefreshToken from '../models/RefreshToken';

(async () => {
    const next_week = subDays(new Date(), 7);

    const sessions_with_week_inactivity = await RefreshToken.deleteMany({ last_refresh: { $lt: next_week } });

    process.exit(0);
})()