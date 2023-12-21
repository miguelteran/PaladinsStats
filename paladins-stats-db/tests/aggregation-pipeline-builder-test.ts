import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { AggregationPipelineBuilder } from '../src/database/aggregation-pipeline-builder';


describe('AggregationPipelineBuilderTest', () => {

    test('match', async () => {
        const match = {'region': 'Brazil'};
        const pipeline = new AggregationPipelineBuilder().match(match).build();
        assert.deepEqual(pipeline, [{'$match': match}]);
    });

    test('matchRange', async () => {
        const matchField = 'rank';
        const gte = 21;
        const lte = 24;
        const expected = [
            {
                '$match': {
                    'rank': {
                        '$gte': gte, 
                        '$lte': lte
                    }
                }
            }
        ];
        const pipeline = new AggregationPipelineBuilder().matchRange(matchField, gte, lte).build();
        assert.deepEqual(pipeline, expected);
    });

    test('groupedCount', async () => {
        const group = {
            'id': '$championId', 
            'name': '$championName'
        };
        const expected = [{
            '$group': {
                '_id': group, 
                'count': {
                    '$count': {}
                }
            }
        }];
        const pipeline = new AggregationPipelineBuilder().groupedCount(group).build();
        assert.deepEqual(pipeline, expected);
    });

    test('projectIdFieldsToRootLevel', async () => {
        const group = {
            'id': '$championId', 
            'name': '$championName'
        };
        const expected = [
            {
                '$group': {
                    '_id': group, 
                    'count': {
                        '$count': {}
                    }
                }
            },
            {
                '$project': {
                    '_id': 0, 
                    'count': 1,
                    'id': '$_id.id', 
                    'name': '$_id.name'
                }
            }
        ];
        const pipeline = new AggregationPipelineBuilder().groupedCount(group).projectIdFieldsOnRootLevel().build();
        assert.deepEqual(pipeline, expected);
    });

    test('unwind', async () => {
        const unwindPath = '$cards';
        const pipeline = new AggregationPipelineBuilder().unwind(unwindPath).build();
        assert.deepEqual(pipeline, [{'$unwind': {'path': unwindPath}}]);
    });

});
  