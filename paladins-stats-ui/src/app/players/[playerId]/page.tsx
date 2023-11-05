import { getPlayer, getMatchHistory, getChampionRanks } from '@miguelteran/paladins-api-wrapper';
import { PlayerStats } from '../player-stats';
import { ChampionStatsSummary } from '@/models/champion-stats-summary';
import { getPercentageString, getTimeString } from '@/util/string-util';
import { getKDARatio, getPercentage } from '@/util/number-util';
import { notFound } from 'next/navigation';
import { PaladinsRoles } from '@/models/role';
import championSummaries from '../../../../public/champion-summaries.json' assert { type: 'json' };


export default async function PlayerPage( { params }: { params: { playerId: string } }) {

    const [player, recentMatches, championStats] = await Promise.all([getPlayer(params.playerId), getMatchHistory(params.playerId), getChampionRanks(params.playerId)]);

    if (!player) {
        notFound();
    }
    
    const totalMatchesPlayed = player.Wins + player.Losses;
    const winRate = getPercentageString(getPercentage(totalMatchesPlayed, player.Wins));
    const timePlayed = getTimeString(player.MinutesPlayed);

    const champions: ChampionStatsSummary[] = championStats.map(champion => {
        const numMatches = champion.Wins + champion.Losses; 
        return {
            championId: champion.champion_id,
            championName: champion.champion,
            championRole: championSummaries.find(c => c.id === Number(champion.champion_id))?.role as PaladinsRoles,
            rank: champion.Rank,
            numberOfMatches: numMatches,
            winRate: getPercentage(numMatches, champion.Wins),
            kda: `${champion.Kills}/${champion.Deaths}/${champion.Assists}`,
            kdaRatio: getKDARatio(champion.Kills, champion.Deaths, champion.Assists),
            minutesPlayed: champion.Minutes
        }
    });

    return (
        <div>
            <img
                src={player.AvatarURL}
                alt="Profile picture"
            />
            <div>{player.Name}</div>
            <div>{player.Title}</div>
            <div>{player.Tier_RankedKBM}</div>
            <div>{player.Last_Login_Datetime}</div>
            <div>{player.Platform}</div>
            <div>{player.Region}</div>
            <div>{player.Level}</div>
            <div>{winRate}</div>
            <div>{totalMatchesPlayed}</div>
            <div>{timePlayed}</div>

            <PlayerStats
                recentMatches={recentMatches}
                championStats={champions}
            />

        </div>
    );
}
