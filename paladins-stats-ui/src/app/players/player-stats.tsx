'use client'

import { RecentMatch } from '@miguelteran/paladins-api-wrapper';
import { Tab, Tabs } from '@nextui-org/tabs';
import { ChampionStatsSummary } from '@/models/champion-stats-summary';
import { RecentMatchesTable } from './recent-matches-table';
import { PlayerChampionStatsTable } from './player-champion-stats-table';


export const PlayerStats = ({recentMatches, championStats}: {recentMatches: RecentMatch[], championStats: ChampionStatsSummary[]}) => {

    return (
        <div id='player-stats-container'>
            <Tabs>
                <Tab key='recentMatches' title='Recent Matches'>
                    <RecentMatchesTable recentMatches={recentMatches}/>
                </Tab>
                <Tab key='championStats' title='Champion Stats'>
                    <PlayerChampionStatsTable championStats={championStats}/>
                </Tab>
            </Tabs>
        </div>
    );
}
