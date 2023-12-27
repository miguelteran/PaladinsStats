import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { MatchBuilder } from '../src/database/match-builder';


describe('MatchBuilderTest', () => {

    test('match', async () => {
        const expected = {
            'map': 'Bazaar',
            'championName': 'Io', 
            'rank': {
                '$gte': 21,
                '$lte': 25
            },
            'platforms': {'$in': ['Xbox', 'PS']}
        }
        
        const match = new MatchBuilder()
            .eq('map', 'Bazaar')
            .eq('championName', 'Io')
            .gte('rank', 21)
            .lte('rank', 25)
            .in('platforms', ['Xbox', 'PS'])
            .build();
        
        assert.deepEqual(match, expected);
    });
});
  